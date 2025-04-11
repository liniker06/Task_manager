import { fetchTasks, saveTask, updateTask, deleteTask } from './api.js';
import { getTasksFromStorage, saveTasksToStorage } from './storage.js';
import { renderTasks, showError, clearErrors } from './dom.js';

class TaskManager {
    constructor() {
        this.tasks = [];
        this.init();
    }

    async init() {
        try {
            this.tasks = await fetchTasks();
        } catch (error) {
            this.tasks = getTasksFromStorage();
        }
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        document.getElementById('taskForm').addEventListener('submit', this.handleSubmit.bind(this));
        document.getElementById('taskList').addEventListener('click', this.handleTaskActions.bind(this));
        document.getElementById('filterStatus').addEventListener('change', () => this.render());
        document.getElementById('filterPriority').addEventListener('change', () => this.render());
    }

    async handleSubmit(e) {
        e.preventDefault();
        clearErrors();

        const newTask = {
            id: Date.now().toString(),
            title: document.getElementById('taskTitle').value.trim(),
            description: document.getElementById('taskDescription').value.trim(),
            priority: document.getElementById('taskPriority').value,
            dueDate: document.getElementById('taskDueDate').value,
            status: 'in-progress'
        };

        console.log('Попытка добавления задачи:', newTask); // Логирование

        if (!this.validateTask(newTask)) {
            console.log('Валидация не пройдена');
            return;
        }

        try {
            // Попытка сохранения через API
            await saveTask(newTask);
            console.log('Успешное сохранение через API');
        } catch (error) {
            console.log('Ошибка API, сохраняем локально:', error);
        }

        // Всегда сохраняем в LocalStorage
        this.tasks.push(newTask);
        saveTasksToStorage(this.tasks);
        this.render();
        e.target.reset();

        console.log('Задача добавлена в LocalStorage:', newTask); // Логирование
    }

    validateTask(task) {
        const errors = [];
        const today = new Date().setHours(0,0,0,0);

        // Очистка предыдущих ошибок
        this.clearValidationErrors();

        // Валидация названия
        if (!task.title.trim()) {
            errors.push('Название задачи обязательно');
            this.markFieldError('.edit-title', 'Заполните это поле');
        }

        // Валидация даты
        if (!task.dueDate) {
            errors.push('Укажите срок выполнения');
            this.markFieldError('.edit-date', 'Заполните это поле');
        } else {
            const dueDate = new Date(task.dueDate).setHours(0,0,0,0);
            if (dueDate < today) {
                errors.push('Дата должна быть в будущем');
                this.markFieldError('.edit-date', 'Выберите будущую дату');
            }
        }

        if (errors.length > 0) {
            this.showErrorNotification(errors.join('<br>'));
            return false;
        }

        return true;
    }

    markFieldError(selector, message) {
        const field = document.querySelector(selector);
        if (!field) return;

        field.classList.add('error');
        const errorSpan = field.closest('.form-group')?.querySelector('.error-message');
        if (errorSpan) errorSpan.innerHTML = message;
    }
    clearValidationErrors() {
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        document.querySelectorAll('.error-message').forEach(el => el.innerHTML = '');
    }

    showErrorNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
        <div class="notification-content">
            <p>${message}</p>
            <button class="close-notification">×</button>
        </div>
    `;

        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.remove();
        });

        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 5000);
    }
    render() {
        const filteredTasks = this.tasks.filter(task => {
            const statusMatch = document.getElementById('filterStatus').value === 'all' ||
                task.status === document.getElementById('filterStatus').value;
            const priorityMatch = document.getElementById('filterPriority').value === 'all' ||
                task.priority === document.getElementById('filterPriority').value;
            return statusMatch && priorityMatch;
        });
        renderTasks(filteredTasks);
    }

    handleTaskActions(e) {
        const taskElement = e.target.closest('.task');
        if (!taskElement) return;

        const taskId = taskElement.dataset.id;
        const task = this.tasks.find(t => t.id === taskId);

        if (e.target.classList.contains('delete-btn')) {
            this.deleteTask(taskId);
        } else if (e.target.classList.contains('complete-btn')) {
            this.toggleTaskStatus(taskId);
        } else if (e.target.classList.contains('edit-btn')) {
            this.enableEditMode(taskElement);
        }
        if (!e.target.classList.contains('delete-btn')) return;


        if (confirm('Вы уверены, что хотите удалить задачу?')) {
            this.deleteTask(taskId);
        }
    }


    async deleteTask(taskId) {
        try {
            const taskElement = document.querySelector(`[data-id="${taskId}"]`);
            if (taskElement) {
                taskElement.classList.add('removing');
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            await deleteTask(taskId);
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            saveTasksToStorage(this.tasks);
            this.render();

        } catch (error) {
            taskElement?.classList.remove('removing');
            console.error('Ошибка удаления:', error);
        }
    }

    toggleTaskStatus(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        task.status = task.status === 'completed' ? 'in-progress' : 'completed';
        saveTasksToStorage(this.tasks);
        this.render();
    }

    enableEditMode(taskElement) {
        const taskId = taskElement.dataset.id;
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);

        if (taskIndex === -1) {
            console.error('Задача не найдена');
            return;
        }

        const task = this.tasks[taskIndex];
        const self = this;

        // Создаем клон задачи для безопасного редактирования
        const editableTask = { ...task };

        // Шаблон формы редактирования
        const editFormHTML = `
        <form class="edit-form">
            <div class="form-group">
                <input type="text" class="edit-title" value="${editableTask.title}" required>
                <span class="error-message"></span>
            </div>
            <div class="form-group">
                <textarea class="edit-description">${editableTask.description}</textarea>
            </div>
            <div class="form-group">
                <select class="edit-priority">
                    ${['low', 'medium', 'high'].map(priority => `
                        <option value="${priority}" ${priority === editableTask.priority ? 'selected' : ''}>
                            ${this.getPriorityLabel(priority)}
                        </option>
                    `).join('')}
                </select>
            </div>
            <div class="form-group">
                <input type="date" class="edit-date" value="${editableTask.dueDate}" required>
                <span class="error-message"></span>
            </div>
            <div class="form-actions">
                <button class="save-btn" type="submit">
                    <svg viewBox="0 0 24 24">
                        <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                    </svg>
                    Сохранить
                </button>
                
                <button class="cancel-btn" type="button">
                    <svg viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                    Отмена
                </button>
            </div>
        </form>
    `;

        // Встраиваем форму в DOM
        taskElement.innerHTML = editFormHTML;
        const editForm = taskElement.querySelector('form');

        // Обработчик отправки формы
        const handleSubmit = async (e) => {
            e.preventDefault();

            try {
                // Собираем обновленные данные
                const updatedData = {
                    title: editForm.querySelector('.edit-title').value.trim(),
                    description: editForm.querySelector('.edit-description').value.trim(),
                    priority: editForm.querySelector('.edit-priority').value,
                    dueDate: editForm.querySelector('.edit-date').value
                };

                console.log('Попытка сохранения:', updatedData);

                // Валидация
                if (!this.validateTask(updatedData)) {
                    console.log('Валидация не пройдена');
                    return;
                }

                // Обновляем задачу
                const updatedTask = { ...editableTask, ...updatedData };

                // 1. Обновляем локальные данные
                this.tasks[taskIndex] = updatedTask;
                saveTasksToStorage(this.tasks);

                // 2. Пытаемся синхронизировать с сервером
                try {
                    await updateTask(updatedTask);
                    console.log('Успешная синхронизация с сервером');
                } catch (apiError) {
                    console.warn('Ошибка синхронизации:', apiError.message);
                }

                // 3. Перерисовываем интерфейс
                this.render();

            } catch (error) {
                console.error('Критическая ошибка:', error);
                this.showErrorNotification('Не удалось сохранить изменения');
            }
        };

        // Назначаем обработчики
        editForm.addEventListener('submit', handleSubmit.bind(this));
        editForm.querySelector('.cancel-btn').addEventListener('click', () => this.render());
    }

// Вспомогательная функция для меток приоритета
    getPriorityLabel(priority) {
        const labels = { low: 'Низкий', medium: 'Средний', high: 'Высокий' };
        return labels[priority] || '';
    }
}

new TaskManager();