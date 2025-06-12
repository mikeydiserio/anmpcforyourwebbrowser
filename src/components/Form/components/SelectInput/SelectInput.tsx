import ReactSelect from 'react-select'
import * as S from './SelectInput.styles'

export interface ISelectInput {
  floatedLabel: string
  isClearable?: boolean
  multi?: boolean
  disabled: boolean
  onChange: (e: any) => void
  onFocus?: (e: any) => void
  name: string
  onBlur: (e: any) => void
  options: any
  placeholder: string
  searchable?: boolean
  value: any
  error: any
  label?: string
  note?: string
  valid?: boolean
}

const defaultProps = {
  label: '',
  value: '',
  floatedLabel: true,
  error: '',
  valid: true,
  disabled: false,
  placeholder: '',
  searchable: false,
  multi: false,
  isClearable: false,
  note: '',
}

export const SelectInput = ({
  floatedLabel,
  isClearable,
  multi,
  disabled,
  onChange,
  name,
  onBlur,
  onFocus,
  options,
  placeholder,
  searchable,
  value,
  error,
  label,
  note,
  valid,
}: ISelectInput) => {
  const allowLabel = !floatedLabel ? 'disablFloatedLabel' : ''
  const _handleBlur = () => {
    onBlur(name)
  }
  const _handleChange = (option: any) => {
    onChange(option.value)
  }

  return (
    <S.SelectBox displayNote={!valid} allowLabel={!!allowLabel}>
      <ReactSelect
        isClearable={isClearable}
        isMulti={multi}
        isDisabled={disabled}
        name={name}
        onBlur={_handleBlur}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        isSearchable={searchable}
        value={value}
      />

      <span className="selectBar" />
      {label && <S.SelectLabel hasError={error}>{label}</S.SelectLabel>}
      {note && <S.Note isHidden={!!note}>{note}</S.Note>}
      {/* {error && <span className={classnames(styles.error)}>{error}</span>} */}
    </S.SelectBox>
  )
}

export default SelectInput
