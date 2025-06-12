'use client'
import { useState } from 'react'
import Select from 'react-select'
import * as S from './SearchAndFilter.styles'
export interface ISearchAndFilter {
  searchTerm?: string
  setSearchTerm: (e: any) => void
  activeFilter: string
}

type Props = {
  label: string
  placeholder?: string
  onChange: (e?: Event) => void
  name?: string
  value?: string
}

const filterOptions = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' },
]

const SearchAndFilter = ({
  searchTerm,
  activeFilter,
  setSearchTerm,
}: ISearchAndFilter) => {
  const [selectedOption, setSelectedOption] = useState(null)

  const handleFilterChange = (e: any) => {
    console.log(e)
  }

  const handleChange = (event: any) => {
    const targetValue = event.target.value
    setSearchTerm(targetValue)
  }
  return (
    <S.Container>
      <S.Left>
        <S.Input
          placeholder={'search the library'}
          onChange={e => handleChange(e)}
          name="search"
          value={searchTerm}
        />
      </S.Left>
      <S.Right>
        <Select
          placeholder="Sort by"
          name="Filter"
          isClearable={false}
          defaultValue={selectedOption}
          onChange={setSelectedOption as any}
          value={activeFilter}
          onBlur={() => {
            console.log('call a validation method here')
          }}
          onFocus={() => {
            console.log('focused')
          }}
          options={filterOptions as any}
        />
      </S.Right>
    </S.Container>
  )
}

export default SearchAndFilter
