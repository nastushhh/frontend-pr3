# Используем официальный облегчённый образ Node.js на базе Alpine Linux
FROM node:18-alpine

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем package.json и package-lock.json из корня проекта
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем содержимое папки server/
COPY . .

# Указываем порт
EXPOSE 3000

# Запускаем сервер
CMD ["node", "server.js"]
