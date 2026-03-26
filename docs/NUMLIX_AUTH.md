# Numlix: единая авторизация (JWT + httpOnly cookies + поддомены)

Документ описывает **текущую** архитектуру auth в монорепозитории: бэкенд `calc-hub-back`, фронты `numlix-main`, `numlix-panel`, `numlix-admin`, пакет `@numlix/auth-shared`, локальный reverse proxy (Caddy), переменные окружения и типичные сбои.

**Цель:** один логин на `*.numlix.local`, сессия через **куки** (refresh + access в httpOnly) и **Bearer** в памяти JS, запросы к API с `credentials: "include"`.

---

## 1. Компоненты и роли

| Компонент | Стек | Порт (dev, без прокси) | За Caddy (TLS) |
|-----------|------|-------------------------|----------------|
| `numlix-main` | Next.js 16 | 3000 | `https://numlix.local` |
| `numlix-panel` | Vite + React | 8081 | `https://panel.numlix.local` |
| `numlix-admin` | Vite + React | 8082 | `https://admin.numlix.local` |
| `calc-hub-back` | NestJS | 3001 | `https://api.numlix.local` |

**Пакеты:**

- **`packages/auth-shared`** — `AuthProvider`, `useAuth`, `login` / `register` / `refreshSession` / `logout` / `getMe` / `bootstrapSession`, `getAuthApiBaseUrl`, `getDomainRoutes`, `normalizeApiBaseUrlForBrowser`, in-memory `accessToken` (`token-store.ts`).
- **`packages/admin-shared`** — `AdminGuard`, `useAuth` (обёртка над shared), ссылки «на главную» через `getDomainRoutes()`.

**Важно:** фронты подключают `@numlix/auth-shared` через **alias на исходники** (`src/index.ts`), а не только через `dist` — см. `vite.config.ts` / `next.config.ts`.

---

## 2. Бэкенд (`apps/calc-hub-back`)

### 2.1. Префикс API

В `main.ts`: `app.setGlobalPrefix('api')`.  
Контроллер `@Controller('auth')` → публичные пути вида **`/api/auth/login`**, **`/api/auth/register`**, **`/api/auth/refresh`**, **`/api/auth/me`**, **`/api/auth/logout`**.

Клиент `@numlix/auth-shared` вызывает URL **`${baseUrl}/api/auth/...`**, где `baseUrl` — происхождение API **без** завершающего слэша (например `https://api.numlix.local`).

### 2.2. CORS

- `app.enableCors({ origin: список из CORS_ORIGINS, credentials: true })`.
- В **`.env`** перечислите **все** origin’ы фронтов, с которых идёт браузерный `fetch` с куками: как минимум `https://numlix.local`, `https://panel.numlix.local`, `https://admin.numlix.local` (и при необходимости `http://localhost:3000`, `http://localhost:8081` и т.д. для чистого localhost без Caddy).
- Строка `CORS_ORIGINS` — **через запятую**, без лишних пробелов вокруг значений (trim делается в коде).

### 2.3. Trust proxy

`expressApp.set('trust proxy', 1)` — один хоп (Caddy) перед Nest. Нужно для корректного учёта HTTPS при выставлении флага **Secure** на куках (совместно с `X-Forwarded-Proto`).

### 2.4. JWT и куки

- **Access** и **refresh** токены выдаются при login/register/refresh; в ответ также выставляются **httpOnly** cookies (имена из `COOKIE_ACCESS_NAME`, `COOKIE_REFRESH_NAME`).
- **`JwtStrategy`**: токен из **`Authorization: Bearer`** или из cookie access (парсинг `Cookie` заголовка).

### 2.5. Параметры cookie (критично для SSO между поддоменами)

Задаются в `auth.controller.ts` (`getCookieOptions`, `resolveCookieSecure`):

| Переменная | Назначение |
|------------|------------|
| `COOKIE_DOMAIN` | Рекомендуется **`.numlix.local`** — общая сессия для `numlix.local`, `panel.numlix.local`, `api.numlix.local` при запросах с `credentials`. |
| `COOKIE_SECURE` | `true` / `false` / **`auto`** (по умолчанию в логике — см. код): при `auto` Secure включается, если запрос пришёл как HTTPS (`X-Forwarded-Proto: https` или `req.secure`). |
| `COOKIE_SAMESITE` | Для сценария «apex `numlix.local` + fetch на `api.numlix.local`» часто нужен **`none`** вместе с **Secure**; иначе браузер может не приложить куки к cross-site запросу. В коде: если `sameSite === 'none'` и `secure` вычислился false — **Secure принудительно true** (требование браузера). |
| `COOKIE_ACCESS_NAME` / `COOKIE_REFRESH_NAME` | Имена cookie (дефолты в коде, переопределяются env). |

**После смены `COOKIE_DOMAIN` / `SameSite` пользователю нужно перелогиниться** (старые куки с другим scope не подходят).

### 2.6. Endpoints (кратко)

- `POST /api/auth/login`, `POST /api/auth/register` — тело JSON, Set-Cookie + JSON с `accessToken`, `user`.
- `POST /api/auth/refresh` — тело может быть пустым; refresh из **cookie** или из body; новая пара токенов + Set-Cookie.
- `GET /api/auth/me` — JWT guard; Bearer и/или access cookie.
- `POST /api/auth/logout` — очистка cookie.

---

## 3. Пакет `@numlix/auth-shared`

### 3.1. Базовый URL API

`getAuthApiBaseUrl()`:

1. Явный `setAuthApiBaseUrl()` / `AuthProvider apiBaseUrl` (нормализуется).
2. **`import.meta.env.VITE_API_URL`** или **`VITE_AUTH_API_URL`** (только **прямые** обращения — см. ниже).
3. В Node/Next в рантайме: **`process.env.NEXT_PUBLIC_API_URL`**, **`NUMLIX_API_URL`**.
4. Fallback: **`https://api.numlix.local`**.

Перед возвратом применяется **`normalizeApiBaseUrlForBrowser`**: если страница открыта по **https**, а в строке остался **`http://`** для API (не localhost), схема принудительно **https** (избегание mixed content).

### 3.2. Vite и подстановка env (обязательно знать)

**Vite подставляет `VITE_*` только в литеральные `import.meta.env.VITE_FOO`.**  
Если написать `const e = import.meta.env; e.VITE_API_URL`, подстановки **не будет**, в рантайме значения нет → срабатывал старый fallback на `localhost:3001`.

Поэтому в `config.ts` используются **только** прямые `import.meta.env.VITE_API_URL` и т.д.

### 3.3. Запрет лишних `*.js` в `packages/auth-shared/src/`

У Vite порядок расширений при резолве включает **`.js` раньше `.ts`**. Если в `src/` лежат случайно скомпилированные **`config.js`** рядом с **`config.ts`**, подхватывается **устаревший JS** — токены и URL ломаются.

В репозитории: **`packages/auth-shared/.gitignore`** игнорирует `src/**/*.js`, `src/**/*.d.ts`, `src/**/*.d.ts.map`. Сборка библиотеки — только в **`dist/`** (`npm run build -w @numlix/auth-shared`).

### 3.4. In-memory access token

`token-store.ts` хранит **только** access token в памяти модуля (не localStorage).  
Каждый origin (каждый поддомен) — **свой** экземпляр JS: память с `panel` не разделяется с `numlix.local`. Поэтому **SSO опирается на httpOnly cookies** + `bootstrapSession` на каждом приложении.

### 3.5. `getMe` и аргумент токена

- **`getMe()`** (аргумент **не передан** / `undefined`) — Bearer из **памяти** (`getAccessToken()`).
- **`getMe(null)`** — **без** Bearer, только куки (важно для главной после логина на panel).

**Нельзя** использовать `accessToken ?? getAccessToken()` для «отключения» Bearer: в JS **`null ?? x` даёт `x`**, поэтому явная семантика только через **`accessToken === undefined ? getAccessToken() : accessToken`**.

### 3.6. `bootstrapSession()`

Порядок:

1. **`getMe(null)`** — если access cookie ещё валиден, пользователь поднимается без refresh; `accessToken` в памяти может остаться `null`, но `AuthProvider` считает залогиненным по **`user`**.
2. Иначе **`refreshSession()`** — обновление пары, ответ кладёт access в память.
3. Иначе сессия сброшена.

### 3.7. `getDomainRoutes()`

Строит URL редиректов между приложениями из:

- `import.meta.env.VITE_MAIN_URL` / `VITE_PANEL_URL` / `VITE_ADMIN_URL`
- или `process.env.NUMLIX_MAIN_URL` / `NUMLIX_PANEL_URL` / `NUMLIX_ADMIN_URL`
- fallback: `https://numlix.local`, `https://panel.numlix.local`, `https://admin.numlix.local`.

### 3.8. `AuthProvider`

- Опциональный проп **`apiBaseUrl`** → `setAuthApiBaseUrl` в `useEffect`.
- При монтировании вызывается **`bootstrapSession()`**.

---

## 4. `numlix-main` (Next.js)

### 4.1. Провайдеры

`apps/numlix-main/src/components/legacy-providers.tsx` (client):

- Передаёт в `AuthProvider` **`apiBaseUrl` из `process.env.NEXT_PUBLIC_API_URL`**, если задан.
- Рекомендуется **`.env.local`**: `NEXT_PUBLIC_API_URL=https://api.numlix.local` (файл в `.gitignore` шаблоном `.env*` в приложении, кроме `!.env.example`).

### 4.2. Совместимость `useAuth` с легаси UI

`src/hooks/useAuth.tsx` (в корне монорепо, алиас `@/*` в main) — тонкая обёртка над `useAuth` из `@numlix/auth-shared`, маппинг полей под старый контракт (Supabase-стиль: `user_metadata`, `session.access_token`).

### 4.3. Dev за Caddy

`next.config.ts`:

- **`allowedDevOrigins`**: `numlix.local`, `*.numlix.local` — иначе Next dev может отдавать **400** на служебные запросы с кастомного хоста.
- **`experimental.trustHostHeader: true`** только если **`NUMLIX_BEHIND_PROXY=1`** (скрипт **`npm run dev:proxy -w numlix-main`** или корневой **`npm run dev:numlix-main:proxy`**). Иначе i18n-редиректы собирают абсолютный URL на **`http://127.0.0.1:3000`**, и с `https://numlix.local` ломается навигация.

**Без прокси не включать `trustHostHeader`** — ломает обычный `http://localhost:3000`.

### 4.4. Порты

За Caddy **Next должен слушать 3000**, Nest **3001**. Если порты перепутаны, `numlix.local` попадёт в API и даст JSON 404 на `/`.

---

## 5. `numlix-panel` (Vite)

### 5.1. Env

`.env`: **`VITE_API_URL`**, **`VITE_PANEL_URL`** — для локальной схемы за Caddy **только `https://`**, иначе со страницы `https://panel...` будет **mixed content** при обращении к `http://api...`.

### 5.2. Vite

- `server.allowedHosts: true` — иначе доступ по `panel.numlix.local` может давать **403**.
- Alias `@numlix/auth-shared` → **`../../packages/auth-shared/src/index.ts`**.

### 5.3. RTK Query (`baseApi.ts`)

- `baseUrl`: `normalizeApiBaseUrlForBrowser(import.meta.env.VITE_API_URL ?? "https://api.numlix.local")`.
- **`credentials: "include"`** обязательно.
- При **401** (кроме login/register/refresh) — попытка **`refreshSession()`**, обновление in-memory access, повтор запроса.

---

## 6. `numlix-admin`

Аналогично panel: `VITE_API_URL`, alias auth-shared, при необходимости `allowedHosts`. `AdminGuard` + `getDomainRoutes()`.

---

## 7. Локальный reverse proxy (`infra/local/Caddyfile`)

- Глобальный блок **`{ local_certs }`** — локальный CA Caddy; один раз: **`caddy trust`**, затем **`caddy run --config ./infra/local/Caddyfile`**.
- Прокси: `numlix.local → 127.0.0.1:3000`, `panel → 8081`, `admin → 8082`, `api → 3001`.
- `/etc/hosts`: `127.0.0.1 numlix.local panel.numlix.local admin.numlix.local api.numlix.local`.

**Правило:** если фронт открыт по **https**, **все** URL API в env тоже **https** на том же «семействе» доменов.

---

## 8. Чеклист для нового разработчика / ИИ

1. Поднять Postgres, применить миграции/сид `calc-hub-back` по README проекта.
2. Заполнить **`calc-hub-back/.env`**: `CORS_ORIGINS`, **`COOKIE_DOMAIN=.numlix.local`**, **`COOKIE_SAMESITE=none`** (или осознанно `lax`), **`COOKIE_SECURE=auto`**, секреты JWT.
3. **Panel/Admin `.env`**: `VITE_API_URL=https://api.numlix.local`, `VITE_PANEL_URL` / аналоги — **https**.
4. **Main**: `NEXT_PUBLIC_API_URL=https://api.numlix.local` в `.env.local`.
5. Caddy + `caddy trust`; Next за прокси — **`dev:numlix-main:proxy`**.
6. После смены cookie-политики — **перелогин** на panel.
7. Не класть **`*.js`** в `packages/auth-shared/src/`.
8. Не читать `VITE_*` через промежуточную переменную от `import.meta.env`.
9. Любой новый фронтовый origin добавить в **`CORS_ORIGINS`**.

---

## 9. Типичные симптомы и причины

| Симптом | Вероятная причина |
|---------|-------------------|
| Запросы на `http://localhost:3001` с panel | Старый `config.js` в auth-shared src, или env не подставился в Vite |
| Mixed content | `VITE_API_URL` с `http://` при `https` фронте |
| `https://numlix.local` не открывается / редирект на 127.0.0.1 | Нет `NUMLIX_BEHIND_PROXY` + `trustHostHeader`, или Caddy не слушает 443 |
| После логина на panel на main «гость» | Нет `COOKIE_DOMAIN`, не тот `SameSite`, не `https` везде, нет `CORS` для `https://numlix.local`, или не обновлён `bootstrapSession` / `getMe(null)` |
| OPTIONS / странные 400 в логе Next | Часто расширения браузера; смотреть совпадение с реальными запросами приложения |
| 403 на panel по имени хоста | `allowedHosts` в Vite |

---

## 10. Скрипты (корневой `package.json`)

- `dev:numlix-main`, **`dev:numlix-main:proxy`**
- `dev:numlix-panel`, `dev:numlix-admin`
- `build:auth-shared`

---

## 11. Файлы «источник правды» (быстрый поиск)

| Область | Файлы |
|---------|--------|
| Cookie / CORS / trust proxy | `apps/calc-hub-back/src/main.ts`, `modules/auth/auth.controller.ts`, `jwt.strategy.ts` |
| Клиент auth | `packages/auth-shared/src/auth-client.ts`, `config.ts`, `AuthProvider.tsx`, `token-store.ts` |
| Next dev + proxy | `apps/numlix-main/next.config.ts`, `legacy-providers.tsx` |
| Panel API | `apps/numlix-panel/src/services/api/baseApi.ts`, `.env.example` |
| Caddy | `infra/local/Caddyfile` |
| Примеры env | `apps/calc-hub-back/.env.example`, `apps/numlix-main/.env.example`, `apps/numlix-panel/.env.example` |

---

*Документ отражает состояние кода на момент создания; при изменении контрактов API или env — обновляйте этот файл и правило Cursor.*
