// server.js

// Загрузка переменных окружения (для локальной разработки)
require('dotenv').config();

// Импорт необходимых библиотек
const express = require('express');
const path = require('path');
const cors = require('cors');
// Импортируем официальную библиотеку SendGrid
const sgMail = require('@sendgrid/mail');

// Инициализация Express приложения
const app = express();
const PORT = process.env.PORT || 3000;

// --------------------------------------------------------------------------------
// MIDDLEWARE
// --------------------------------------------------------------------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


// --------------------------------------------------------------------------------
// КОНФИГУРАЦИЯ SENDGRID API
// --------------------------------------------------------------------------------
// Устанавливаем API-ключ, который библиотека будет использовать для всех запросов.
// Он берется из переменных окружения на Render.
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
console.log("УСПЕХ: API-ключ SendGrid установлен.");


// --------------------------------------------------------------------------------
// API МАРШРУТ ДЛЯ ОБРАБОТКИ ФОРМЫ
// --------------------------------------------------------------------------------
app.post('/api/contact', async (req, res) => { // <-- Обратите внимание на async
    const { firstName, lastName, email, phone, message } = req.body;

    if (!firstName || !lastName || !email || !message) {
        return res.status(400).json({ success: false, message: 'Пожалуйста, заполните все обязательные поля.' });
    }

    // Создаем объект сообщения (msg) в формате, который требует @sendgrid/mail
    const msg = {
        // !!! Укажите ваш личный email, на который должны приходить письма
        to: 'umbra5114@gmail.com',

        // !!! Укажите email, который вы подтвердили в SendGrid как "Sender"
        from: 'test@gmail.com',

        // Полезная опция: когда вы нажмете "Ответить" в письме, ответ пойдет пользователю
        reply_to: email,

        subject: `Новое сообщение с вашего сайта от ${firstName} ${lastName}`,
        html: `
            <h2>Новое сообщение с контактной формы на сайте:</h2>
            <hr>
            <p><strong>Имя:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email для ответа:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Телефон:</strong> ${phone || 'Не указан'}</p>
            <h3>Сообщение:</h3>
            <p>${message}</p>
            <hr>
        `
    };

    // Используем try/catch для обработки асинхронных операций
    try {
        await sgMail.send(msg); // Отправляем сообщение
        console.log('УСПЕХ: Письмо успешно отправлено через SendGrid Web API.');
        res.status(200).json({ success: true, message: 'Сообщение успешно отправлено!' });
    } catch (error) {
        console.error('ОШИБКА: Не удалось отправить письмо через SendGrid Web API:', error);
        // Если у ошибки есть детали от SendGrid, выводим их
        if (error.response) {
            console.error(error.response.body);
        }
        res.status(500).json({ success: false, message: 'Произошла внутренняя ошибка при отправке сообщения.' });
    }
});


// --------------------------------------------------------------------------------
// МАРШРУТЫ И ЗАПУСК СЕРВЕРА (остаются без изменений)
// --------------------------------------------------------------------------------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'project_management.html'));
});

app.listen(PORT, () => {
  console.log(`Сервер запущен и работает на порту ${PORT}`);
});