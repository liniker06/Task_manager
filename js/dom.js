function getPriorityLabel(priority) {
    const labels = {
        low: 'Низкий',
        medium: 'Средний',
        high: 'Высокий'
    };
    return labels[priority] || '';
}

export function renderTasks(tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = `task ${task.status} priority-${task.priority}`;
        taskElement.dataset.id = task.id;
        taskElement.innerHTML = `
            <div class="task-header">
                <div class="task-meta">
                    <span class="priority-badge ${task.priority}">${getPriorityLabel(task.priority)}</span>
                    <span class="due-date">
                        <svg class="icon" viewBox="0 0 24 24" width="16" height="16">
                            <path fill="currentColor" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
                        </svg>
                        ${new Date(task.dueDate).toLocaleDateString('ru-RU')}
                    </span>
                </div>
                <h3>${task.title}</h3>
            </div>
            <p>${task.description || ''}</p>
            <div class="task-actions">
                <button class="complete-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24">
                        <path fill="currentColor" d="${task.status === 'completed' ? 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14H8v-2h3v2zm0-3H8v-2h3v2zm0-3H8V9h3v2zm4 6h-3V9h3v8zm1-6l-2 3 2 3 2-3-2-3z' : 'M9 16.17L5.53 12.7a.996.996 0 1 0-1.41 1.41l4.18 4.18c.39.39 1.02.39 1.41 0L20.29 7.71a.996.996 0 1 0-1.41-1.41L9 16.17z'}"/>
                    </svg>
                    ${task.status === 'completed' ? 'Вернуть' : 'Выполнить'}
                </button>
                <button class="edit-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                    Изменить
                </button>
                <button class="delete-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                    Удалить
                </button>
            </div>
        `;
        taskList.appendChild(taskElement);
    });
}

export function showError(element, message) {
    const errorSpan = element.nextElementSibling;
    errorSpan.textContent = message;
    element.classList.add('error');
}

export function clearErrors() {
    document.querySelectorAll('.error').forEach(el => {
        el.classList.remove('error');
        el.nextElementSibling.textContent = '';
    });
}