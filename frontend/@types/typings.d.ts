declare module '*.svg'
declare module '*.svg?sprite'
declare module '*.png'
declare module '*.module.less' {
  const classes: { [key: string]: string }
  export default classes
}
