import { FC } from 'react'

type Props = {
  name: string
  className?: string | undefined
}

const Icon: FC<Props> = (props) => {
  return (
    <svg className={props.className}>
      <use xlinkHref={'#' + props.name} />
    </svg>
  )
}

export default Icon
