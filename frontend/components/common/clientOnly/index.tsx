import { useEffect, useState } from 'react'
import type { PropsWithChildren } from 'react'

export default function ClientOnly({ children }: PropsWithChildren<{}>) {
  const [hasMounted, setHasMounted] = useState(false)
  useEffect(() => {
    setHasMounted(true)
  }, [])
  if (!hasMounted) {
    return null
  }
  return <> {children} </>
}
