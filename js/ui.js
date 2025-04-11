export const UI = {
    renderTasks(tasks) {
        const container = document.getElementById('taskList');
        container.innerHTML = '';

        tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = 'task-item';
            taskElement.innerHTML = `
                <h3>${task.title}</h3>
                <p>${task.description}</p>
                <div class="task-meta">
                    <span>Приоритет: ${task.priority}</span>
                    <span>Срок: ${task.dueDate}</span>
                    <span>Статус: ${task.status}</span>
                </div>
                <div class="task-actions">
                    <button class="edit-btn" data-id="${task.id}">Редактировать</button>
                    <button class="delete-btn" data-id="${task.id}">Удалить</button>
                </div>
            `;
            container.appendChild(taskElement);
        });
    }
};