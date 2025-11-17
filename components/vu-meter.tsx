"use client"

import { useEffect, useRef } from "react"
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

const MeterFill = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 0%;
  background: #33ff66;
  transition: height 0.05s ease-out;
`

interface VUMeterProps {
  label: string
  player?: Tone.Player
  envelope?: Tone.AmplitudeEnvelope
  meterBus?: Tone.Gain
  isMaster?: boolean
}

export function VUMeter({ label, player, envelope, meterBus, isMaster = false }: VUMeterProps) {
  const meterRef = useRef<Tone.Meter | null>(null)
  const animationRef = useRef<number>(null)
  const fillRef = useRef<HTMLDivElement | null>(null)
  const lastTickRef = useRef<number>(0)

  useEffect(() => {
    // Prefer meterBus (fan-out from envelope), then envelope, then player
    const audioNode = meterBus || envelope || player
    if (!audioNode) {
      if (fillRef.current) {
        fillRef.current.style.height = "0%"
        fillRef.current.style.background = "#33ff66"
      }
      return
    }

    // Create a meter and connect it to the audio node
    const meter = new Tone.Meter()
    audioNode.connect(meter)
    meterRef.current = meter

    const updateLevel = (now: number) => {
      const last = lastTickRef.current
      if (!last || now - last >= 33) {
        lastTickRef.current = now
        if (meterRef.current && fillRef.current) {
          const value = meterRef.current.getValue()
          const dbValue = typeof value === "number" ? value : value[0]
          const normalized = Math.max(0, Math.min(100, ((dbValue + 60) / 60) * 100))
          fillRef.current.style.height = `${normalized}%`
          const color = normalized > 85 ? "#ff3333" : normalized > 70 ? "#ffaa33" : "#33ff66"
          fillRef.current.style.background = color
        }
      }
      animationRef.current = requestAnimationFrame(updateLevel)
    }

    animationRef.current = requestAnimationFrame(updateLevel)

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
        <MeterFill ref={fillRef} />
      </MeterBar>
      <MeterLabel>{label}</MeterLabel>
    </MeterContainer>
  )
}
