import { useEffect, useRef, useState } from 'react'

const useQuery = () => {
  const [query, setQuery] = useState(new URLSearchParams(location.search))
  const preSearch = useRef(location.search)
  useEffect(() => {
    if (preSearch.current !== location.search) {
      setQuery(new URLSearchParams(location.search))
      preSearch.current = location.search
    }
  })
  return query
}

export default useQuery
