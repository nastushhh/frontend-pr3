# Берём минимальный образ nginx
FROM nginx:alpine

# Копируем наш кастомный конфиг nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Переключаем рабочую директорию на папку со статиκой
WORKDIR /usr/share/nginx/html

# Очищаем дефолтные файлы nginx
RUN rm -rf ./*

COPY . .
# Открываем порт 80
EXPOSE 80

# Запускаем nginx как основной процесс
CMD ["nginx", "-g", "daemon off;"]
