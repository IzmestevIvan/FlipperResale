# FlipperMarket — Инструкция по запуску

## Требования
- Node.js 20+
- PostgreSQL 15+ (или Docker)

---

## Локальный запуск (dev)

### 1. Установить зависимости
```bash
npm install
```

### 2. Настроить переменные окружения
```bash
cp .env.example .env
# Отредактируйте .env — укажите DATABASE_URL и NEXTAUTH_SECRET
```

Сгенерировать NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 3. Запустить PostgreSQL (через Docker)
```bash
docker run -d \
  --name flipper-db \
  -e POSTGRES_USER=flipper \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=flippermarket \
  -p 5432:5432 \
  postgres:16-alpine
```

### 4. Применить миграции и запустить
```bash
npm run db:push        # создаёт таблицы
npm run dev            # запускает на http://localhost:3000
```

---

## Деплой на VPS (Docker Compose)

```bash
# Клонировать репозиторий на VPS
git clone ... && cd flipper-market

# Создать .env
cp .env.example .env
# Установить NEXTAUTH_SECRET и POSTGRES_PASSWORD

# Запустить
cd docker
docker compose up -d --build

# Приложение будет на порту 3000
# Рекомендуется поставить Nginx перед ним с SSL
```

### Nginx config (пример)
```nginx
server {
    listen 80;
    server_name yourdomain.ru;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.ru;

    ssl_certificate /etc/letsencrypt/live/yourdomain.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.ru/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Структура приложения

```
src/
├── app/
│   ├── page.tsx                  # Главная — список свежих объявлений
│   ├── search/page.tsx           # Поиск с фильтрами
│   ├── listing/[id]/page.tsx     # Страница объявления
│   ├── listings/new/page.tsx     # Создание объявления
│   ├── chat/page.tsx             # Чат (список диалогов + переписка)
│   ├── profile/page.tsx          # Профиль пользователя
│   ├── (auth)/login              # Вход
│   ├── (auth)/register           # Регистрация
│   └── api/                      # REST API
├── components/
│   ├── ui/                       # Button, Input, Badge
│   ├── layout/                   # Header
│   ├── listing/                  # ListingCard, SearchFilters, ImageUploader
│   └── chat/                     # ChatWindow
├── lib/
│   ├── auth.ts                   # NextAuth config
│   ├── prisma.ts                 # Prisma client
│   └── utils.ts                  # Утилиты (formatPrice, cn)
└── prisma/
    └── schema.prisma             # Схема БД
```

## Что реализовано

- ✅ Регистрация / вход (email + пароль)
- ✅ Объявления: создание, просмотр, редактирование, удаление
- ✅ Загрузка фотографий (drag & drop, до 8 штук)
- ✅ Поиск по тексту, фильтры по состоянию / городу / цене
- ✅ Чат между покупателем и продавцом
- ✅ Профиль продавца с рейтингом
- ✅ Docker Compose для деплоя на VPS

## Что можно добавить позже

- Push-уведомления о новых сообщениях (Socket.io)
- Система отзывов (API уже есть в схеме)
- Telegram-уведомления
- Избранные объявления
- Верификация телефона через SMS
