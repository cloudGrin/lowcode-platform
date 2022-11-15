interface ApiTypes {
  ['/api/project-routes/updateOrder__POST']: ApiProjectRoutesUpdateOrder__POST
}

interface ApiProjectRoutesUpdateOrder__POST {
  request: ApiProjectRoutesUpdateOrderRequest__POST
  response: ApiProjectRoutesUpdateOrderResponse__POST
}

interface ApiProjectRoutesUpdateOrderRequest__POST {
  currentId: number | string
  ids: number | string[]
  parentNavUuid: string
}

interface ApiProjectRoutesUpdateOrderResponse__POST {
  data: {
    success: boolean
  }
}
