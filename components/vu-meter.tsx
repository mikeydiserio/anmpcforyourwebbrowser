"use client"

import { useEffect, useRef, useState } from "react"
import styled from "styled-components"
import * as Tone from "tone"

const MeterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`

const MeterLabel = styled.div`
  font-size: 10px;
  color: #aaa;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60px;
  text-align: center;
`

const MeterBar = styled.div`
  width: 8px;
  height: 80px;
  background: #1a1a1a;
  border: 1px solid #444;
  border-radius: 2px;
  position: relative;
  overflow: hidden;
`

const MeterFill = styled.div<{ level: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${(props) => props.level}%;
  background: ${(props) => {
    if (props.level > 85) return "#ff3333"
    if (props.level > 70) return "#ffaa33"
    return "#33ff66"
  }};
  transition: height 0.05s ease-out;
`

interface VUMeterProps {
  label: string
  player?: Tone.Player
  envelope?: Tone.AmplitudeEnvelope
  meterBus?: Tone.Volume
  isMaster?: boolean
}

export function VUMeter({ label, player, envelope, meterBus, isMaster = false }: VUMeterProps) {
  const [level, setLevel] = useState(0)
  const meterRef = useRef<Tone.Meter | null>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    // Prefer meterBus (fan-out from envelope), then envelope, then player
    const audioNode = meterBus || envelope || player
    if (!audioNode) {
      setLevel(0)
      return
    }

    // Create a meter and connect it to the audio node
    const meter = new Tone.Meter()
    audioNode.connect(meter)
    meterRef.current = meter

    const updateLevel = () => {
      if (meterRef.current) {
        const value = meterRef.current.getValue()
        const dbValue = typeof value === "number" ? value : value[0]
        // Convert dB to percentage (0-100)
        // Normalize: -60dB to 0dB maps to 0% to 100%
        const normalized = Math.max(0, Math.min(100, ((dbValue + 60) / 60) * 100))
        setLevel(normalized)
      }
      animationRef.current = requestAnimationFrame(updateLevel)
    }

    updateLevel()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (meterRef.current) {
        meterRef.current.dispose()
      }
    }
  }, [player, envelope, meterBus])

  return (
    <MeterContainer>
      <MeterBar>
        <MeterFill level={level} />
      </MeterBar>
      <MeterLabel>{label}</MeterLabel>
    </MeterContainer>
  )
}
