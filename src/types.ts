export type CardOwner = {
  id: string
  username: string
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
  webhook: string
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
    amount: number
    comment?: string
  }>
  redirectUrl: string
  webhookUrl: string
  data: string
}
