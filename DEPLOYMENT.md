# 🚀 Инструкции по деплою Grishka Music

Этот документ содержит пошаговые инструкции развертывания приложения на различные облачные платформы.

## 🏃 Railway.app (Рекомендуется - самое простое)

**Преимущества:**
- ✅ Бесплатный уровень достаточно мощный
- ✅ Интеграция с GitHub (автоматический деплой)
- ✅ Встроенная поддержка MongoDB
- ✅ Быстрая настройка (5 минут)

### Шаги:

1. Перейти на [railway.app](https://railway.app) и создать аккаунт (можно через GitHub)

2. Нажать **"New Project"** → **"Deploy from GitHub"**

3. Авторизовать Railway доступ к вашему GitHub

4. Выбрать репозиторий `grishka-ai-music`

5. Railway автоматически детектирует `railway.json` и начнет деплой

6. **Добавить MongoDB:**
   - В Dashboard нажать **"Add Service"** 
   - Выбрать **"Database"** → **"MongoDB"**
   - Railway создаст переменную `MONGODB_URI` автоматически

7. **Установить переменные окружения:**
   - Перейти в **"Variables"** вашего сервиса
   - Добавить следующие переменные:

```
PORT=5000
NODE_ENV=production
JWT_SECRET=your-super-secret-key-change-this
```

**CORS_ORIGIN и другие будут установлены автоматически после получения URL**

8. После завершения деплоя:
   ```bash
   git push origin main
   ```
   Railway автоматически перезагрузит сервис

9. Получить URL приложения в Railway Dashboard

---

## 📊 Render.com (Альтернатива)

**Преимущества:**
- ✅ Хороший бесплатный уровень
- ✅ Автоматическое переразвертывание с GitHub
- ✅ Поддержка PostgreSQL, MongoDB и других БД
- ⚠️ Требует чуть больше ручной настройки

### Шаги:

1. Перейти на [render.com](https://render.com) и создать аккаунт

2. Нажать **"+ New"** → **"Web Service"**

3. Подключить GitHub репозиторий `grishka-ai-music`

4. Заполнить настройки:
   - **Name:** `grishka-music-api`
   - **Build Command:** `npm install && cd client && npm install && npm run build && cd ..`
   - **Start Command:** `NODE_ENV=production node server/src/index.js`
   - **Plan:** Free (каждый месяц 750 часов)

5. Добавить MongoDB:
   - В Render создать новый MongoDB сервис
   - Скопировать connection string
   - Добавить в Environment Variables как `MONGODB_URI`

6. Установить переменные окружения:
   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=your-secret-key
   ```

7. Нажать **"Create Web Service"**

---

## 🚂 Heroku (Классический вариант)

**Преимущества:**
- Хорошо документирован
- ⚠️ Бесплатный уровень удален (начиная с ноября 2022)
- Требует платный план (от $7/месяц)

### Шаги:

1. Установить [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)

2. Авторизовать:
   ```bash
   heroku login
   ```

3. Создать приложение:
   ```bash
   heroku create grishka-music
   ```

4. Добавить MongoDB Atlas:
   - Создать кластер на [mongodb.com/cloud](https://mongodb.com/cloud)
   - Получить connection string
   - Добавить в Heroku:
   ```bash
   heroku config:set MONGODB_URI="your-connection-string"
   ```

5. Установить переменные:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET="your-secret-key"
   ```

6. Развернуть:
   ```bash
   git push heroku main
   ```

7. Смотреть логи:
   ```bash
   heroku logs --tail
   ```

---

## 🚀 Fly.io (Продвинутый вариант)

**Преимущества:**
- Отличная глобальная сеть
- Хороший бесплатный уровень (до 3 разделяемых машин)
- Быстрая работа по всему миру

### Шаги:

1. Установить [Fly CLI](https://fly.io/docs/getting-started/installing-flyctl/)

2. Авторизовать:
   ```bash
   fly auth login
   ```

3. Инициализировать приложение:
   ```bash
   fly launch
   ```
   Выбрать порт 5000 и регионы поближе к аудитории

4. Добавить MongoDB:
   - Использовать внешний MongoDB (MongoDB Atlas)
   - Добавить в secrets:
   ```bash
   fly secrets set MONGODB_URI="your-connection-string"
   ```

5. Установить переменные:
   ```bash
   fly secrets set NODE_ENV=production
   fly secrets set JWT_SECRET="your-secret-key"
   ```

6. Развернуть:
   ```bash
   fly deploy
   ```

---

## 🔒 Экспортировать переменные окружения

Не забудьте установить в продакшене:

```bash
# Для безопасности ВСЕГДА меняйте на уникальное значение:
JWT_SECRET=your-super-secret-jwt-key-here-change-me

# Корневой URL вашего приложения:
CORS_ORIGIN=https://your-railroad.up.railway.app
REACT_APP_API_URL=https://your-railroad.up.railway.app/api
REACT_APP_SOCKET_URL=https://your-railroad.up.railway.app
```

---

## 📝 MongoDB Atlas Setup (для всех платформ)

Если вы используете MongoDB Atlas в облаке:

1. Перейти на [mongodb.com/cloud](https://mongodb.com/cloud)
2. Создать аккаунт
3. Создать новый Project
4. Создать Cluster (выбрать бесплатный план)
5. Создать Database User (логин/пароль)
6. Получить Connection String в формате:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/grishka-music?retryWrites=true&w=majority
   ```
7. Добавить IP в Network Access (выбрать "Allow Access from Anywhere" для разработки)

---

## ✅ Проверка статуса сервера

После деплоя проверить здоровье сервера:

```bash
curl https://your-domain.com/health
```

Должен вернуть:
```json
{"status":"OK"}
```

---

## 🔄 Обновления и переразвертывание

После изменений в коде:

```bash
git add .
git commit -m "description of changes"
git push origin main
```

Платформы автоматически пересоберут и переразвернут приложение.

---

## 🎯 Итого

**Рекомендуемый путь:**
1. Railway.app для быстрого старта (5 минут)
2. MongoDB Atlas для базы данных
3. GitHub Actions для CI/CD (опционально)

Приложение будет работать глобально и доступно 24/7! 🌍
