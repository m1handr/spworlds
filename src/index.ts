// Copyright (c) 2022 Matvey Ryabchikov
// Copyright (c) 2024 Mihandr
// MIT License

import { createHmac, timingSafeEqual } from 'crypto'
import type { Card, CardInfo, CardOwner, PaymentReq, User } from './types.js'

export class SPWorlds {
  private authorization: string
  private token: string

  private requestAPI = async (
    method: 'POST' | 'GET' | 'PUT',
    path: string,
    body: Record<string, unknown> | null
  ): Promise<any> => {
    const res = await fetch(`https://spworlds.ru/api/public/${path}`, {
      method: method,
      body: body ? JSON.stringify(body) : null,
      headers: {
        Authorization: this.authorization,
        'Content-Type': 'application/json'
      }
    })

    if (![200, 201, 404].includes(res.status))
      throw new Error(`Ошибка при запросе к API ${res.status} ${res.statusText}`)
    return await res.json()
  }

  /**
   * Класс для работы с SPWorlds API
   * @param id ID карты
   * @param token Токен карты
   */
  constructor({ id, token }: { id: string; token: string }) {
    this.authorization = `Bearer ${Buffer.from(`${id}:${token}`).toString('base64')}`
    this.token = token
  }

  /**
   * Проверка доступности SPWorlds API
   * @returns Состояние API
   */
  ping = async () => {
    return await this.getCardInfo().then(res => {
      if (!res) false
      return true
    })
  }

  /**
   * Создание банковского перевода
   * @param receiver Номер карты получателя
   * @param amount Сумма перевода
   * @param comment Комментарий к переводу
   * @returns Баланс карты
   */
  createTransaction = async ({
    receiver,
    amount,
    comment
  }: {
    receiver: string
    amount: number
    comment: string
  }): Promise<{ balance: string }> => {
    return this.requestAPI('POST', 'transactions', {
      receiver,
      amount,
      comment
    }).then(res => res)
  }

  /**
   * Получение информации о карте
   * @returns Баланс и подключенный webhook
   */
  getCardInfo = async (): Promise<CardInfo> => {
    return this.requestAPI('GET', 'card', null).then(res => res)
  }

  /**
   * Получение информации о владельце токена
   * @returns Никнейм, статус, роли, город, банковские карты и время создания
   */
  getCardOwner = async (): Promise<CardOwner> => {
    return this.requestAPI('GET', 'accounts/me', null).then(res => res)
  }

  /**
   * Получение карт пользователя
   * @param Nickname Никнейм пользователя
   * @returns Массив с банковскими картами
   */
  getCards = async (nickname: string): Promise<Array<Card | undefined>> => {
    return this.requestAPI('GET', `accounts/${nickname}/cards`, null).then(res => res)
  }

  /**
   * Получение ника игрока
   * @param discordId ID пользователя Discord
   * @returns Никнейм и Minecraft UUID игрока
   */
  findUser = async (discordId: string): Promise<User | null> => {
    return this.requestAPI('GET', `users/${discordId}`, null).then(
      (res: { username: string; uuid: string }) => {
        if (res.username || res.uuid) return res
        return null
      }
    )
  }

  /**
   * Изменение вебхука карты
   * На вебхук будут отправляться все новые транзакции связанные с картой
   * @param url Ссылка на вебхук
   * @returns ID карты и обновленный webhook
   */
  setWebhook = async (url: string): Promise<{ id: string; webhook: string }> => {
    return this.requestAPI('PUT', 'card/webhook', {
      url: url
    }).then(res => res)
  }

  /**
   * Создание запроса на оплату
   * @param items Товары транзакции
   * @param redirectUrl URL страницы, на которую попадет пользователь после оплаты
   * @param webhookUrl URL, куда наш сервер направит запрос, чтобы оповестить ваш сервер об успешной оплате
   * @param data Cюда можно поместить любые полезные данных. Ограничение - 100 символов.
   * @returns Ссылка на страницу оплаты, на которую нужно перенаправить пользователя
   */
  initPayment = async ({
    items,
    redirectUrl,
    webhookUrl,
    data
  }: PaymentReq): Promise<{ url: string }> => {
    if (data && data.length > 100) throw new Error('Data не может быть длиннее 100 символов')

    for (const item of items) {
      if (item.name.length < 3 || item.name.length > 64)
        throw new Error('Название товара не может быть меньше 3 и больше 64 символов')
      if (item.count < 1 || item.count > 9999)
        throw new Error('Количество товара не может быть меньше 1 и больше 9999')
      if (item.price < 1 || item.price > 1728)
        throw new Error('Цена товара не может быть меньше 1 и больше 1728')
      if (item.comment && item.comment.length > 100)
        throw new Error('Комментарий не может быть длиннее 100 символов')
    }

    return this.requestAPI('POST', 'payments', {
      items,
      redirectUrl,
      webhookUrl,
      data
    }).then(res => res)
  }

  /**
   * Проверка валидности вебхука
   * @param body Все данные, пришедшие по вебхуку
   * @param hashHeader Значение хедера `X-Body-Hash`
   */
  validateHash = (body: string | object, hashHeader: string): boolean => {
    return timingSafeEqual(
      Buffer.from(
        createHmac('sha256', this.token)
          .update(typeof body === 'string' ? body : JSON.stringify(body))
          .digest('base64')
      ),
      Buffer.from(hashHeader)
    )
  }
}
