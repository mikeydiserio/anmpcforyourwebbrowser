import React from 'react'
import Avatar from 'components/Avatar'

const UserOption = (props) => {
  const {
    onSelect,
    option,
    onFocus,
    isFocused,
    onUnfocus,
    className,
  } = props

  const handleMouseDown = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onSelect(option, e)
  }

  const handleMouseEnter = (e) => {
    onFocus(option, e)
  }

  const handleMouseMove = (e) => {
    if (isFocused) { return }
    onFocus(option, e)
  }

  const handleMouseLeave = (e) => {
    onUnfocus(option, e)
  }

  return (
    <div
      className={className}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      title={option.title}
    >
      <Avatar
        title={option.label}
        size="small"
      />
      {option.label}
    </div>
  )
}

UserOption.propTypes = {
  className: PropTypes.string,
  isFocused: PropTypes.bool,
  onFocus: PropTypes.func,
  onSelect: PropTypes.func,
  onUnfocus: PropTypes.func,
  option: PropTypes.object.isRequired,
}

UserOption.defaultProps = {
  className: null,
  isFocused: false,
  onFocus: null,
  onSelect: null,
  onUnfocus: null,
}

export default UserOption
