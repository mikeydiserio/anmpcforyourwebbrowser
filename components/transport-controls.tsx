"use client"

import type React from "react"
import styled from "styled-components"

interface TransportControlsProps {
  isPlaying: boolean
  bpm: number
  onPlay: () => void
  onStop: () => void
  onBPMChange: (bpm: number) => void
  onClear: () => void
}

const ControlsContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  background: #2a2a2a;
  padding: 8px 16px;
  border-radius: 4px;
  border: 2px solid #444;
  height: 40px;
  box-sizing: border-box;
`

const Button = styled.button<{ $variant?: "play" | "stop" | "clear" }>`
  padding: 6px 16px;
  font-size: 12px;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.1s ease;
  text-transform: uppercase;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

  background: ${(props) => {
    switch (props.$variant) {
      case "play":
        return "linear-gradient(145deg, #4ade80, #16a34a)"
      case "stop":
        return "linear-gradient(145deg, #f87171, #dc2626)"
      case "clear":
        return "linear-gradient(145deg, #fbbf24, #d97706)"
      default:
        return "linear-gradient(145deg, #6b6b6b, #4a4a4a)"
    }
  }};

  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.4);
  }

  &:active {
    transform: translateY(0);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const BPMControl = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const BPMLabel = styled.label`
  color: #aaa;
  font-size: 11px;
  font-weight: bold;
  text-transform: uppercase;
`

const BPMInput = styled.input`
  width: 60px;
  padding: 4px 6px;
  background: #1a1a1a;
  border: 2px solid #444;
  border-radius: 4px;
  color: #4ade80;
  font-size: 14px;
  font-weight: bold;
  text-align: center;

  &:focus {
    outline: none;
    border-color: #666;
  }
`

export const TransportControls: React.FC<TransportControlsProps> = ({
  isPlaying,
  bpm,
  onPlay,
  onStop,
  onBPMChange,
  onClear,
}) => {
  return (
    <ControlsContainer>
      <Button $variant={isPlaying ? undefined : "play"} onClick={onPlay} disabled={isPlaying}>
        {isPlaying ? "Playing" : "Play"}
      </Button>
      <Button $variant="stop" onClick={onStop} disabled={!isPlaying}>
        Stop
      </Button>
      <Button $variant="clear" onClick={onClear}>
        Clear
      </Button>
      <BPMControl>
        <BPMLabel>BPM:</BPMLabel>
        <BPMInput type="number" min="40" max="240" value={bpm} onChange={(e) => onBPMChange(Number(e.target.value))} />
      </BPMControl>
    </ControlsContainer>
  )
}
