"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import styled from "styled-components"
import type * as Tone from "tone"
import { Knob } from "./knob"
import { DEFAULT_FX_PARAMS } from "@/lib/audio-engine"
import type { ADSRParams, EQParams, FXParams } from "@/lib/audio-engine"

const EditorContainer = styled.div`
  background: linear-gradient(145deg, #c8c0b0, #b0a898);
  border: 3px solid #8a826e;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 
    inset 0 2px 6px rgba(255, 255, 255, 0.3),
    inset 0 -2px 8px rgba(0, 0, 0, 0.4),
    0 4px 12px rgba(0, 0, 0, 0.5),
    0 2px 4px rgba(0, 0, 0, 0.3);
  height: 450px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      linear-gradient(45deg, transparent 48%, rgba(0,0,0,0.02) 50%, transparent 52%),
      linear-gradient(-45deg, transparent 48%, rgba(0,0,0,0.02) 50%, transparent 52%);
    background-size: 3px 3px;
    pointer-events: none;
    border-radius: 8px;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 10%;
    left: 5%;
    width: 60px;
    height: 2px;
    background: rgba(0, 0, 0, 0.1);
    transform: rotate(-5deg);
    pointer-events: none;
    border-radius: 1px;
  }
`

const EditorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(138, 130, 110, 0.5);
  position: relative;
  z-index: 1;
`

const TabContainer = styled.div`
  display: flex;
  gap: 8px;
`

const Tab = styled.button<{ $active: boolean }>`
  background: ${(props) =>
    props.$active ? "linear-gradient(145deg, #f0e8d0, #d8d0b8)" : "linear-gradient(145deg, #4a4a4a, #3a3a3a)"};
  color: ${(props) => (props.$active ? "#2a2a2a" : "#888")};
  border: 2px solid ${(props) => (props.$active ? "#c8c0b0" : "#2a2a2a")};
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.1s;
  box-shadow: ${(props) =>
    props.$active
      ? "inset 0 2px 4px rgba(0,0,0,0.2), 0 1px 2px rgba(255,255,255,0.3)"
      : "inset 0 -2px 4px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)"};

  &:hover {
    background: ${(props) =>
      props.$active ? "linear-gradient(145deg, #f5edd5, #ddd5bd)" : "linear-gradient(145deg, #555, #444)"};
  }
  
  &:active {
    box-shadow: inset 0 2px 6px rgba(0,0,0,0.3);
    transform: translateY(1px);
  }
`

const PadInfo = styled.div`
  color: #2a2a2a;
  font-size: 12px;
  font-weight: bold;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.3);
`

const PadSelectorContainer = styled.div`
  position: relative;
  z-index: 10;
`

const PadSelectorButton = styled.button<{ $open: boolean }>`
  background: linear-gradient(145deg, #f0e8d0, #d8d0b8);
  color: #2a2a2a;
  border: 2px solid #c8c0b0;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.1s;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.2), 0 1px 2px rgba(255,255,255,0.3);
  min-width: 140px;
  justify-content: space-between;

  &:hover {
    background: linear-gradient(145deg, #f5edd5, #ddd5bd);
  }
  
  &:active {
    box-shadow: inset 0 2px 6px rgba(0,0,0,0.3);
    transform: translateY(1px);
  }

  ${(props) => props.$open && `
    box-shadow: inset 0 2px 6px rgba(0,0,0,0.3);
  `}
`

const Chevron = styled.span<{ $open: boolean }>`
  font-size: 10px;
  transition: transform 0.2s;
  transform: ${(props) => (props.$open ? "rotate(180deg)" : "rotate(0deg)")};
`

const PadDropdown = styled.div<{ $open: boolean }>`
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: linear-gradient(145deg, #f0e8d0, #d8d0b8);
  border: 2px solid #c8c0b0;
  border-radius: 4px;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  min-width: 180px;
  max-height: 300px;
  overflow-y: auto;
  display: ${(props) => (props.$open ? "block" : "none")};
  z-index: 100;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
  }
`

const PadDropdownItem = styled.button<{ $active: boolean }>`
  width: 100%;
  padding: 10px 14px;
  background: ${(props) => (props.$active ? "rgba(201, 42, 42, 0.2)" : "transparent")};
  color: #2a2a2a;
  border: none;
  border-bottom: 1px solid rgba(138, 130, 110, 0.3);
  text-align: left;
  font-size: 11px;
  font-weight: ${(props) => (props.$active ? "bold" : "normal")};
  cursor: pointer;
  transition: all 0.1s;

  &:hover {
    background: ${(props) => (props.$active ? "rgba(201, 42, 42, 0.3)" : "rgba(0, 0, 0, 0.05)")};
  }

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: rgba(201, 42, 42, 0.4);
  }
`

const ContentArea = styled.div`
  display: flex;
  gap: 12px;
  flex: 1;
`

const WaveformSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const WaveformCanvas = styled.canvas`
  width: 100%;
  height: 180px;
  background: #0a1a2a;
  border-radius: 4px;
  cursor: crosshair;
  border: 3px solid #1a3a5a;
  box-shadow: 
    inset 0 2px 8px rgba(0, 0, 0, 0.6),
    inset 0 0 20px rgba(10, 40, 80, 0.3),
    0 2px 4px rgba(0, 0, 0, 0.3);
`

const EQEnvelopeCanvas = styled.canvas`
  width: 100%;
  height: 120px;
  background: #0a1a2a;
  border-radius: 4px;
  border: 3px solid #1a3a5a;
  box-shadow: 
    inset 0 2px 8px rgba(0, 0, 0, 0.6),
    inset 0 0 20px rgba(10, 40, 80, 0.3),
    0 2px 4px rgba(0, 0, 0, 0.3);
`

const KnobsContainer = styled.div`
  display: flex;
  gap: 24px;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background: linear-gradient(145deg, #3a3a3a, #2a2a2a);
  border-radius: 4px;
  border: 2px solid #1a1a1a;
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.2);
`

const Controls = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const ControlLabel = styled.label`
  color: #d4af37;
  font-size: 10px;
  text-transform: uppercase;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`

const Slider = styled.input`
  width: 100px;
  height: 4px;
  background: #0a1a2a;
  border-radius: 2px;
  outline: none;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 12px;
    height: 12px;
    background: #d4af37;
    border-radius: 50%;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 12px;
    height: 12px;
    background: #d4af37;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
`

const VerticalSlider = styled.input`
  writing-mode: bt-lr;
  -webkit-appearance: slider-vertical;
  width: 8px;
  height: 200px;
  background: #0a1a2a;
  border-radius: 4px;
  outline: none;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    background: #d4af37;
    border-radius: 50%;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #d4af37;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
`

const VolumeControl = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 8px;
  background: linear-gradient(145deg, #3a3a3a, #2a2a2a);
  border-radius: 4px;
  border: 2px solid #1a1a1a;
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.2);
`

const ValueDisplay = styled.span`
  color: #d4af37;
  font-size: 11px;
  font-weight: bold;
  min-width: 40px;
  text-align: right;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`

const StartEndControls = styled.div`
  display: flex;
  gap: 16px;
  padding: 12px;
  background: linear-gradient(145deg, #3a3a3a, #2a2a2a);
  border-radius: 4px;
  border: 2px solid #1a1a1a;
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.2);
`

const EQContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
`

const EQKnobsRow = styled.div`
  display: flex;
  gap: 16px;
  justify-content: space-around;
  padding: 12px;
  background: linear-gradient(145deg, #3a3a3a, #2a2a2a);
  border-radius: 4px;
  border: 2px solid #1a1a1a;
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.2);
`

const FXContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  max-height: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
  padding-right: 8px;

  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: #1a1a1a;
    border-radius: 4px;
    box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.5);
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(145deg, #4a4a4a, #3a3a3a);
    border-radius: 4px;
    border: 1px solid #2a2a2a;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(145deg, #555, #444);
  }
`

const FXSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(145deg, #3a3a3a, #2a2a2a);
  border-radius: 4px;
  border: 2px solid #1a1a1a;
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.2);
`

const FXSectionTitle = styled.h4`
  color: #d4af37;
  font-size: 11px;
  text-transform: uppercase;
  margin: 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #4a4a4a;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`

const FXKnobsRow = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
`

const FXSelect = styled.select`
  background: #0a1a2a;
  color: #d4af37;
  border: 1px solid #3a6a9a;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 11px;
  cursor: pointer;
  outline: none;
  
  &:hover {
    border-color: #d4af37;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const FXSelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

interface WaveformEditorProps {
  selectedPad: number | null
  padLabel: string
  padLabels: string[]
  onPadSelect: (padId: number) => void
  onStartChange: (value: number) => void
  onEndChange: (value: number) => void
  onVolumeChange: (value: number) => void
  onPitchChange: (value: number) => void
  onADSRChange: (params: Partial<ADSRParams>) => void
  onEQChange: (params: Partial<EQParams>) => void
  onFXChange: (params: Partial<FXParams>) => void
  getPlayer: (padId: number) => Tone.Player | undefined
  getADSR: (padId: number) => ADSRParams
  getEQ: (padId: number) => EQParams
  getFX: (padId: number) => FXParams
  getStartPoint: (padId: number) => number
  getEndPoint: (padId: number) => number
  getPitch: (padId: number) => number
  getVolume: (padId: number) => number
}

export function WaveformEditor({
  selectedPad,
  padLabel,
  padLabels,
  onPadSelect,
  onStartChange,
  onEndChange,
  onVolumeChange,
  onPitchChange,
  onADSRChange,
  onEQChange,
  onFXChange,
  getPlayer,
  getADSR,
  getEQ,
  getFX,
  getStartPoint,
  getEndPoint,
  getPitch,
  getVolume,
}: WaveformEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const eqEnvelopeRef = useRef<HTMLCanvasElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [activeTab, setActiveTab] = useState<"sample" | "eq" | "fx">("sample")
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const [startPoint, setStartPoint] = useState(0)
  const [endPoint, setEndPoint] = useState(100)
  const [pitch, setPitch] = useState(0)
  const [volume, setVolume] = useState(0)
  const [adsr, setAdsr] = useState<ADSRParams>({
    attack: 0.01,
    decay: 0.1,
    sustain: 0.5,
    release: 0.2,
  })

  const [eqParams, setEqParams] = useState({
    lowGain: 0,
    lowMidGain: 0,
    midGain: 0,
    highMidGain: 0,
    highGain: 0,
  })

  const [fxParams, setFxParams] = useState<FXParams>({ ...DEFAULT_FX_PARAMS })

  const drawWaveform = (player: Tone.Player) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const buffer = player.buffer
    if (!buffer) return

    const width = canvas.width
    const height = canvas.height
    const data = buffer.getChannelData(0)
    const step = Math.ceil(data.length / width)
    const amp = height / 2

    ctx.fillStyle = "#0a1a2a"
    ctx.fillRect(0, 0, width, height)

    ctx.strokeStyle = "#4a9eff"
    ctx.lineWidth = 1
    ctx.beginPath()

    for (let i = 0; i < width; i++) {
      let min = 1.0
      let max = -1.0

      for (let j = 0; j < step; j++) {
        const datum = data[i * step + j]
        if (datum < min) min = datum
        if (datum > max) max = datum
      }

      ctx.moveTo(i, (1 + min) * amp)
      ctx.lineTo(i, (1 + max) * amp)
    }

    ctx.stroke()

    const padding = 20
    const attackTime = adsr.attack * 100
    const decayTime = adsr.decay * 100
    const releaseTime = adsr.release * 100
    const sustainLevel = adsr.sustain

    const totalTime = attackTime + decayTime + 100 + releaseTime
    const scaleX = (width - 2 * padding) / totalTime

    const x1 = padding
    const y1 = height - padding

    const x2 = x1 + attackTime * scaleX
    const y2 = padding

    const x3 = x2 + decayTime * scaleX
    const y3 = padding + (1 - sustainLevel) * (height - 2 * padding)

    const x4 = x3 + 100 * scaleX
    const y4 = y3

    const x5 = x4 + releaseTime * scaleX
    const y5 = height - padding

    ctx.strokeStyle = "#ff8c42"
    ctx.lineWidth = 3
    ctx.globalAlpha = 0.8
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.lineTo(x3, y3)
    ctx.lineTo(x4, y4)
    ctx.lineTo(x5, y5)
    ctx.stroke()
    ctx.globalAlpha = 1.0

    const startX = (startPoint / 100) * width
    const endX = (endPoint / 100) * width

    ctx.strokeStyle = "#d4af37"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(startX, 0)
    ctx.lineTo(startX, height)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(endX, 0)
    ctx.lineTo(endX, height)
    ctx.stroke()

    ctx.fillStyle = "rgba(212, 175, 55, 0.1)"
    ctx.fillRect(startX, 0, endX - startX, height)
  }

  const drawEQEnvelope = () => {
    const canvas = eqEnvelopeRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const padding = 20

    ctx.fillStyle = "#0a1a2a"
    ctx.fillRect(0, 0, width, height)

    ctx.strokeStyle = "rgba(138, 192, 208, 0.1)"
    ctx.lineWidth = 1
    for (let i = 0; i < 5; i++) {
      const y = padding + (i * (height - 2 * padding)) / 4
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    ctx.strokeStyle = "rgba(138, 192, 208, 0.3)"
    ctx.lineWidth = 1
    const centerY = height / 2
    ctx.beginPath()
    ctx.moveTo(padding, centerY)
    ctx.lineTo(width - padding, centerY)
    ctx.stroke()

    const segmentWidth = (width - 2 * padding) / 4
    const dbToY = (db: number) => centerY - (db / 24) * (height / 2 - padding)

    const points = [
      { x: padding, y: dbToY(eqParams.lowGain) },
      { x: padding + segmentWidth, y: dbToY(eqParams.lowMidGain) },
      { x: padding + segmentWidth * 2, y: dbToY(eqParams.midGain) },
      { x: padding + segmentWidth * 3, y: dbToY(eqParams.highMidGain) },
      { x: padding + segmentWidth * 4, y: dbToY(eqParams.highGain) },
    ]

    ctx.strokeStyle = "#ff8c42"
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)

    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1]
      const currPoint = points[i]
      const cp1x = prevPoint.x + (currPoint.x - prevPoint.x) / 3
      const cp1y = prevPoint.y
      const cp2x = prevPoint.x + (2 * (currPoint.x - prevPoint.x)) / 3
      const cp2y = currPoint.y
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, currPoint.x, currPoint.y)
    }
    ctx.stroke()

    ctx.fillStyle = "#d4af37"
    ctx.font = "9px sans-serif"
    const labels = ["60Hz", "250Hz", "1kHz", "4kHz", "12kHz"]
    labels.forEach((label, i) => {
      ctx.fillText(label, padding + i * segmentWidth - 15, height - 5)
    })
  }

  useEffect(() => {
    if (selectedPad === null) return

    const player = getPlayer(selectedPad)
    if (!player || !player.loaded) return

    drawWaveform(player)
  }, [selectedPad, getPlayer])

  useEffect(() => {
    if (selectedPad !== null) {
      const currentADSR = getADSR(selectedPad)
      setAdsr(currentADSR)
      const currentEQ = getEQ(selectedPad)
      setEqParams(currentEQ)
      const currentFX = getFX(selectedPad)
      setFxParams(currentFX)
      setStartPoint(getStartPoint(selectedPad))
      setEndPoint(getEndPoint(selectedPad))
      setPitch(getPitch(selectedPad))
      setVolume(getVolume(selectedPad))
    } else {
      setFxParams({ ...DEFAULT_FX_PARAMS })
    }
  }, [selectedPad, getADSR, getEQ, getFX, getStartPoint, getEndPoint, getPitch, getVolume])

  useEffect(() => {
    drawEQEnvelope()
  }, [eqParams])

  useEffect(() => {
    if (selectedPad === null) return
    const player = getPlayer(selectedPad)
    if (player && player.loaded) {
      drawWaveform(player)
    }
  }, [startPoint, endPoint, adsr, selectedPad, getPlayer])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [dropdownOpen])

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value)
    setStartPoint(value)
    onStartChange(value)
  }

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value)
    setEndPoint(value)
    onEndChange(value)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value)
    setVolume(value)
    onVolumeChange(value)
  }

  const handlePitchChange = (value: number) => {
    setPitch(value)
    onPitchChange(value)
  }

  const handleAttackChange = (value: number) => {
    setAdsr((prev) => ({ ...prev, attack: value }))
    onADSRChange({ attack: value })
  }

  const handleDecayChange = (value: number) => {
    setAdsr((prev) => ({ ...prev, decay: value }))
    onADSRChange({ decay: value })
  }

  const handleSustainChange = (value: number) => {
    setAdsr((prev) => ({ ...prev, sustain: value }))
    onADSRChange({ sustain: value })
  }

  const handleReleaseChange = (value: number) => {
    setAdsr((prev) => ({ ...prev, release: value }))
    onADSRChange({ release: value })
  }

  return (
    <EditorContainer>
      <EditorHeader>
        <TabContainer>
          <Tab $active={activeTab === "sample"} onClick={() => setActiveTab("sample")}>
            Sample Editor
          </Tab>
          <Tab $active={activeTab === "eq"} onClick={() => setActiveTab("eq")}>
            EQ
          </Tab>
          <Tab $active={activeTab === "fx"} onClick={() => setActiveTab("fx")}>
            FX
          </Tab>
        </TabContainer>

        <PadSelectorContainer ref={dropdownRef}>
          <PadSelectorButton
            $open={dropdownOpen}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            disabled={padLabels.length === 0}
          >
            <span>
              {selectedPad !== null
                ? `PAD ${selectedPad + 1}: ${padLabels[selectedPad] || padLabel}`
                : "SELECT PAD"}
            </span>
            <Chevron $open={dropdownOpen}>▼</Chevron>
          </PadSelectorButton>
          <PadDropdown $open={dropdownOpen}>
            {padLabels.map((label, idx) => (
              <PadDropdownItem
                key={idx}
                $active={selectedPad === idx}
                onClick={() => {
                  onPadSelect(idx)
                  setDropdownOpen(false)
                }}
              >
                PAD {idx + 1}: {label}
              </PadDropdownItem>
            ))}
          </PadDropdown>
        </PadSelectorContainer>
      </EditorHeader>

      <ContentArea>
        {activeTab === "sample" ? (
          <WaveformSection>
            <WaveformCanvas ref={canvasRef} width={600} height={180} />

            <StartEndControls>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <Knob
                  label="Pitch"
                  value={pitch}
                  min={-12}
                  max={12}
                  step={1}
                  onChange={handlePitchChange}
                  disabled={selectedPad === null}
                  unit="st"
                />
                
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                  <ControlGroup>
                    <ControlLabel>Start</ControlLabel>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <Slider
                        type="range"
                        min="0"
                        max="100"
                        step="0.1"
                        value={startPoint}
                        onChange={handleStartChange}
                        disabled={selectedPad === null}
                      />
                      <ValueDisplay>{startPoint.toFixed(1)}%</ValueDisplay>
                    </div>
                  </ControlGroup>

                  <ControlGroup>
                    <ControlLabel>End</ControlLabel>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <Slider
                        type="range"
                        min="0"
                        max="100"
                        step="0.1"
                        value={endPoint}
                        onChange={handleEndChange}
                        disabled={selectedPad === null}
                      />
                      <ValueDisplay>{endPoint.toFixed(1)}%</ValueDisplay>
                    </div>
                  </ControlGroup>
                </div>
              </div>
            </StartEndControls>

            <KnobsContainer>
              <Knob
                label="Attack"
                value={adsr.attack}
                min={0.001}
                max={2}
                onChange={handleAttackChange}
                disabled={selectedPad === null}
                unit="s"
              />
              <Knob
                label="Decay"
                value={adsr.decay}
                min={0.001}
                max={2}
                onChange={handleDecayChange}
                disabled={selectedPad === null}
                unit="s"
              />
              <Knob
                label="Sustain"
                value={adsr.sustain}
                min={0}
                max={1}
                onChange={handleSustainChange}
                disabled={selectedPad === null}
              />
              <Knob
                label="Release"
                value={adsr.release}
                min={0.001}
                max={3}
                onChange={handleReleaseChange}
                disabled={selectedPad === null}
                unit="s"
              />
            </KnobsContainer>
          </WaveformSection>
        ) : activeTab === "eq" ? (
          <EQContainer>
            <EQEnvelopeCanvas ref={eqEnvelopeRef} width={600} height={120} />

            <EQKnobsRow>
              <Knob
                label="Low"
                value={eqParams.lowGain}
                min={-12}
                max={12}
                onChange={(value) => {
                  setEqParams((prev) => ({ ...prev, lowGain: value }))
                  if (selectedPad !== null) {
                    onEQChange({ lowGain: value })
                  }
                }}
                disabled={selectedPad === null}
                unit="dB"
              />
              <Knob
                label="Low Mid"
                value={eqParams.lowMidGain}
                min={-12}
                max={12}
                onChange={(value) => {
                  setEqParams((prev) => ({ ...prev, lowMidGain: value }))
                  if (selectedPad !== null) {
                    onEQChange({ lowMidGain: value })
                  }
                }}
                disabled={selectedPad === null}
                unit="dB"
              />
              <Knob
                label="Mid"
                value={eqParams.midGain}
                min={-12}
                max={12}
                onChange={(value) => {
                  setEqParams((prev) => ({ ...prev, midGain: value }))
                  if (selectedPad !== null) {
                    onEQChange({ midGain: value })
                  }
                }}
                disabled={selectedPad === null}
                unit="dB"
              />
              <Knob
                label="High Mid"
                value={eqParams.highMidGain}
                min={-12}
                max={12}
                onChange={(value) => {
                  setEqParams((prev) => ({ ...prev, highMidGain: value }))
                  if (selectedPad !== null) {
                    onEQChange({ highMidGain: value })
                  }
                }}
                disabled={selectedPad === null}
                unit="dB"
              />
              <Knob
                label="High"
                value={eqParams.highGain}
                min={-12}
                max={12}
                onChange={(value) => {
                  setEqParams((prev) => ({ ...prev, highGain: value }))
                  if (selectedPad !== null) {
                    onEQChange({ highGain: value })
                  }
                }}
                disabled={selectedPad === null}
                unit="dB"
              />
            </EQKnobsRow>

            <EQKnobsRow>
              <ControlLabel style={{ color: "#88c0d0", fontSize: "10px" }}>
                5-Band Parametric EQ - Adjust frequency bands to shape your sound
              </ControlLabel>
            </EQKnobsRow>
          </EQContainer>
        ) : (
          <FXContainer>
            <FXSection>
              <FXSectionTitle>Reverb</FXSectionTitle>
              <FXKnobsRow>
                <Knob
                  label="Size"
                  value={fxParams.reverbSize}
                  min={0}
                  max={1}
                  onChange={(value) => {
                    setFxParams((prev) => ({ ...prev, reverbSize: value }))
                    if (selectedPad !== null) {
                      onFXChange({ reverbSize: value })
                    }
                  }}
                  disabled={selectedPad === null}
                />
                <Knob
                  label="Time"
                  value={fxParams.reverbTime}
                  min={0.1}
                  max={5}
                  onChange={(value) => {
                    setFxParams((prev) => ({ ...prev, reverbTime: value }))
                    if (selectedPad !== null) {
                      onFXChange({ reverbTime: value })
                    }
                  }}
                  disabled={selectedPad === null}
                  unit="s"
                />
                <Knob
                  label="Wet/Dry"
                  value={fxParams.reverbWet}
                  min={0}
                  max={1}
                  onChange={(value) => {
                    setFxParams((prev) => ({ ...prev, reverbWet: value }))
                    if (selectedPad !== null) {
                      onFXChange({ reverbWet: value })
                    }
                  }}
                  disabled={selectedPad === null}
                />
              </FXKnobsRow>
            </FXSection>

            <FXSection>
              <FXSectionTitle>Delay</FXSectionTitle>
              <FXKnobsRow>
                <FXSelectContainer>
                  <ControlLabel>Timing</ControlLabel>
                  <FXSelect
                    value={fxParams.delayTime}
                    onChange={(e) => {
                      const value = e.target.value as FXParams["delayTime"]
                      setFxParams((prev) => ({
                        ...prev,
                        delayTime: value,
                      }))
                      if (selectedPad !== null) {
                        onFXChange({ delayTime: value })
                      }
                    }}
                    disabled={selectedPad === null}
                  >
                    <option value="16n">16th Note</option>
                    <option value="8n">8th Note</option>
                    <option value="4n">Quarter Note</option>
                    <option value="2n">Half Note</option>
                    <option value="16t">16th Triplet</option>
                    <option value="8t">8th Triplet</option>
                    <option value="4t">Quarter Triplet</option>
                  </FXSelect>
                </FXSelectContainer>
                <FXSelectContainer>
                  <ControlLabel>Mode</ControlLabel>
                  <FXSelect
                    value={fxParams.delayPingPong ? "pingpong" : "normal"}
                    onChange={(e) => {
                      const isPingPong = e.target.value === "pingpong"
                      setFxParams((prev) => ({ ...prev, delayPingPong: isPingPong }))
                      if (selectedPad !== null) {
                        onFXChange({ delayPingPong: isPingPong })
                      }
                    }}
                    disabled={selectedPad === null}
                  >
                    <option value="normal">Normal</option>
                    <option value="pingpong">Ping Pong</option>
                  </FXSelect>
                </FXSelectContainer>
                <Knob
                  label="Wet/Dry"
                  value={fxParams.delayWet}
                  min={0}
                  max={1}
                  onChange={(value) => {
                    setFxParams((prev) => ({ ...prev, delayWet: value }))
                    if (selectedPad !== null) {
                      onFXChange({ delayWet: value })
                    }
                  }}
                  disabled={selectedPad === null}
                />
              </FXKnobsRow>
            </FXSection>

            <FXSection>
              <FXSectionTitle>Effects</FXSectionTitle>
              <FXKnobsRow>
                <Knob
                  label="Saturation"
                  value={fxParams.saturationAmount}
                  min={0}
                  max={10}
                  onChange={(value) => {
                    setFxParams((prev) => ({ ...prev, saturationAmount: value }))
                    if (selectedPad !== null) {
                      onFXChange({ saturationAmount: value })
                    }
                  }}
                  disabled={selectedPad === null}
                />
                <Knob
                  label="Phaser Freq"
                  value={fxParams.phaserFrequency}
                  min={0.1}
                  max={5}
                  onChange={(value) => {
                    setFxParams((prev) => ({ ...prev, phaserFrequency: value }))
                    if (selectedPad !== null) {
                      onFXChange({ phaserFrequency: value })
                    }
                  }}
                  disabled={selectedPad === null}
                  unit="Hz"
                />
                <Knob
                  label="Phaser Depth"
                  value={fxParams.phaserDepth}
                  min={0}
                  max={1}
                  onChange={(value) => {
                    setFxParams((prev) => ({ ...prev, phaserDepth: value }))
                    if (selectedPad !== null) {
                      onFXChange({ phaserDepth: value })
                    }
                  }}
                  disabled={selectedPad === null}
                />
                <Knob
                  label="Chorus Freq"
                  value={fxParams.chorusFrequency}
                  min={0.5}
                  max={10}
                  onChange={(value) => {
                    setFxParams((prev) => ({ ...prev, chorusFrequency: value }))
                    if (selectedPad !== null) {
                      onFXChange({ chorusFrequency: value })
                    }
                  }}
                  disabled={selectedPad === null}
                  unit="Hz"
                />
                <Knob
                  label="Chorus Depth"
                  value={fxParams.chorusDepth}
                  min={0}
                  max={1}
                  onChange={(value) => {
                    setFxParams((prev) => ({ ...prev, chorusDepth: value }))
                    if (selectedPad !== null) {
                      onFXChange({ chorusDepth: value })
                    }
                  }}
                  disabled={selectedPad === null}
                />
              </FXKnobsRow>
            </FXSection>
          </FXContainer>
        )}

        <VolumeControl>
          <ControlLabel>Vol</ControlLabel>
          <VerticalSlider
            type="range"
            orient="vertical"
            min="-24"
            max="12"
            step="0.5"
            value={volume}
            onChange={handleVolumeChange}
            disabled={selectedPad === null}
          />
          <ValueDisplay>{volume.toFixed(1)}</ValueDisplay>
        </VolumeControl>
      </ContentArea>
    </EditorContainer>
  )
}
