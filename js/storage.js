const STORAGE_KEY = 'tasks';

export function getTasksFromStorage() {
    try {
        const tasks = localStorage.getItem(STORAGE_KEY);
        return tasks ? JSON.parse(tasks) : [];
    } catch (e) {
        console.error('Ошибка чтения:', e);
        return [];
    }
}

export function saveTasksToStorage(tasks) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
        console.error('Ошибка записи:', e);
    }
}