# JS Библиотека сайтов СП

Это библиотека для Node.js для упрощения API сайтов СП. Документация к API [тут](https://github.com/sp-worlds/api-docs).

## Установка

Вы можете установить эту библиотеку при помощи
`npm` или альтернативного пакетного менеджера (`pnpm`, `yarn`).

```
npm i spworlds
```

## Использование

```js
import { SPWorlds } from 'spworlds'
// const { SPWorlds } = require('spworlds');

// Где получить ID и токен - https://github.com/sp-worlds/api-docs/blob/main/AUTHORIZATION.md#%D0%BF%D0%BE%D0%BB%D1%83%D1%87%D0%B5%D0%BD%D0%B8%D0%B5-%D1%82%D0%BE%D0%BA%D0%B5%D0%BD%D0%B0-%D0%B8-id-%D0%BA%D0%B0%D1%80%D1%82%D1%8B
const api = new SPWorlds({ id: 'ID карты', token: 'Токен карты' })
```

## Использование

### Проверка доступности SPWorlds API

```js
const pong = await api.ping()

if (pong) {
  return 'Работает!!'
} else {
  return 'Не работает :('
}
```

### Инициализирование платежной формы

Если вы хотите принимать оплату в АРах на своем сайте, используйте этот метод.

Получение ссылки на страницу оплаты 16 АР, после успешной оплаты пользователь перейдет со страницы оплаты на `https://eximple.com/success`, а сайт СП отправит запрос на `https://api.example.com/webhook` с данными этого платежа, в том числе и `SomeString`. Последнее поле можно использовать, например, для ID заказа или чего-то подобного.

```js
const url = await api.initPayment({
  items: [
    {
      name: 'SomeName',
      count: '1',
      price: '1',
      comment: 'SomeComment'
    }
  ],
  redirectUrl: 'https://eximple.com/success',
  webhookUrl: 'https://api.example.com/webhook',
  data: 'SomeString'
})
```

### Перевод АРов на другую карту

Перевод 16 АР на карту с номером 55555 и комментарием "С днем рождения!"

```js
api.createTransaction({
  receiver: '55555',
  amount: '16',
  comment: 'С днём рождения!'
})
```

### Получение информации о карте

Метод возвращает объект с балансом и подключенным к карте вебхуком

```js
const balance = await api.getCardInfo()
```

### Получение всех карт игрока

Метод возвращает массив со следующими значениями:

`name` - Название карты
`number` - Номер карты

```js
const cards = await api.getCards('5opka')
```

### Получение информации о владельце токена

Метод возвращает объект с большим количеством информации, которую можно узнать из [официальной документации API](https://github.com/sp-worlds/api-docs/wiki/%D0%9F%D0%BE%D0%BB%D1%83%D1%87%D0%B5%D0%BD%D0%B8%D0%B5-%D0%B0%D0%BA%D0%BA%D0%B0%D1%83%D0%BD%D1%82%D0%B0-%D0%B2%D0%BB%D0%B0%D0%B4%D0%B5%D0%BB%D1%8C%D1%86%D0%B0-%D1%82%D0%BE%D0%BA%D0%B5%D0%BD%D0%B0)

```js
const user = await api.getCardOwner()
```

### Получение ника игрока

Метод принимает ID игрока в Discord и возвращает его nickname и uuid, если у него есть проходка на сервер.

```js
const userData = await api.findUser('111111111111111111')

if (!userData) throw 'У этого игрока нет проходки'

console.log(`Никнейм игрока: ${userData.username}`)
console.log(`Айди игрока: ${userData.uuid}`)
```

### Установка вебхука для карты

Метод возвращает `id` и установленный `webhook` карты

На установленный вебхук будут отправляться все новые транзакции связанные с картой
_Данные будут отправлены через POST запрос_

```js
const res = await api.setWebhook('https://api.example.com/webhook')
```

### Подтверждение вебхука

Проверка хеша из `req.headers['X-Body-Hash']` на валидность. Если метод возвращает не true, не обрабатывайте этот запрос.

```js
const isValid = api.validateHash(req.body, req.headers['X-Body-Hash'])

if (!isValid) throw 'Ошибка проверки цифровой подписи'
```

## Contributing

Если вы хотите дополнить или улучшить библиотеку или документацию к ней, то сделайте pull запрос к этому репозиторию. Пожалуйста, используйте [pnpm](https://pnpm.io/) вместо npm и форматируйте js и ts код при помощи [prettier](https://prettier.io/), чтобы все было красиво.
