// Загрузка переменных окружения из .env файла
require('dotenv').config();

const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer'); // Подключаем Nodemailer

const app = express();
const PORT = process.env.PORT || 3000;

// --------------------------------------------------------------------------------
// MIDDLEWARE
// --------------------------------------------------------------------------------
// Для парсинга JSON-запросов (когда клиент отправляет JSON)
app.use(express.json());
// Для парсинга URL-encoded запросов (если форма отправляется без JS, или с методом post)
app.use(express.urlencoded({ extended: true }));
// Для отдачи статических файлов (HTML, CSS, JS, изображения) из папки 'public'
app.use(express.static(path.join(__dirname, 'public')));


// --------------------------------------------------------------------------------
// КОНФИГУРАЦИЯ NODEMAILER
// --------------------------------------------------------------------------------
// Создаем "транспортер" для отправки писем.
// Здесь указываются данные SMTP-сервера, через который будут отправляться письма.
const transporter = nodemailer.createTransport({
    service: 'gmail', // Используем Gmail. Можешь заменить на 'outlook', 'yahoo', или настроить свой SMTP host/port.
    auth: {
        user: process.env.EMAIL_USER,    // Твой email адрес из файла .env
        pass: process.env.EMAIL_PASS    // Твой пароль приложения Gmail из файла .env
    }
});

// Проверка соединения с SMTP-сервером (для отладки)
transporter.verify(function(error, success) {
  if (error) {
    console.error("Ошибка при подключении к SMTP-серверу:", error);
  } else {
    console.log("SMTP-сервер готов принимать сообщения");
  }
});


// --------------------------------------------------------------------------------
// API МАРШРУТЫ
// --------------------------------------------------------------------------------

// API маршрут для обработки контактной формы
app.post('/api/contact', (req, res) => {
  // Извлекаем данные из тела запроса
  const { firstName, lastName, email, phone, message } = req.body;

  // Простая валидация: проверяем, что обязательные поля не пустые
  if (!firstName || !lastName || !email || !message) {
    return res.status(400).json({ success: false, message: 'Пожалуйста, заполните все обязательные поля: Имя, Фамилия, Email, Сообщение.' });
  }

  // Опции для письма
  const mailOptions = {
      from: process.env.EMAIL_USER, // От кого: email, указанный в .env
      to: 'umbra51145@gmail.com', // <--- КУДА ДОЛЖНЫ ПРИХОДИТЬ СООБЩЕНИЯ С ФОРМЫ (твой личный email или email поддержки)
      subject: `Новое сообщение с сайта от ${firstName} ${lastName}`, // Тема письма
      html: `
          <h3>Новое сообщение с контактной формы:</h3>
          <p><strong>Имя:</strong> ${firstName}</p>
          <p><strong>Фамилия:</strong> ${lastName}</p>
          <p><strong>Email отправителя:</strong> ${email}</p>
          <p><strong>Телефон:</strong> ${phone || 'Не указан'}</p>
          <p><strong>Сообщение:</strong></p>
          <p>${message}</p>
      `
  };

  // Отправляем письмо с помощью Nodemailer
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.error('Ошибка отправки письма:', error);
          // Отправляем ответ об ошибке клиенту
          return res.status(500).json({ success: false, message: 'Не удалось отправить сообщение.', error: error.message });
      }
      console.log('Письмо успешно отправлено:', info.response);
      // Отправляем ответ об успехе клиенту
      res.status(200).json({ success: true, message: 'Сообщение успешно отправлено!' });
  });
});


// --------------------------------------------------------------------------------
// МАРШРУТЫ ДЛЯ СТРАНИЦ
// --------------------------------------------------------------------------------

// Главная страница - показываем project_management.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contactform.html'));
});

// Домашняя страница (предположим, что это project_management.html)
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contactform.html'));
});

// Страница онлайн платежей (предположим, что это audits.html)
app.get('/online-payment', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contactform.html'));
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Доступен по адресу: http://localhost:${PORT}`);
});