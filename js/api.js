const API_URL = 'https://your-api-endpoint.com/tasks';

export async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Ошибка загрузки задач');
        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function saveTask(task) {
    // Для локальной работы без сервера
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Имитируем 50% вероятность ошибки для теста
            Math.random() > 0.5 ? resolve(task) : reject(new Error('Сервер недоступен'));
        }, 100);
    });

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(task)
        });
        if (!response.ok) throw new Error('Ошибка сохранения');
        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function updateTask(task) {
    try {
        // Для работы с LocalStorage
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Задача обновлена локально:', task);
                resolve(task);
            }, 100);
        });

        const response = await fetch(`${API_URL}/${task.id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(task)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Update error:', error);
        throw error;
    }
}

export async function deleteTask(taskId) {
    try {
        // Для работы с LocalStorage
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Задача удалена из API:', taskId);
                resolve(true);
            }, 100);
        });

        const response = await fetch(`${API_URL}/${taskId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Ошибка удаления');
        return true;
    } catch (error) {
        console.error('Delete error:', error);
        throw error;
    }
}