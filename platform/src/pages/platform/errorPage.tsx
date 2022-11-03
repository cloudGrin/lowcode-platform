import React from 'react'
import { useRouteError, isRouteErrorResponse } from 'react-router-dom'

export default function ErrorPage() {
  const error = useRouteError()

  if (isRouteErrorResponse(error) && error.status === 401) {
    // the response json is automatically parsed to
    // `error.data`, you also have access to the status
    return (
      <div>
        <h1>{error.status}</h1>
        <h2>{error.data}</h2>
      </div>
    )
  }

  // rethrow to let the parent error boundary handle it
  // when it's not a special case for this route
  throw error
}
