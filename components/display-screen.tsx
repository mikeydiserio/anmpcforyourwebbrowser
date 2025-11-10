"use client"

import type React from "react"
import styled from "styled-components"

interface DisplayScreenProps {
  mode: string
  info: string
}

const Screen = styled.div`
  background: 
    linear-gradient(180deg, #1a3f6f 0%, #2a5f8f 50%, #1a3f6f 100%);
  border: 5px solid #0a0a0a;
  border-radius: 6px;
  padding: 18px 26px;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 
    inset 0 4px 12px rgba(0, 0, 0, 0.8),
    inset 0 -2px 6px rgba(100, 150, 200, 0.1),
    0 2px 6px rgba(0, 0, 0, 0.6);
  font-family: 'Courier New', monospace;
  position: relative;
  
  /* LCD pixel grid texture */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 2px;
    background-image: 
      repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.15) 1px, rgba(0,0,0,0.15) 2px),
      repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0,0,0,0.15) 1px, rgba(0,0,0,0.15) 2px);
    background-size: 2px 2px;
    opacity: 0.3;
    pointer-events: none;
  }
  
  /* Glass reflection effect */
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 40%;
    background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%);
    border-radius: 2px 2px 0 0;
    pointer-events: none;
  }
`

const ModeText = styled.div`
  color: #4ade80;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 
    0 0 6px rgba(74, 222, 128, 0.8),
    0 0 12px rgba(74, 222, 128, 0.4),
    0 1px 2px rgba(0, 0, 0, 0.8);
  filter: brightness(1.1);
`

const InfoText = styled.div`
  color: #60a5fa;
  font-size: 16px;
  font-weight: bold;
  text-shadow: 
    0 0 6px rgba(96, 165, 250, 0.8),
    0 0 12px rgba(96, 165, 250, 0.4),
    0 1px 2px rgba(0, 0, 0, 0.8);
  filter: brightness(1.1);
`

const SoftKeys = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`

const SoftKey = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 10px;
  text-transform: uppercase;
`

export const DisplayScreen: React.FC<DisplayScreenProps> = ({ mode, info }) => {
  return (
    <Screen>
      <ModeText>{mode}</ModeText>
      <InfoText>{info}</InfoText>
      <SoftKeys>
        <SoftKey>[LOAD]</SoftKey>
        <SoftKey>[SAVE]</SoftKey>
        <SoftKey>[EDIT]</SoftKey>
        <SoftKey>[MENU]</SoftKey>
      </SoftKeys>
    </Screen>
  )
}
