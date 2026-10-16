# API notes: OWASP Juice Shop

**Base URL:** http://localhost:3000
**Дата разведки:** 13–15.10.2026
**Инструмент:** DevTools → Network (Firefox), фильтры `rest` и `api`

## Тестовые аккаунты

| Аккаунт | Email | UserId | bid (id корзины) |
|---|---|---|---|
| A | qa.playwright@test.com | 25 | 6 |
| B | qa.second@test.com | 26 | 7 |
| C | qa.third@test.com | 27 | 8 |
| D | qa.fourth@test.com | не фиксировали | 9 |
| E | qa.fifth@test.com | 30 | 10 |
| F | not-an-email (невалидный формат, создан экспериментом) | 31 | 11 |

Пароли в notes не храним.
> **Внимание:** 16.10.2026 база Juice Shop была пересоздана (у товаров изменился `createdAt`, тестовые аккаунты пропали). `qa.playwright@test.com` зарегистрирован заново с прежним паролем; значения `UserId` и `bid` в таблице относятся к базе до 16.10 и устарели, актуальные уточнить при работе с корзиной (повторный логин). Остальные аккаунты из таблицы в новой базе отсутствуют.

---

## Общее

- Шаги flow «Open application» и «Dismiss Popups» API-запросов бизнес-логики не создают: закрытие баннеров ставит cookie `welcomebanner_status=dismiss` и `cookieconsent_status=dismiss` на стороне браузера. В API-тесты эти шаги не входят.
- API разложено по двум префиксам: `/rest/...` (логин, поиск, корзина) и `/api/...` (регистрация, элементы корзины).
- Аутентификация: заголовок `Authorization: Bearer <JWT>`. Браузер дополнительно отправляет тот же токен в cookie `token`. Эндпоинты корзины (`/api/BasketItems/`, `/rest/basket/{bid}`) требуют заголовок Authorization (без него `401`, проверено в Postman); логин, регистрация и поиск токена не требуют. Принимается ли токен, переданный только в cookie, не проверено.
- Статусы, замеченные в разведке: `200` (логин, поиск, корзина, POST/PUT/GET BasketItems), `201 Created` (регистрация), `400` (ошибка валидации при регистрации), `401` (неверные данные логина), `500` (битый JSON в логине). Поведение статусов непоследовательное, в кейсах фиксируем фактический.
- База данных контейнера может пересоздаваться: `id` товаров при этом сохраняются, а тестовые аккаунты, их `UserId` и `bid` пропадают. Тестовые данные (пользователи, корзины) нужно создавать в подготовке теста, а не рассчитывать на заранее заведённые.
- HTML-страницы ошибок (`401`, `500`) содержат заголовок `OWASP Juice Shop (Express ^4.22.1)`: раскрывается фреймворк и диапазон версии. При `401` блок стека вызовов (`<ul id="stacktrace">`) пустой; при `500` на битый JSON в логине он заполнен путями к файлам сервера.

## Сквозная схема данных (откуда → куда)

| Значение | Откуда берётся | Где используется |
|---|---|---|
| `token` | шаг 1, `authentication.token` | заголовок `Authorization: Bearer <token>` в шагах 2–4 |
| `bid` | шаг 1, `authentication.bid` | URL `/rest/basket/{bid}` (шаг 4); поле `BasketId` в теле POST (шаг 3) |
| id товара | шаг 2, `data[].id` | поле `ProductId` в теле POST (шаг 3) |
| id строки корзины | шаг 3, `data.id` из ответа POST | URL `/api/BasketItems/{id}` (GET, PUT) |
| UserId нового пользователя | шаг 0, ответ `/api/Users/` (проверить: `data.id`) | тело `/api/SecurityAnswers/` |

---

## Шаг 0: Registration (предусловие для кейсов Auth и TC-009)

**Действие в UI:** Account → Login → Not yet a customer? → заполнить форму → Register

Регистрация состоит из двух запросов.

### 0а. Создание пользователя
- Метод + URL: `POST /api/Users/`
- Authorization в запросе: нет (регистрация выполнялась без токена); обязателен ли токен для сервера: нет (проверено в Postman: запросы без Authorization вернули `201`)
- Тело: `{ "email": "...", "password": "***", "passwordRepeat": "***", "securityAnswer": "***", "securityQuestion": { "id": 1, "question": "...", ... } }`
- Статус: `201 Created`
- Ответ: `{ "status": "success", "data": { role: "customer", lastLoginIp, profileImage, ... } }`

### 0б. Сохранение ответа на секретный вопрос
- Метод + URL: `POST /api/SecurityAnswers/`
- Тело: `{ "answer": "***", "SecurityQuestionId": 1, "UserId": 26 }`
- Статус: `201 Created`
- Ответ: `{ "status": "success", "data": { id, UserId, answer (в ответе приходит значение, похожее на хеш), ... } }`

**Наблюдения**
- Двухшаговая регистрация: `UserId` во втором запросе берётся из первого (проверить по `data.id`).
- На сервер уходит поле `passwordRepeat`.
- Номера выдаются в основном подряд (UserId 25 → 26, bid 6 → 7); подробности в экспериментах ниже.

**Эксперименты (проверено в Postman)**
- Успешная регистрация (`qa.third@test.com`, тело: `email`, `password`, `passwordRepeat`, `securityQuestion {id, question}`, `securityAnswer`; без Authorization): `201 Created`, `Content-Type: application/json; charset=utf-8`, `status: "success"`, `data`: `username`, `role` (`customer`), `deluxeToken`, `lastLoginIp`, `profileImage`, `isActive` (`true`), `id` (27), `email`, `createdAt`, `updatedAt`, `deletedAt`. Поля с паролем в ответе нет
- Минимального тела достаточно: `createdAt` и `updatedAt` внутри `securityQuestion` не нужны (обязательность каждого поля по отдельности не проверялась)
- Логин новым пользователем (qa.third@test.com, тот же пароль): `200 OK`, `authentication.bid` = 8
- Регистрация с уже занятым email (`qa.third@test.com`, остальное валидно): `400 Bad Request`, `Content-Type: application/json; charset=utf-8`, тело `{ "message": "Validation error", "errors": [ { "field": "email", "message": "email must be unique" } ] }`. Ответ прямо сообщает, что email занят (по ответу можно узнать, зарегистрирован ли адрес). Формат ошибок JSON, в отличие от логина, где ошибки приходят текстом `text/html`
- Регистрация с несовпадающими `password` и `passwordRepeat` (`qa.fourth@test.com`, остальное валидно): `201 Created`, пользователь создан. Логин с `password` (первым паролем): `200 OK`, `bid` = 9. Сервер не проверяет совпадение `passwordRepeat` (потенциальный дефект: проверка только на стороне интерфейса)
- Повтор с другими данными (`qa.fifth@test.com`, `password` ≠ `passwordRepeat`): `201 Created`, `data.id` = 30, `data.email` совпадает с отправленным. Логин с `password`: `200 OK`, `bid` = 10. Логин с `passwordRepeat`: `401 Unauthorized`, тело `Invalid email or password.`. Сохраняется `password`, `passwordRepeat` игнорируется; поведение воспроизведено на двух наборах данных
- Регистрация с email без `@` (`not-an-email`, остальное валидно): `201 Created`, `status: "success"`, `data.email` = `not-an-email`, `data.id` = 31. Логин с этим email и паролем: `200 OK`, `authentication.umail` = `not-an-email`, `bid` = 11. Сервер не проверяет формат email (потенциальный дефект)
- Номера в основном выдаются подряд (bid 6 → 7 → 8 → 9 → 10), но у UserId бывают пропуски (25 → 26 → 27, затем 30 для qa.fifth); причина не выяснялась (возможно, неудачные попытки регистрации тоже расходуют номера)

**Не проверено (Postman)**
- Пустые поля, слабый пароль

---

## Шаг 1: Login

**Действие в UI:** Account → Login → ввод email и пароля → Log in

**Запрос**
- Метод + URL: `POST /rest/user/login`
- Authorization в запросе браузера: нет (токена ещё нет)
- Обязателен ли токен для сервера: нет (проверено в Postman: запрос без Authorization и без cookie вернул `200` и токен)
- Важные заголовки: `Content-Type: application/json`
- Тело:
  ```json
  { "email": "qa.playwright@test.com", "password": "***" }
  ```

**Ответ**
- Статус: `200 OK`
- Тело:
  ```json
  { "authentication": { "token": "eyJ...<сокращено>", "bid": 6, "umail": "qa.playwright@test.com" } }
  ```
- Ключевые поля: `authentication.token`, `authentication.bid` (id корзины), `authentication.umail`
- Для аккаунта B: тот же запрос, `bid = 7`

**Токен (проверено)**
- Формат: JWT, `alg: RS256` (подпись асимметричная), `typ: JWT`
- Хранится: Local Storage (ключ `token`) и cookie `token`
- Передаётся: `Authorization: Bearer <JWT>` + cookie `token`
- Payload: `data` (поля пользователя: id, email, password, role, deluxeToken, lastLoginIp, profileImage, totpSecret, isActive и др.), `bid`, `iat`
- `data.id` (25) = `UserId` корзины; `bid` (6) = id корзины; `role` = `customer`
- Поля `exp` (срок жизни) в payload не видно

**Наблюдения**
- В payload лежат чувствительные поля, в частности значение `password` (по формату похоже на хеш) и `totpSecret`. Токен читается без ключа, потенциальный дефект.

**Эксперименты (проверено в Postman)**
- Неверный пароль (email верный): статус `401 Unauthorized`, `Content-Type: text/html; charset=utf-8`, тело — простой текст `Invalid email or password.` (не JSON), поля `authentication` и токена нет

- Несуществующий email: результат идентичен случаю с неверным паролем (тот же статус и то же сообщение), по ответу нельзя определить, зарегистрирован ли email

- Пустые значения (`email: ""`, `password: ""`; проверено вместе и по отдельности): результат во всех трёх случаях одинаковый: `401 Unauthorized`, `Content-Type: text/html; charset=utf-8`, тело `Invalid email or password.`. Отдельной валидации пустых полей (например, `400`) нет

- Нет поля `password` в теле (`{"email": "qa.playwright@test.com"}`): результат идентичен предыдущим (`401 Unauthorized`, `text/html; charset=utf-8`, тело `Invalid email or password.`)

- Некорректный JSON в теле (`{"email": "qa.playwright@test.com", "password": }`): статус `500 Internal Server Error`, `Content-Type: text/html; charset=utf-8`, тело — HTML-страница ошибки, в заголовке `SyntaxError: Unexpected token '}' ... is not valid JSON`. В теле есть блок `<ul id="stacktrace">` со стеком вызовов: пути к файлам на сервере (`/juice-shop/build/server.js`, `/juice-shop/node_modules/express/...`, `body-parser`, `raw-body`) и внутренности Node.js. Потенциальный дефект: ожидаемо `400 Bad Request`, а не `500`, и сервер раскрывает технологии и пути (information disclosure)

**Не проверено (Postman)**
- Нет поля `email` в теле

---

## Шаг 2: Products / Search

**Действие в UI:** открытие главной страницы, поиск по названию

**Запрос**
- Метод + URL: `GET /rest/products/search?q=`
- Параметр: `q` (query-строка); при загрузке страницы пустой
- Authorization в запросе браузера: да (`Bearer`); обязателен ли для сервера: нет (проверено в Postman: запрос без токена вернул `200` и тот же результат, что с токеном)
- Тело: нет (GET)

**Ответ**
- Статус: `200 OK`
- Структура: `{ "status": "success", "data": [ {товар}, ... ] }`
- Поля товара: `id`, `name`, `description`, `price`, `deluxePrice`, `image`, `createdAt`, `updatedAt`, `deletedAt`
- Ключевые поля: `id` (для корзины), `name`, `price`
- При `q=` возвращается весь каталог: 46 товаров (на 14.10.2026)

**Наблюдения**
- UI запрашивает каталог один раз при загрузке; поиск `apple` и `banana` в строке сайта нового запроса к `/rest/products/search` не вызвал (гипотеза: фильтрация на стороне браузера).
- Адрес `/#/search?q=...` — внутренний маршрут фронтенда, на сервер не уходит.
- `description` содержит HTML-разметку.
- При поиске `Apple Juice` в UI подгружалась картинка `pineapple_juice.png` (гипотеза: поиск по вхождению подстроки без учёта регистра; проверить на endpoint).

**Эксперименты (проверено в Postman)**
- `q=apple` (без токена и с токеном): `200 OK`, `Content-Type: application/json; charset=utf-8`, `data` = 3 товара: Apple Juice (id 1), Apple Pomace (id 24), Pineapple Juice (id 47). Поиск идёт по вхождению подстроки (`apple` внутри `Pineapple`), результаты в алфавитном порядке по названию
- `q=APPLE`: тот же результат, регистр не важен
- `q=monkeys`: найден Banana Juice (id 6), слово есть только в описании: сервер ищет не только по названию, но и по описанию
- `q=zzzzzz`: `200 OK`, `{ "status": "success", "data": [] }`: для ненайденного товара возвращается пустой массив, а не `404`
- `q=` (пустой): `200 OK`, возвращается весь каталог, 46 товаров (подтверждено 16.10.2026 после пересоздания базы)
- `q='` (одинарная кавычка): `500 Internal Server Error`, `Content-Type: text/html; charset=utf-8`, тело — HTML-страница ошибки с заголовком `Error: SQLITE_ERROR: no such column: q`. Входное значение попадает в SQL-запрос и ломает его: потенциальный дефект высокого приоритета (признак возможной SQL-инъекции), сервер раскрывает тип СУБД и текст SQL-ошибки
- `q=<script>`: `200 OK`, `{ "status": "success", "data": [] }`, значение в ответе не отражается
- Временные метки (`createdAt`, `updatedAt`) товаров меняются при пересоздании базы, `id` и названия остаются

**Не проверено (Postman)**
- Очень длинная строка в `q`

---

## Шаг 3: Add to Basket

**Действие в UI:** кнопка Add to Basket на карточке товара

### 3а. Добавление нового товара
- Метод + URL: `POST /api/BasketItems/`
- Authorization в запросе браузера: да (`Bearer`); обязателен ли — не проверено
- Тело: `{ "ProductId": 53, "BasketId": "6", "quantity": 1 }`
- Статус: `200 OK` (не 201)
- Ответ: `{ "status": "success", "data": { "id": 20, "ProductId": 53, "BasketId": "6", "quantity": 1, "createdAt": ..., "updatedAt": ... } }`
- Ключевые поля: `data.id` (id строки корзины), `data.ProductId`, `data.BasketId`, `data.quantity`

### 3б. Повторное добавление того же товара (UI отправляет три запроса)
1. `GET /api/BasketItems/20`: чтение текущей строки, статус `200`, в ответе `data` с `ProductId`, `BasketId`, `id`. Authorization: не проверено.
2. `PUT /api/BasketItems/20`: тело `{ "quantity": 5 }`, статус `200`, в ответе `data` с `ProductId`, `BasketId`, `id`. Authorization в запросе браузера: да (`Bearer`).
3. `GET /api/Products/53?d=<дата>`: данные товара для интерфейса, в flow не нужен.

**Наблюдения**
- Повторное добавление не создаёт новую строку: id записи прежний, количество обновляется через PUT.
- В PUT передаётся итоговое количество, а не приращение.
- В URL PUT стоит id строки корзины. Это тот же тип объекта-идентификатора, что `bid` в шаге 4: кандидат на проверку авторизации (чужая строка).
- `BasketId` в ответе POST приходит строкой (`"6"`), в ответах GET и PUT числом (`6`); `ProductId` всегда числом.

**Эксперименты (проверено в Postman, аккаунт A, с токеном)**
- `POST /api/BasketItems/` с телом `{"ProductId": 1, "BasketId": "6", "quantity": 1}`: `200 OK`, `Content-Type: application/json; charset=utf-8`, `data`: `id` = 9 (id строки корзины), `ProductId` = 1, `BasketId` = `"6"` (строка), `quantity` = 1, `createdAt`, `updatedAt`
- `PUT /api/BasketItems/9` с телом `{"quantity": 3}`: `200 OK`, `data`: `ProductId` = 1, `BasketId` = 6 (число), `id` = 9, `quantity` = 3, `updatedAt` изменился, `createdAt` прежний
- Расхождение типов подтверждено: `BasketId` в ответе POST — строка, в ответе PUT и в корзине — число
- `POST /api/BasketItems/` без заголовка Authorization (тело валидное, `ProductId` 1, `BasketId` "6"): `401 Unauthorized`, `Content-Type: text/html; charset=utf-8`, тело — HTML-страница ошибки с заголовком `UnauthorizedError: No Authorization header was found`
- `POST /api/BasketItems/` с токеном аккаунта B в свою корзину (`ProductId` 24, `BasketId` "7"): `200 OK`, `data.id` = 10
- `POST /api/BasketItems/` с токеном аккаунта A в чужую корзину (`ProductId` 1, `BasketId` "7"): `401 Unauthorized`, `Content-Type: text/html; charset=utf-8`, тело `{'error' : 'Invalid BasketId'}` (одинарные кавычки, это не валидный JSON). Запись в чужую корзину сервер отклоняет, статус `401` вместо более точного `403`; повторное чтение корзины B подтвердило, что товар не добавился (в Products остался только Apple Pomace, id 24)
- `PUT /api/BasketItems/10` (строка корзины B) с токеном аккаунта A, тело `{"quantity": 5}`: `200 OK`, `Content-Type: application/json; charset=utf-8`, `data`: `ProductId` = 24, `BasketId` = 7, `id` = 10, `quantity` = 5, `updatedAt` изменился. Чтение корзины B подтвердило `quantity` = 5 (было 1). Сервер не проверяет принадлежность строки корзины владельцу токена (потенциальный дефект: изменение чужих данных)
- `POST /api/BasketItems/` с несуществующим товаром (`ProductId` 99999, `BasketId` "6", `quantity` 1, токен A): `500 Internal Server Error`, `Content-Type: text/html; charset=utf-8`, HTML-страница, `<h2>` содержит `500 Error: No such product found!`, в блоке стека путь `/juice-shop/build/routes/basketItems.js:119:15` (функция `quantityCheck`)
- `POST /api/BasketItems/` с `quantity` = -1 для товара, который уже лежит в корзине (`ProductId` 1, `BasketId` "6", токен A): `500 Internal Server Error`, `Content-Type: text/html; charset=utf-8`, HTML-страница с заголовком `Error`, в стеке вызовов видны пути к файлам сервера и библиотека `sequelize` (ошибка возникает при вставке записи в БД). Корзина не изменилась (`quantity` = 3). Причина `500` здесь не отрицательное количество, а повторная вставка уже существующего товара (см. две строки ниже)
- `POST /api/BasketItems/` с `quantity` = -1 для нового товара (`ProductId` 2, `BasketId` "6", токен A): `200 OK`, `Content-Type: application/json; charset=utf-8`, `data`: `id` = 11, `ProductId` = 2, `BasketId` = `"6"`, `quantity` = -1. Сервер принимает отрицательное количество и создаёт строку (потенциальный дефект)
- `POST /api/BasketItems/` повторно для товара, который уже в корзине (`ProductId` 1, `BasketId` "6", `quantity` 1, токен A): `500 Internal Server Error`, `Content-Type: text/html; charset=utf-8`, HTML-страница с заголовком `Error`, в стеке вызовов пути к файлам сервера и `sequelize` (ошибка при вставке записи, `BasketItem.save`). Тот же результат, что в предыдущем эксперименте с `ProductId` 1
- `POST /api/BasketItems/` с `quantity` = 0 для нового товара (`ProductId` 3, `BasketId` "6", токен A): `200 OK`, `Content-Type: application/json; charset=utf-8`, `data`: `id` = 12, `ProductId` = 3, `BasketId` = `"6"`, `quantity` = 0. Строка создаётся; чтение корзины A подтвердило товар `id` 3 с `quantity` = 0 (потенциальный дефект: нет валидации количества)
- `POST /api/BasketItems/` с `quantity` = `"abc"` (`ProductId` 4, `BasketId` "6", токен A): `400 Bad Request`, `Content-Type: application/json; charset=utf-8`, тело `{ "error": "We are out of stock! Sorry for the inconvenience." }`. Статус `400`, но сообщение вводит в заблуждение (про остатки, а не про неверный тип)
- `POST /api/BasketItems/` с `quantity` = 1.5 (`ProductId` 5, `BasketId` "6", токен A): `200 OK`, `data.quantity` = 1.5. Дробное количество принимается
- `POST /api/BasketItems/` с `quantity` = 999999 (`ProductId` 6, `BasketId` "6", токен A): `400 Bad Request`, `Content-Type: application/json; charset=utf-8`, тело `{ "error": "We are out of stock! Sorry for the inconvenience." }`. Для слишком большого количества отказ по остаткам, сообщение уместно
- `GET /api/BasketItems/10` (строка корзины B) с токеном аккаунта A: `200 OK`, `Content-Type: application/json; charset=utf-8`, `data`: `ProductId` = 24, `BasketId` = 7, `id` = 10, `quantity` = 5. Чужая строка читается токеном A
- `GET /api/BasketItems/2` с токеном аккаунта A: `200 OK`, `Content-Type: application/json; charset=utf-8`, `data`: `ProductId` = 2, `BasketId` = 1, `id` = 2, `quantity` = 3. Строка корзины 1 (не принадлежит A) тоже читается
- `GET /api/BasketItems/9` с токеном аккаунта A (своя строка): `200 OK`, `Content-Type: application/json; charset=utf-8`, `data`: `ProductId` = 1, `BasketId` = 6, `id` = 9, `quantity` = 3
- `GET /api/BasketItems/10` без заголовка Authorization: `401 Unauthorized`, `Content-Type: text/html; charset=utf-8`, HTML-страница с заголовком `UnauthorizedError: No Authorization header was found`, блок стека пустой. Токен обязателен

---

## Шаг 4: Open Basket

**Действие в UI:** открыть корзину

**Запрос**
- Метод + URL: `GET /rest/basket/{bid}` (пример: `/rest/basket/6`)
- Authorization в запросе браузера: да (`Bearer`); обязателен ли — не проверено
- Тело: нет

**Ответ**
- Статус: `200 OK`
- Структура: `{ "status": "success", "data": { id, coupon, UserId, createdAt, updatedAt, Products: [ ... ] } }`
- Товар в `Products`: `id`, `name`, `price`, `deluxePrice`, ..., `BasketItem { ProductId, BasketId, id, quantity }`
- Ключевые поля для проверки: `Products[].id`, `Products[].BasketItem.quantity`

**Связи между шагами**
- `{bid}` ← `authentication.bid` из шага 1
- `Products[].id` сверяем с `ProductId`, отправленным в шаге 3

**Наблюдения**
- В URL идёт id корзины (`bid`), а не `UserId` (в ответе `UserId: 25`, корзина: `6`).
- Приложение перечитывает корзину после каждого добавления.

**Эксперименты (проверено в Postman, аккаунт A, с токеном)**
- `GET /rest/basket/6` после добавления товара: `200 OK`, `data.id` = 6, `data.UserId` = 25, `data.coupon` = `null`, `data.Products` = 1 товар (Apple Juice, `id` 1) с вложенным `BasketItem`: `ProductId` = 1, `BasketId` = 6, `id` = 9 (совпадает с `data.id` из ответа POST), `quantity` = 1
- `GET /rest/basket/6` после `PUT quantity = 3`: тот же товар, `BasketItem.quantity` = 3, `BasketItem.updatedAt` обновился
- `GET /rest/basket/6` без заголовка Authorization: `401 Unauthorized`, `Content-Type: text/html; charset=utf-8`, тело — HTML-страница ошибки с заголовком `UnauthorizedError: No Authorization header was found`
- `GET /rest/basket/7` (корзина аккаунта B) с токеном аккаунта A: `200 OK`, `Content-Type: application/json; charset=utf-8`, в ответе вся корзина B: `data.id` = 7, `data.UserId` = 26, `data.Products` = Apple Pomace (`id` 24), `BasketItem.id` = 10, `quantity` = 1. Сервер не проверяет, что корзина принадлежит владельцу токена (потенциальный дефект: чтение чужой корзины)
- `GET /rest/basket/99999` (несуществующая корзина) с токеном аккаунта A: `200 OK`, `Content-Type: application/json; charset=utf-8`, тело `{ "status": "success", "data": null }`. Статус `404` не возвращается
- `GET /rest/basket/6` (токен A) после экспериментов с `quantity` -1 и повторным POST: `200 OK`, `Content-Type: application/json; charset=utf-8`, в `Products` два товара: Apple Juice (`id` 1), `BasketItem` `id` 9, `quantity` = 3 (не изменился после `500` на повторном POST); Orange Juice (`id` 2), `BasketItem` `id` 11, `quantity` = -1 (строка с отрицательным количеством сохранилась и отдаётся в корзине)

**Не проверено (Postman)**
- Испорченный токен; токен только в cookie (без заголовка Authorization)
- Нечисловой id корзины

---

## Потенциальные дефекты и вопросы (по итогам разведки)

1. В payload JWT лежат чувствительные поля (`password`, `totpSecret` и др.).
2. В payload нет `exp` (срок жизни токена не виден).
3. Идентификаторы выдаются в основном подряд (UserId, bid; у UserId бывают пропуски), чужой id угадывается легко.
4. Непоследовательные статусы: 201 при регистрации, 200 при создании строки корзины.
5. Расхождение типов `BasketId` (строка в POST, число в GET/PUT).
6. Некорректный JSON в запросе логина приводит к `500 Internal Server Error` и HTML-странице со стеком вызовов: пути к файлам сервера, используемые библиотеки (ожидаемо `400` без технических деталей).
7. Регистрация принимает несовпадающие `password` и `passwordRepeat` (`201 Created`, пользователь создан и может войти с `password`; `passwordRepeat` игнорируется): сервер не валидирует повтор пароля. Воспроизведено на двух наборах данных.
8. Регистрация принимает email без `@` (`not-an-email`): `201 Created`, пользователь создан и может войти. Формат email сервером не проверяется.
9. Поиск `GET /rest/products/search?q='` возвращает `500` с текстом SQL-ошибки (`SQLITE_ERROR: no such column: q`): входное значение, вероятно, подставляется в SQL-запрос без защиты. Признак возможной SQL-инъекции, раскрывается тип СУБД.
10. HTML-страницы ошибок раскрывают название фреймворка и диапазон версии (`Express ^4.22.1`). Серьёзность низкая.
11. Чтение чужой корзины: `GET /rest/basket/{bid}` с токеном аккаунта A возвращает `200` и полное содержимое корзины аккаунта B (`UserId`, товары, количества). Сервер проверяет наличие токена, но не принадлежность корзины владельцу токена (Broken Object Level Authorization). Серьёзность высокая. При этом запись в чужую корзину через `POST /api/BasketItems/` сервер отклоняет (`401`, `Invalid BasketId`).
12. Изменение чужих данных: `PUT /api/BasketItems/{id}` с токеном аккаунта A для строки из корзины аккаунта B возвращает `200` и меняет `quantity` (подтверждено чтением корзины B). Принадлежность строки владельцу токена не проверяется. Серьёзность высокая. Защита непоследовательна: `POST` в чужую корзину отклоняется, `PUT` по чужой строке проходит.
13. Запрос несуществующей корзины (`GET /rest/basket/99999`) возвращает `200` с `data: null` вместо `404`.
14. Добавление несуществующего товара (`POST /api/BasketItems/`, `ProductId` 99999) возвращает `500` и HTML-страницу со стеком (путь `/juice-shop/build/routes/basketItems.js`) вместо `404` или `400`.
15. Добавление в корзину с отрицательным количеством (`POST /api/BasketItems/`, `quantity` -1) возвращает `200`, строка создаётся. Валидация количества отсутствует.
16. Повторное добавление уже лежащего в корзине товара через `POST /api/BasketItems/` возвращает `500` и страницу ошибки со стеком (`sequelize`, пути к файлам сервера) вместо понятного отказа или увеличения количества.
17. Добавление с `quantity` = 0 (`POST /api/BasketItems/`) возвращает `200`, строка с нулевым количеством создаётся и отдаётся в корзине.
18. Нечисловое `quantity` (`"abc"`) даёт `400`, но с вводящим в заблуждение сообщением «We are out of stock!» вместо указания на неверный тип данных.
19. Дробное количество (`quantity` 1.5) принимается: `200`, `data.quantity` = 1.5.
20. Чтение чужой строки корзины: `GET /api/BasketItems/{id}` с токеном аккаунта A возвращает `200` и данные строки из корзины B (`id` 10) и из корзины 1 (`id` 2). Принадлежность строки владельцу токена не проверяется. Серьёзность высокая. Вместе с пунктами 11 и 12 это общий пробел: защита сводится к проверке наличия токена, а `POST` в чужую корзину отклоняется.

## Сводный список проверок для Postman

- Токен: заголовок без cookie, cookie без заголовка, испорченный токен, отсутствие токена
- Auth: выполнено (см. шаги 0–1)
- Search: поведение `q` (см. шаг 2)
- Basket: границы `quantity`, несуществующие и чужие id (см. шаги 3–4)
- Авторизация: GET чужой корзины (TC-009), PUT и GET чужой строки `BasketItems`
