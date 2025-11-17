"use client"

import type React from "react"
import styled from "styled-components"

interface KitSelectorProps {
  kitName: string
  onPrevKit: () => void
  onNextKit: () => void
}

const KitSelectorContainer = styled.div`
  background:
    linear-gradient(145deg, #2f2f2f, #252525);
  padding: 12px 18px;
  border-radius: 8px;
  border: 3px solid #1a1a1a;
  box-shadow:
    inset 0 3px 8px rgba(0, 0, 0, 0.6),
    0 2px 4px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 6px;
    background: linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 50%, rgba(0,0,0,0.1) 100%);
    pointer-events: none;
  }
`

const NavButton = styled.button`
  background:
    linear-gradient(145deg, #4a4a4a, #3a3a3a);
  border: 2px solid #2a2a2a;
  color: #7eb3e8;
  padding: 8px 16px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.1s ease;
  font-family: 'Courier New', monospace;
  box-shadow:
    0 3px 8px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  text-shadow: 0 0 4px rgba(126, 179, 232, 0.5);

  &:hover {
    background: linear-gradient(145deg, #5a5a5a, #4a4a4a);
    border-color: #3a3a3a;
    color: #9ac5f0;
    box-shadow:
      0 3px 10px rgba(126, 179, 232, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }

  &:active {
    transform: translateY(2px);
    box-shadow:
      inset 0 2px 6px rgba(0, 0, 0, 0.6),
      0 1px 3px rgba(0, 0, 0, 0.4);
  }
`

const KitName = styled.div`
  color: #fbbf24;
  font-size: 14px;
  font-weight: bold;
  text-transform: uppercase;
  min-width: 220px;
  text-align: center;
  text-shadow:
    0 0 6px rgba(251, 191, 36, 0.6),
    0 1px 2px rgba(0, 0, 0, 0.8);
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
`

export const KitSelector: React.FC<KitSelectorProps> = ({ kitName, onPrevKit, onNextKit }) => {
  return (
    <KitSelectorContainer>
      <NavButton onClick={onPrevKit}>◀</NavButton>
      <KitName>{kitName}</KitName>
      <NavButton onClick={onNextKit}>▶</NavButton>
    </KitSelectorContainer>
  )
}
