"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import styled from "styled-components"

const KnobContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`

const KnobSvg = styled.svg`
  cursor: pointer;
  user-select: none;
`

const KnobLabel = styled.div`
  color: #88c0d0;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const KnobValue = styled.div`
  color: #d4af37;
  font-size: 11px;
  font-weight: bold;
`

interface KnobProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  disabled?: boolean
  unit?: string
}

export function Knob({ label, value, min, max, step = 0.01, onChange, disabled = false, unit = "" }: KnobProps) {
  const [isDragging, setIsDragging] = useState(false)
  const startYRef = useRef(0)
  const startValueRef = useRef(0)

  const normalizedValue = (value - min) / (max - min)
  const rotation = normalizedValue * 270 - 135 // -135 to +135 degrees

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return
    console.log("[v0] Knob mouse down:", label, "current value:", value)
    setIsDragging(true)
    startYRef.current = e.clientY
    startValueRef.current = value
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = startYRef.current - e.clientY
      const range = max - min
      const sensitivity = range / 200 // 200 pixels for full range
      const newValue = Math.max(min, Math.min(max, startValueRef.current + deltaY * sensitivity))
      console.log("[v0] Knob dragging:", label, "new value:", newValue.toFixed(2))
      onChange(Number(newValue.toFixed(2)))
    }

    const handleMouseUp = () => {
      console.log("[v0] Knob mouse up:", label)
      setIsDragging(false)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, max, min, onChange])

  return (
    <KnobContainer>
      <KnobLabel>{label}</KnobLabel>
      <KnobSvg
        width="50"
        height="50"
        viewBox="0 0 50 50"
        onMouseDown={handleMouseDown}
        style={{ opacity: disabled ? 0.5 : 1 }}
      >
        {/* Outer ring */}
        <circle cx="25" cy="25" r="22" fill="#1a3a5a" stroke="#3a6a9a" strokeWidth="2" />

        {/* Inner circle */}
        <circle cx="25" cy="25" r="18" fill="#0a1a2a" />

        {/* Indicator line */}
        <line
          x1="25"
          y1="25"
          x2="25"
          y2="10"
          stroke="#d4af37"
          strokeWidth="3"
          strokeLinecap="round"
          transform={`rotate(${rotation} 25 25)`}
        />

        {/* Center dot */}
        <circle cx="25" cy="25" r="3" fill="#d4af37" />
      </KnobSvg>
      <KnobValue>
        {value.toFixed(2)}
        {unit}
      </KnobValue>
    </KnobContainer>
  )
}
