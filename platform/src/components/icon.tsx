type Props = {
  name: string
  className?: string | undefined
}

const Icon = (props: Props) => {
  return (
    <svg className={props.className}>
      <use xlinkHref={'#' + props.name} />
    </svg>
  )
}

export default Icon
