import { Storage } from './storage.js';
import { UI } from './ui.js';

export class TaskManager {
    constructor() {
        this.tasks = Storage.getTasks();
        this.initEventListeners();
        UI.renderTasks(this.tasks);
    }

    initEventListeners() {
        document.getElementById('taskForm').addEventListener('submit', (e) => this.handleAddTask(e));
        document.getElementById('taskList').addEventListener('click', (e) => this.handleTaskActions(e));
    }

    handleAddTask(e) {
        e.preventDefault();

        const newTask = {
            id: Date.now(),
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            priority: document.getElementById('taskPriority').value,
            dueDate: document.getElementById('taskDueDate').value,
            status: 'todo'
        };

        if (this.validateTask(newTask)) {
            this.tasks.push(newTask);
            Storage.saveTasks(this.tasks);
            UI.renderTasks(this.tasks);
            e.target.reset();
        }
    }

    validateTask(task) {
        let isValid = true;
        const today = new Date().setHours(0,0,0,0);

        // Очищаем предыдущие ошибки
        this.clearValidationErrors();

        // Валидация названия
        if (!task.title.trim()) {
            this.showError('.edit-title', 'Название обязательно');
            isValid = false;
        }

        // Валидация даты
        if (!task.dueDate) {
            this.showError('.edit-date', 'Укажите дату');
            isValid = false;
        } else if (new Date(task.dueDate) < today) {
            this.showError('.edit-date', 'Дата должна быть в будущем');
            isValid = false;
        }

        return isValid;
    }

    showError(selector, message) {
        const field = document.querySelector(selector);
        if (!field) return;

        field.classList.add('error');
        const errorSpan = field.closest('.form-group')?.querySelector('.error-message');
        if (errorSpan) errorSpan.textContent = message;
    }

    clearValidationErrors() {
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    }

    handleTaskActions(e) {
        const taskId = parseInt(e.target.dataset.id);

        if (e.target.classList.contains('delete-btn')) {
            this.deleteTask(taskId);
        }

        if (e.target.classList.contains('edit-btn')) {
            this.editTask(taskId);
        }
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        Storage.saveTasks(this.tasks);
        UI.renderTasks(this.tasks);
    }

    editTask(taskId) {
        // Реализация редактирования
        console.log('Реализуйте редактирование задачи:', taskId);
    }
}