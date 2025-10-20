// server.js

require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


// --------------------------------------------------------------------------------
// КОНФИГУРАЦИЯ SENDPULSE API
// --------------------------------------------------------------------------------
const SENDPULSE_API_ID = process.env.SENDPULSE_API_ID;
const SENDPULSE_API_SECRET = process.env.SENDPULSE_API_SECRET;
const VERIFIED_SENDER_EMAIL = process.env.VERIFIED_SENDER_EMAIL; // <--- ИЗМЕНЕНИЕ ЗДЕСЬ: Подтягиваем новый email из env

const SENDPULSE_TOKEN_URL = 'https://api.sendpulse.com/oauth/access_token';
const SENDPULSE_SEND_EMAIL_URL = 'https://api.sendpulse.com/smtp/emails';

let sendpulseToken = null;
let tokenExpiresAt = 0;

async function getSendpulseToken() {
    if (sendpulseToken && Date.now() < tokenExpiresAt) {
        return sendpulseToken;
    }

    console.log('Токен устарел или отсутствует, запрашиваем новый...');
    try {
        const response = await axios.post(SENDPULSE_TOKEN_URL, {
            grant_type: 'client_credentials',
            client_id: SENDPULSE_API_ID,
            client_secret: SENDPULSE_API_SECRET,
        });

        const { access_token, expires_in } = response.data;
        sendpulseToken = access_token;
        tokenExpiresAt = Date.now() + (expires_in - 300) * 1000;

        console.log('УСПЕХ: Новый токен SendPulse получен.');
        return sendpulseToken;
    } catch (error) {
        console.error('ОШИБКА: Не удалось получить токен SendPulse:', error.response ? error.response.data : error.message);
        return null;
    }
}


// --------------------------------------------------------------------------------
// API МАРШРУТ ДЛЯ ОБРАБОТКИ ФОРМЫ
// --------------------------------------------------------------------------------
app.post('/api/contact', async (req, res) => {
    const { firstName, lastName, email, phone, message } = req.body;

    if (!firstName || !lastName || !email || !message) {
        return res.status(400).json({ success: false, message: 'Пожалуйста, заполните все обязательные поля.' });
    }

    // Проверка, что верифицированный email был загружен из переменных окружения
    if (!VERIFIED_SENDER_EMAIL) {
        console.error('ОШИБКА: Переменная окружения VERIFIED_SENDER_EMAIL не установлена!');
        return res.status(500).json({ success: false, message: 'Ошибка конфигурации сервера: не указан email отправителя.' });
    }

    try {
        const token = await getSendpulseToken();
        if (!token) {
            throw new Error('Не удалось получить токен аутентификации для SendPulse.');
        }

        const emailData = {
            email: {
                html: `
                    <h2>Новое сообщение с контактной формы на сайте:</h2>
                    <hr>
                    <p><strong>Имя:</strong> ${firstName} ${lastName}</p>
                    <p><strong>Email для ответа:</strong> <a href="mailto:${email}">${email}</a></p>
                    <p><strong>Телефон:</strong> ${phone || 'Не указан'}</p>
                    <h3>Сообщение:</h3>
                    <p>${message}</p>
                    <hr>
                `,
                subject: `Новое сообщение с вашего сайта от ${firstName} ${lastName}`,
                from: {
                    // <--- ИЗМЕНЕНИЕ ЗДЕСЬ: Используем email из переменных окружения
                    email: VERIFIED_SENDER_EMAIL,
                    name: `Форма с сайта`
                },
                to: [
                    {
                        email: 'ВАШ_EMAIL_ДЛЯ_ПОЛУЧЕНИЯ_ПИСЕМ@example.com', // <-- Замените на свой email
                        name: 'Администратор сайта'
                    }
                ]
            }
        };

        await axios.post(SENDPULSE_SEND_EMAIL_URL, emailData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('УСПЕХ: Письмо успешно отправлено через SendPulse.');
        res.status(200).json({ success: true, message: 'Сообщение успешно отправлено!' });

    } catch (error) {
        console.error('ОШИБКА: Не удалось отправить письмо через SendPulse:', error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, message: 'Произошла внутренняя ошибка при отправке сообщения.' });
    }
});


// --------------------------------------------------------------------------------
// МАРШРУТЫ И ЗАПУСК СЕРВЕРА
// --------------------------------------------------------------------------------
app.get('/', (req, res) => {
  // <--- ИЗМЕНЕНИЕ ЗДЕСЬ: Указываем новый HTML файл
  res.sendFile(path.join(__dirname, 'public', 'contactform.html'));
});

app.listen(PORT, () => {
  console.log(`Сервер запущен и работает на порту ${PORT}`);
});