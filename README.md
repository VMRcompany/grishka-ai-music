# 🎵 Grishka Music - Глобальный сервис потоковой передачи музыки

Полнофункциональное приложение для потоковой передачи и управления музикой с поддержкой плейлистов и избранного.

## ✨ Особенности

- 🎶 Загрузка, прослушивание и управление музикой
- 🎯 Полнотекстовый поиск музыки и публичных плейлистов
- 📋 Создание и управление плейлистами (приватные и публичные)
- ⭐ Система избранного
- 🔄 Синхронизация в реальном времени (WebSocket)
- 🔒 Аутентификация и авторизация
- 📱 Адаптивный дизайн

## 🛠️ Технический стек

**Backend:**
- Node.js + Express.js
- MongoDB
- Socket.IO (реал-тайм обновления)
- Multer (загрузка файлов)

**Frontend:**
- React
- Axios
- Socket.IO клиент

## 🚀 Локальное развертывание

### Требования
- Node.js 14+
- MongoDB локально или MongoDB Atlas

### Установка

1. Клонировать репозиторий:
```bash
git clone https://github.com/VMRcompany/grishka-ai-music.git
cd grishka-ai-music
```

2. Установить зависимости:
```bash
# Сервер
cd server
npm install

# Клиент
cd ../client
npm install
```

3. Создать `.env` файл в `/server`:
```bash
cp ../.env.example .env
```

4. Заполнить переменные окружения в `/server/.env`:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/grishka-music
CORS_ORIGIN=http://localhost:3000
```

5. Запустить сервер:
```bash
cd server
npm run dev
```

6. В новом терминале запустить клиент:
```bash
cd client
npm start
```

Приложение откроется на `http://localhost:3000`

## 🌍 Развертывание на Railway.app (глобально)

Railway.app - самый простой способ развернуть приложение в облаке с поддержкой MongoDB.

### Шаги:

1. **Создать аккаунт** на [railway.app](https://railway.app)

2. **Подключить GitHub репозиторий:**
   - Нажать "New Project" → "Deploy from GitHub"
   - Авторизовать Railway доступ к GitHub
   - Выбрать репозиторий `grishka-ai-music`

3. **Добавить MongoDB:**
   - В Dashboard нажать "Add Service" → "Database" → "MongoDB"
   - Railway автоматически создаст переменную окружения `MONGODB_URI`

4. **Установить переменные окружения:**
   - В Railway Dashboard → Environment переменные добавить:
   ```
   PORT=5000
   NODE_ENV=production
   CORS_ORIGIN=https://your-railway-domain.up.railway.app
   REACT_APP_API_URL=https://your-railway-domain.up.railway.app/api
   REACT_APP_SOCKET_URL=https://your-railway-domain.up.railway.app
   ```

5. **Развернуть:**
   - Railway автоматически развернет при push в main ветку
   - Дождитесь завершения деплоя (видно в логах)
   - Получите URL вроде: `https://your-app-xyz.up.railway.app`

### 📌 Альтернативные платформы:

- **[Render.com](https://render.com)** - похож на Railway
- **[Fly.io](https://fly.io)** - хороший апстрайм
- **[Heroku](https://heroku.com)** - классический вариант

## 📚 API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход

### Музыка
- `GET /api/music` - Получить все треки
- `GET /api/music/search?q=query` - Поиск треков
- `POST /api/music/:musicId/favorites` - Добавить в избранное
- `DELETE /api/music/:musicId/favorites` - Удалить из избранного
- `DELETE /api/music/:musicId` - Удалить трек (только автор)

### Плейлисты
- `GET /api/playlists` - Получить плейлисты пользователя
- `GET /api/playlists/search?q=query` - Поиск публичных плейлистов (без авторизации)
- `POST /api/playlists` - Создать плейлист (с опцией `isPublic`)
- `GET /api/playlists/:id` - Получить плейлист
- `PUT /api/playlists/:id` - Обновить плейлист
- `DELETE /api/playlists/:id` - Удалить плейлист
- `POST /api/playlists/:id/musics` - Добавить трек в плейлист
- `DELETE /api/playlists/:id/musics/:musicId` - Удалить трек из плейлиста

## 🔑 Переменные окружения

Скопируйте `.env.example` и переименуйте в `.env`:

```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/grishka-music

# CORS
CORS_ORIGIN=https://your-domain.com

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# File Upload
MAX_FILE_SIZE=52428800

# React App
REACT_APP_API_URL=https://your-domain.com/api
REACT_APP_SOCKET_URL=https://your-domain.com
```

## 📦 Структура проекта

```
grishka-ai-music/
├── server/              # Node.js + Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── index.js
│   └── package.json
├── client/              # React приложение
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── App.jsx
│   │   └── index.js
│   └── package.json
├── .env.example
├── .gitignore
├── railway.json         # Конфиг для Railway
└── README.md
```

## 🐛 Troubleshooting

### Проблемы с WebSocket
Убедитесь что `CORS_ORIGIN` и `REACT_APP_SOCKET_URL` корректно установлены.

### MongoDB подключение не работает
Проверьте MONGODB_URI и убедитесь что IP белист добавлен в MongoDB Atlas.

###404 при обновлении страницы
Убедитесь что сервер настроен на serve React app для всех GET запросов (смотрите `server/src/index.js`).

## 📝 Лицензия

MIT

## 👨‍💻 Разработчик

[VMRcompany](https://github.com/VMRcompany)
