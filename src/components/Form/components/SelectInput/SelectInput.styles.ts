import styled from '@emotion/styled'

export const SelectBox = styled.div<{displayNote?: boolean, allowLabel: boolean}>`
  opacity: ${({ displayNote }) => displayNote ? 1 : 0};
`
export const SelectLabel = styled.div<{hasError: boolean}>`
  position: absolute;
  top: 3.2rem;
  left: 0;
  font-size: 1.4rem;
  line-height: 1.4rem;
  color: rgba(0, 0, 0, 0.26);
  pointer-events: none;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 0.35s;
  transition-property: top, font-size, color;
}

`
export const Note = styled.div<{isHidden:boolean}>`
.note {
  font-size: 24px
  font-weight: normal;
  line-height: normal;
  text-size-adjust: 100%;
  bottom: 20px;
  position: relative;
  transition: opacity .22s ease-in-out, transform .22s ease-in-out;

  &.isHidden {
    opacity: 0;
    transform: translateY(20px);
  }
}`


export const SelectBar = styled.span<{}>`
    position: relative;
    display: block;
    width: 100%;
    z-index: 10;

    &:before,
    &:after {
      position: absolute;
      bottom: 0;
      width: 0;
      height: 2px;
      content: "";
      background-color: $bright-blue;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 0.2s;
      transition-property: width, background-color;
    }

    &:before {
      left: 50%;
    }

    &:after {
      right:50%;
    }
}
`
