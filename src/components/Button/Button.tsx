'use client'

import { default as MuiButton } from '@mui/material/Button'

export interface IButton {
  children?: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

const Button = ({ children, onClick, type, ...rest }: IButton) => {
  return (
    <MuiButton type={type} onClick={onClick} {...rest}>
      {children}
    </MuiButton>
  )
}

export default Button
