/**
 * 待办事项应用
 * 使用 localStorage 进行数据持久化存储
 */

// 存储数据的键名
const STORAGE_KEY = 'myTodos';

/**
 * 初始化应用
 */
document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    renderTodos();

    // 添加回车键提交功能（仅在标题输入框中）
    const titleInput = document.getElementById('todo-input');
    titleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            // 如果描述框有焦点，不提交
            if (document.activeElement.id !== 'todo-input') return;
            addTodo();
        }
    });
});

/**
 * 从 localStorage 加载待办事项
 * @returns {Array} 待办事项数组
 */
function loadTodos() {
    try {
        const storedTodos = localStorage.getItem(STORAGE_KEY);
        return storedTodos ? JSON.parse(storedTodos) : [];
    } catch (error) {
        console.error('读取数据失败:', error);
        return [];
    }
}

/**
 * 保存待办事项到 localStorage
 * @param {Array} todos - 待办事项数组
 */
function saveTodos(todos) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
        updateStats(todos);
    } catch (error) {
        console.error('保存数据失败:', error);
        alert('保存失败，可能是存储空间已满！');
    }
}

/**
 * 添加新的待办事项
 */
function addTodo() {
    const titleInput = document.getElementById('todo-input');
    const descInput = document.getElementById('todo-description');
    const dateInput = document.getElementById('todo-date');

    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    const dueDate = dateInput.value;

    if (!title) {
        alert('请输入待办事项标题！');
        return;
    }

    const todos = loadTodos();
    const newTodo = {
        id: Date.now(),          // 使用时间戳作为唯一ID
        title: title,            // 待办事项标题
        description: description, // 待办事项描述
        completed: false,        // 是否完成
        createdAt: new Date().toISOString(),  // 创建时间
        dueDate: dueDate         // 截止日期
    };

    todos.push(newTodo);
    saveTodos(todos);
    renderTodos();

    // 清空输入框
    titleInput.value = '';
    descInput.value = '';
    dateInput.value = '';
    titleInput.focus();     // 重新聚焦标题输入框
}

/**
 * 切换待办事项的完成状态
 * @param {number} id - 待办事项的ID
 */
function toggleTodo(id) {
    const todos = loadTodos();
    const todo = todos.find(t => t.id === id);

    if (todo) {
        todo.completed = !todo.completed;
        saveTodos(todos);
        renderTodos();
    }
}

/**
 * 删除待办事项
 * @param {number} id - 待办事项的ID
 */
function deleteTodo(id) {
    if (confirm('确定要删除这个待办事项吗？')) {
        const todos = loadTodos();
        const newTodos = todos.filter(t => t.id !== id);
        saveTodos(newTodos);
        renderTodos();
    }
}

/**
 * 更新统计信息
 * @param {Array} todos - 待办事项数组
 */
function updateStats(todos) {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;

    // 计算逾期任务（未完成且已过截止日期）
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdue = todos.filter(t => {
        if (t.completed || !t.dueDate) return false;
        const dueDate = new Date(t.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
    }).length;

    document.getElementById('total-count').textContent = `总计: ${total}`;
    document.getElementById('completed-count').textContent = `已完成: ${completed}`;
    document.getElementById('overdue-count').textContent = `已逾期: ${overdue}`;
}

/**
 * 格式化日期显示
 * @param {string} dateString - ISO 格式的日期字符串
 * @returns {Object} 包含格式化文本和状态类的对象
 */
function formatDateDisplay(dateString) {
    if (!dateString) return { text: '', className: '' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));

    let className = '';
    let text = '';

    if (diffDays < 0) {
        className = 'overdue-date';
        text = `🔴 已逾期 ${Math.abs(diffDays)} 天`;
    } else if (diffDays === 0) {
        className = 'today';
        text = '🟡 今天截止';
    } else if (diffDays === 1) {
        className = 'future';
        text = `🟢 明天截止`;
    } else {
        className = 'future';
        text = `📅 ${dateString} (剩余 ${diffDays} 天)`;
    }

    return { text, className };
}

/**
 * 检查任务是否逾期
 * @param {Object} todo - 待办事项对象
 * @returns {boolean} 是否逾期
 */
function isOverdue(todo) {
    if (todo.completed || !todo.dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(todo.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
}

/**
 * 渲染待办事项列表
 */
function renderTodos() {
    const list = document.getElementById('todo-list');
    const todos = loadTodos();

    list.innerHTML = '';

    // 空状态提示
    if (todos.length === 0) {
        list.innerHTML = '<li class="empty-state">还没有待办事项，添加一个吧！</li>';
        updateStats([]);
        return;
    }

    // 按创建时间排序（最新的在前面）
    todos.sort((a, b) => b.id - a.id);

    todos.forEach(todo => {
        const li = document.createElement('li');

        // 设置样式类
        if (todo.completed) {
            li.classList.add('completed');
        } else if (isOverdue(todo)) {
            li.classList.add('overdue');
        }

        // 创建头部（标题和状态）
        const headerDiv = document.createElement('div');
        headerDiv.className = 'todo-header';

        const titleSpan = document.createElement('span');
        titleSpan.className = 'todo-title';
        titleSpan.textContent = todo.title;

        headerDiv.appendChild(titleSpan);

        // 创建元数据区域（日期等）
        const metaDiv = document.createElement('div');
        metaDiv.className = 'todo-meta';

        // 显示截止日期
        if (todo.dueDate) {
            const dateDisplay = formatDateDisplay(todo.dueDate);
            const dateSpan = document.createElement('span');
            dateSpan.className = `todo-date ${dateDisplay.className}`;
            dateSpan.textContent = dateDisplay.text;
            metaDiv.appendChild(dateSpan);
        }

        // 显示描述（如果有）
        if (todo.description) {
            const descDiv = document.createElement('div');
            descDiv.className = 'todo-description';
            descDiv.textContent = todo.description;
            li.appendChild(descDiv);
        }

        // 创建操作按钮容器
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'todo-actions';

        // 创建删除按钮
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '🗑️ 删除';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();  // 阻止事件冒泡
            deleteTodo(todo.id);
        };

        actionsDiv.appendChild(deleteBtn);

        // 组装所有元素
        li.appendChild(headerDiv);
        li.appendChild(metaDiv);
        li.appendChild(actionsDiv);

        // 点击切换状态
        li.onclick = (e) => {
            // 如果点击的是按钮，不切换状态
            if (e.target.tagName === 'BUTTON') return;
            toggleTodo(todo.id);
        };

        list.appendChild(li);
    });

    updateStats(todos);
}

/**
 * 清空所有待办事项（开发者功能）
 */
function clearAllTodos() {
    if (confirm('确定要清空所有待办事项吗？此操作不可恢复！')) {
        localStorage.removeItem(STORAGE_KEY);
        renderTodos();
    }
}
