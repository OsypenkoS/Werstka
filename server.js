// server.js

require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios'); // Используем axios для HTTP-запросов

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
const SENDPULSE_TOKEN_URL = 'https://api.sendpulse.com/oauth/access_token';
const SENDPULSE_SEND_EMAIL_URL = 'https://api.sendpulse.com/smtp/emails';

// Переменные для кэширования токена доступа
let sendpulseToken = null;
let tokenExpiresAt = 0;

// Функция для получения и обновления токена доступа
async function getSendpulseToken() {
    // Если у нас есть токен и он еще действителен, возвращаем его
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
        // Устанавливаем время истечения с запасом в 5 минут
        tokenExpiresAt = Date.now() + (expires_in - 300) * 1000;

        console.log('УСПЕХ: Новый токен SendPulse получен.');
        return sendpulseToken;
    } catch (error) {
        console.error('ОШИБКА: Не удалось получить токен SendPulse:', error.response ? error.response.data : error.message);
        return null; // В случае ошибки возвращаем null
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

    try {
        // 1. Получаем действительный токен доступа
        const token = await getSendpulseToken();
        if (!token) {
            throw new Error('Не удалось получить токен аутентификации для SendPulse.');
        }

        // 2. Формируем тело письма в формате, который требует SendPulse
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
                    // !!! Укажите email, который вы подтвердили в SendPulse
                    email: 'ВАШ_ВЕРИФИЦИРОВАННЫЙ_EMAIL@example.com',
                    name: `${firstName} ${lastName}` // Имя отправителя
                },
                to: [
                    {
                        // !!! Укажите ваш личный email, на который должны приходить письма
                        email: 'ВАШ_EMAIL_ДЛЯ_ПОЛУЧЕНИЯ_ПИСЕМ@example.com',
                        name: 'Администратор сайта'
                    }
                ]
            }
        };

        // 3. Отправляем письмо, используя токен в заголовке Authorization
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
// МАРШРУТЫ И ЗАПУСК СЕРВЕРА (остаются без изменений)
// --------------------------------------------------------------------------------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contactform.html'));
});

app.listen(PORT, () => {
  console.log(`Сервер запущен и работает на порту ${PORT}`);
});