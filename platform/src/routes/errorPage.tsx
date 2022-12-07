import React from 'react'
import { useRouteError, isRouteErrorResponse } from 'react-router-dom'

export default function ErrorPage() {
  const error = useRouteError()
  console.error(error)
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return <div>This page doesn't exist!</div>
    }

    if (error.status === 401) {
      return <div>You aren't authorized to see this</div>
    }
  }

  return <div>Something went wrong</div>
}
