import React from 'react'

const IconBase = ({ style, children, size, viewBox, ...rest }: IIconBase) => {
  const defaultStyles = {
    verticalAlign: 'middle',
  }
  const svgProps = {
    fill: 'currentColor',
    width: size,
    height: size,
  }

  return (
    <svg
      {...svgProps}
      {...rest}
      preserveAspectRatio="xMidYMid meet"
      style={{ ...defaultStyles, ...style }}
    >
      {children}
    </svg>
  )
}

export interface IIconBase {
  className: string
  children: React.ReactNode
  size?: any
  style?: any
  viewBox?: string
}

export default IconBase
