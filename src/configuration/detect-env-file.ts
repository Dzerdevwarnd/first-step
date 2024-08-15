import * as dotenv from 'dotenv';

// Загружаем базовый файл .env
dotenv.config({ path: '.env' });

export let envFilePath = '.env'; // Базовый файл по умолчанию

process.env.NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV.trim() : '';

// Проверка и установка пути к файлу в зависимости от NODE_ENV/////
if (process.env.NODE_ENV == 'testing') {
  envFilePath = '.env.testing';
} else if (process.env.NODE_ENV === 'development') {
  envFilePath = '.env.development';
} else if (process.env.NODE_ENV === 'production') {
  envFilePath = '.env.production';
}

// Загружаем файл соответствующий текущему окружению
dotenv.config({ path: envFilePath });

console.log(`Using environment file: ${envFilePath}`);
