// Copyright (c) 2022 Matvey Ryabchikov
// Copyright (c) 2024-2025 Mihandr
// MIT License

export type CardOwner = {
  id: string
  username: string
  minecraftUUID: string
  status: string
  roles: string[]
  city: {
    id: string
    name: string
    description: string
    x: number
    z: number
    isMayor: boolean
  } | null
  cards: {
    id: string
    name: string
    number: string
    color: string
  } | null
  createdAt: string
}

export type CardInfo = {
  balance: number
  webhook: string | null
}

export type Card = {
  name: string
  number: string
}

export type User = {
  username: string
  uuid: string
}

export type PaymentReq = {
  items: Array<{
    name: string
    count: number
    price: number
    comment?: string
  }>
  redirectUrl: string
  webhookUrl: string
  data: string
}
