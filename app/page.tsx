"use client"

import { AudioOutPanel } from "@/components/audio-out-panel"
import { DisplayScreen } from "@/components/display-screen"
import { KitSelector } from "@/components/kit-selector"
import { MPCPad } from "@/components/mpc-pad"
import { RenamePadModal } from "@/components/rename-pad-modal"
import { SequencerGrid } from "@/components/sequencer-grid"
import { TransportControls } from "@/components/transport-controls"
import { WaveformEditor } from "@/components/waveform-editor"
import { AudioEngine, type EQParams } from "@/lib/audio-engine"
import { DRUM_KITS, PAD_NAMES } from "@/lib/drum-kits"
import { Sequencer } from "@/lib/sequencer"
import { useCallback, useEffect, useRef, useState } from "react"
import styled from "styled-components"

const MPCContainer = styled.div`
  min-height: 100vh;
  background: 
    radial-gradient(circle at 50% 120%, rgba(0,0,0,0.15) 0%, transparent 70%),
    linear-gradient(135deg, #e0d4c0 0%, #c8bcaa 50%, #d4c8b6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  
  @media (max-width: 768px) {
    padding: 10px;
    align-items: flex-start;
  }
  
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: 
      repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.02) 2px, rgba(0,0,0,.02) 4px),
      repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,.02) 2px, rgba(0,0,0,.02) 4px);
    opacity: 0.5;
    pointer-events: none;
  }
`

const MPCBody = styled.div`
  width: 100%;
  max-width: 1600px;
  background: 
    linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.1) 100%),
    linear-gradient(145deg, #f5f0e4, #ebe4d8);
  border-radius: 16px;
  padding: 36px;
  box-shadow: 
    0 30px 80px rgba(0, 0, 0, 0.4),
    0 10px 30px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.6),
    inset 0 -2px 4px rgba(0,0,0,0.1);
  position: relative;
  
  @media (max-width: 768px) {
    padding: 16px;
    padding-bottom: 80px; /* Space for mobile nav */
  }
  
  /* Subtle scratches and wear marks */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 16px;
    background-image: 
      linear-gradient(45deg, transparent 48%, rgba(0,0,0,0.02) 49%, transparent 50%),
      linear-gradient(-45deg, transparent 48%, rgba(0,0,0,0.02) 49%, transparent 50%);
    background-size: 120px 120px, 80px 80px;
    opacity: 0.3;
    pointer-events: none;
  }
  
  /* Edge beveling */
  &::after {
    content: "";
    position: absolute;
    inset: 4px;
    border-radius: 12px;
    box-shadow: inset 0 2px 6px rgba(0,0,0,0.15);
    pointer-events: none;
  }
`

const SignatureText = styled.div`
  position: absolute;
  top: 12px;
  right: 32px;
  font-family: var(--font-signature);
  font-size: 22px;
  font-weight: 700;
  color: #c92a2a;
  opacity: 0.85;
  text-shadow: 
    1px 1px 2px rgba(255, 255, 255, 0.6),
    -1px -1px 1px rgba(0, 0, 0, 0.2);
  letter-spacing: 1px;
  transform: rotate(-2deg);
  pointer-events: none;
  z-index: 10;
  
  @media (max-width: 768px) {
    font-size: 14px;
    right: 12px;
    top: 8px;
  }
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 3px solid #b8aa98;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.3);
  position: relative;
  
  @media (max-width: 768px) {
    margin-bottom: 16px;
    padding-bottom: 12px;
  }
`

const Logo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const Brand = styled.h1`
  margin: 0;
  font-size: 28px;
  font-weight: bold;
  color: #c92a2a;
  text-shadow: 
    1px 1px 0 rgba(255, 255, 255, 0.4),
    -1px -1px 0 rgba(0, 0, 0, 0.3),
    0 2px 4px rgba(201, 42, 42, 0.3);
  letter-spacing: 2px;
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
`

const Model = styled.div`
  font-size: 16px;
  color: #665544;
  font-style: italic;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
  
  @media (max-width: 768px) {
    font-size: 11px;
  }
`

const MainContent = styled.div`
  display: flex;
  gap: 32px;
  margin-bottom: 24px;

  @media (max-width: 1200px) {
    flex-direction: column;
    gap: 20px;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 0;
  }
`

const MobileViewContainer = styled.div<{ $visible: boolean }>`
  display: ${(props) => (props.$visible ? "flex" : "none")};
  flex-direction: column;
  gap: 16px;
  
  @media (min-width: 769px) {
    display: none;
  }
`

const DesktopViewContainer = styled.div`
  display: flex;
  gap: 32px;
  
  @media (max-width: 768px) {
    display: none;
  }
`

const MobileNavigation = styled.nav`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: 
      linear-gradient(145deg, #2f2f2f, #252525);
    border-top: 3px solid #1a1a1a;
    box-shadow: 
      0 -4px 16px rgba(0, 0, 0, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
    z-index: 1000;
    padding: 8px;
    gap: 4px;
  }
`

const MobileNavButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 12px 8px;
  background: ${(props) =>
    props.$active ? "linear-gradient(145deg, #4a4a4a, #3a3a3a)" : "linear-gradient(145deg, #3a3a3a, #2a2a2a)"};
  color: ${(props) => (props.$active ? "#7eb3e8" : "#888")};
  border: 2px solid ${(props) => (props.$active ? "#555" : "#222")};
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 
    ${(props) => (props.$active ? "inset 0 2px 6px rgba(0, 0, 0, 0.6)" : "0 2px 4px rgba(0, 0, 0, 0.4)")};
  
  &:active {
    transform: translateY(1px);
  }
`

const LeftPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const RightPanel = styled.div`
  flex: 1.2;
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const PadGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 20px;
  background: 
    linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 50%, #2a2a2a 100%);
  border-radius: 8px;
  border: 4px solid #1a1a1a;
  box-shadow: 
    inset 0 6px 16px rgba(0, 0, 0, 0.7),
    inset 0 1px 2px rgba(0, 0, 0, 0.9),
    0 2px 4px rgba(0, 0, 0, 0.5);
  max-width: 520px;
  position: relative;
  
  @media (max-width: 768px) {
    max-width: 100%;
    padding: 12px;
    gap: 8px;
  }
  
  /* Metal texture */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 4px;
    background-image: 
      repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(255,255,255,0.02) 1px, rgba(255,255,255,0.02) 2px);
    opacity: 0.5;
    pointer-events: none;
  }
`

const Section = styled.div`
  background: 
    linear-gradient(145deg, #2f2f2f, #252525);
  padding: 18px;
  border-radius: 8px;
  border: 3px solid #1a1a1a;
  box-shadow: 
    inset 0 3px 8px rgba(0, 0, 0, 0.6),
    0 2px 4px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  position: relative;
  
  @media (max-width: 768px) {
    padding: 12px;
  }
  
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 6px;
    background: linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 50%, rgba(0,0,0,0.1) 100%);
    pointer-events: none;
  }
`

const SectionTitle = styled.h2`
  margin: 0 0 14px 0;
  font-size: 13px;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
`

export default function MPCPage() {
  const [initialized, setInitialized] = useState(false)
  const [activePads, setActivePads] = useState<Set<number>>(new Set())
  const [displayMode, setDisplayMode] = useState("MAIN")
  const [displayInfo, setDisplayInfo] = useState("READY")
  const [isPlaying, setIsPlaying] = useState(false)
  const [bpm, setBPM] = useState(120)
  const [currentStep, setCurrentStep] = useState(0)
  const [pattern, setPattern] = useState<boolean[][]>(
    Array(16)
      .fill(null)
      .map(() => Array(16).fill(false)),
  )
  const [currentPatternIndex, setCurrentPatternIndex] = useState(0)
  const [swing, setSwing] = useState(50)
  const [currentKitIndex, setCurrentKitIndex] = useState(0)
  const [padLabels, setPadLabels] = useState<string[]>(PAD_NAMES)
  const [selectedPad, setSelectedPad] = useState<number | null>(null)
  const [renameModalOpen, setRenameModalOpen] = useState(false)
  const [padToRename, setPadToRename] = useState<number | null>(null)
  const [sampleFileNames, setSampleFileNames] = useState<(string | null)[]>(Array(16).fill(null))

  const [mobileView, setMobileView] = useState<"pads" | "sequencer" | "editor">("pads")

  const audioEngineRef = useRef<AudioEngine | null>(null)
  const sequencerRef = useRef<Sequencer | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        console.log("[v0] Starting initialization...")
        const engine = AudioEngine.getInstance()
        console.log("[v0] Got audio engine instance")

        engine.initialize()
        console.log("[v0] Audio engine initialized (non-blocking)")

        console.log("[v0] Loading kit:", DRUM_KITS[0].name)
        await engine.loadKit(DRUM_KITS[0].samples)
        console.log("[v0] Kit loaded successfully")

        const sequencer = new Sequencer()
        console.log("[v0] Sequencer created")
        
        // Initialize swing, BPM, and pattern index from sequencer (loaded from localStorage)
        setSwing(sequencer.getSwing())
        setBPM(sequencer.getBPM())
        setCurrentPatternIndex(sequencer.getCurrentPatternIndex())

        // Load the current pattern into state
        const currentPattern = sequencer.getPattern()
        setPattern(currentPattern.steps.map((step) => step.map((pad) => pad.active)))

        audioEngineRef.current = engine
        sequencerRef.current = sequencer

        console.log("[v0] Setting initialized to true")
        setInitialized(true)
        setDisplayInfo(`${DRUM_KITS[0].name} LOADED`)
        console.log("[v0] Initialization complete!")
      } catch (error) {
        console.error("[v0] Initialization error:", error)
        setDisplayInfo("ERROR: INIT FAILED")
        // Still set initialized to true so UI can show
        setInitialized(true)
      }
    }

    init()

    return () => {
      if (sequencerRef.current) {
        sequencerRef.current.stop()
      }
    }
  }, [])

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      if (sequencerRef.current) {
        setCurrentStep(sequencerRef.current.getCurrentStep())
      }
    }, 50)

    return () => clearInterval(interval)
  }, [isPlaying])

  const triggerPad = useCallback(
    async (padId: number) => {
      if (!audioEngineRef.current) return

      await audioEngineRef.current.triggerPad(padId)
      setActivePads((prev) => new Set(prev).add(padId))
      setDisplayInfo(`PAD ${padId + 1}: ${padLabels[padId].toUpperCase()}`)
      setSelectedPad(padId)

      setTimeout(() => {
        setActivePads((prev) => {
          const next = new Set(prev)
          next.delete(padId)
          return next
        })
      }, 100)
    },
    [padLabels],
  )

  const handlePadSelect = useCallback((padId: number) => {
    setSelectedPad(padId)
    setDisplayInfo(`PAD ${padId + 1}: ${padLabels[padId].toUpperCase()}`)
  }, [padLabels])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't intercept keys if modal is open or user is typing in an input
      if (renameModalOpen) {
        return
      }
      
      // Check if the active element is an input, textarea, or contenteditable
      const activeElement = document.activeElement
      if (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.getAttribute("contenteditable") === "true")
      ) {
        return
      }

      const key = e.key.toUpperCase()
      const padIndex = KEY_BINDINGS.indexOf(key)

      if (padIndex !== -1 && !e.repeat) {
        e.preventDefault()
        triggerPad(padIndex)
      }
    },
    [triggerPad, renameModalOpen],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  const handlePlay = async () => {
    if (!sequencerRef.current) return
    await sequencerRef.current.play()
    setIsPlaying(true)
    setDisplayMode("SEQUENCER")
    setDisplayInfo("PLAYING...")
  }

  const handleStop = () => {
    if (!sequencerRef.current) return
    sequencerRef.current.stop()
    setIsPlaying(false)
    setCurrentStep(0)
    setDisplayMode("MAIN")
    setDisplayInfo("STOPPED")
  }

  const handleBPMChange = (newBPM: number) => {
    if (!sequencerRef.current) return
    setBPM(newBPM)
    sequencerRef.current.setBPM(newBPM)
    setDisplayInfo(`BPM: ${newBPM}`)
  }

  const handleClear = () => {
    if (!sequencerRef.current) return
    sequencerRef.current.clearPattern()
    setPattern(
      Array(16)
        .fill(null)
        .map(() => Array(16).fill(false)),
    )
    setDisplayInfo("PATTERN CLEARED")
  }

  const handleStepToggle = (step: number, pad: number) => {
    if (!sequencerRef.current) return

    sequencerRef.current.toggleStep(step, pad)
    setPattern((prev) => {
      const next = prev.map((row) => [...row])
      next[step][pad] = !next[step][pad]
      return next
    })
  }

  const handlePatternChange = (patternIndex: number) => {
    if (!sequencerRef.current) return

    sequencerRef.current.setCurrentPattern(patternIndex)
    setCurrentPatternIndex(patternIndex)

    const newPattern = sequencerRef.current.getPattern()
    setPattern(newPattern.steps.map((step) => step.map((pad) => pad.active)))

    setDisplayInfo(`PATTERN ${String(patternIndex + 1).padStart(2, "0")} SELECTED`)
  }

  const handleSwingChange = (newSwing: number) => {
    if (!sequencerRef.current) return
    sequencerRef.current.setSwing(newSwing)
    setSwing(newSwing)
  }

  const handleCopyPattern = () => {
    if (!sequencerRef.current) return
    
    // Find the next empty pattern (or use next pattern if all are filled)
    let targetPattern = currentPatternIndex + 1
    if (targetPattern >= 99) targetPattern = 0
    
    sequencerRef.current.copyPattern(currentPatternIndex, targetPattern)
    setCurrentPatternIndex(targetPattern)
    
    const newPattern = sequencerRef.current.getPattern()
    setPattern(newPattern.steps.map((step) => step.map((pad) => pad.active)))
    
    setDisplayInfo(`PATTERN ${String(currentPatternIndex + 1).padStart(2, "0")} COPIED TO ${String(targetPattern + 1).padStart(2, "0")}`)
  }

  const handlePrevKit = async () => {
    if (!audioEngineRef.current) return
    const newIndex = currentKitIndex === 0 ? DRUM_KITS.length - 1 : currentKitIndex - 1
    setCurrentKitIndex(newIndex)
    setDisplayInfo(`LOADING ${DRUM_KITS[newIndex].name}...`)
    await audioEngineRef.current.loadKit(DRUM_KITS[newIndex].samples)
    // Clear custom sample file names when loading a kit
    setSampleFileNames(Array(16).fill(null))
    setDisplayInfo(`${DRUM_KITS[newIndex].name} LOADED`)
  }

  const handleNextKit = async () => {
    if (!audioEngineRef.current) return
    const newIndex = currentKitIndex === DRUM_KITS.length - 1 ? 0 : currentKitIndex + 1
    setCurrentKitIndex(newIndex)
    setDisplayInfo(`LOADING ${DRUM_KITS[newIndex].name}...`)
    await audioEngineRef.current.loadKit(DRUM_KITS[newIndex].samples)
    // Clear custom sample file names when loading a kit
    setSampleFileNames(Array(16).fill(null))
    setDisplayInfo(`${DRUM_KITS[newIndex].name} LOADED`)
  }

  const handleSampleDrop = async (padId: number, file: File) => {
    if (!audioEngineRef.current) return

    setDisplayInfo(`LOADING ${file.name}...`)

    const url = URL.createObjectURL(file)
    await audioEngineRef.current.loadSample(padId, url)

    const fileName = file.name.replace(/\.[^/.]+$/, "")
    setPadLabels((prev) => {
      const next = [...prev]
      next[padId] = fileName.substring(0, 8)
      return next
    })

    // Track the sample file name
    setSampleFileNames((prev) => {
      const next = [...prev]
      next[padId] = file.name
      return next
    })

    setDisplayInfo(`PAD ${padId + 1}: ${fileName.toUpperCase()}`)
  }

  const handleEditClick = useCallback((padId: number) => {
    setPadToRename(padId)
    setRenameModalOpen(true)
  }, [])

  const handleSampleUpload = async (padId: number, file: File) => {
    await handleSampleDrop(padId, file)
  }

  const handleRenamePad = useCallback((padId: number, newName: string) => {
    setPadLabels((prev) => {
      const next = [...prev]
      next[padId] = newName.substring(0, 16) // Limit to 16 characters
      return next
    })
    setDisplayInfo(`PAD ${padId + 1}: ${newName.toUpperCase()}`)
  }, [])

  const handleStartChange = (value: number) => {
    if (!audioEngineRef.current || selectedPad === null) return
    audioEngineRef.current.setStartPoint(selectedPad, value)
    setDisplayInfo(`PAD ${selectedPad + 1} START: ${value.toFixed(1)}%`)
  }

  const handleEndChange = (value: number) => {
    if (!audioEngineRef.current || selectedPad === null) return
    audioEngineRef.current.setEndPoint(selectedPad, value)
    setDisplayInfo(`PAD ${selectedPad + 1} END: ${value.toFixed(1)}%`)
  }

  const handleVolumeChange = (value: number) => {
    if (!audioEngineRef.current || selectedPad === null) return
    audioEngineRef.current.setVolume(selectedPad, value)
    setDisplayInfo(`PAD ${selectedPad + 1} VOL: ${value.toFixed(1)} dB`)
  }

  const handlePitchChange = (value: number) => {
    if (!audioEngineRef.current || selectedPad === null) return
    audioEngineRef.current.setPitch(selectedPad, value)
    const sign = value > 0 ? "+" : ""
    setDisplayInfo(`PAD ${selectedPad + 1} PITCH: ${sign}${value.toFixed(0)} ST`)
  }

  const handleADSRChange = (params: any) => {
    if (!audioEngineRef.current || selectedPad === null) return
    audioEngineRef.current.setADSR(selectedPad, params)
    setDisplayInfo(`PAD ${selectedPad + 1} ADSR UPDATED`)
  }

  const handleEQChange = (params: Partial<EQParams>) => {
    if (!audioEngineRef.current || selectedPad === null) return
    audioEngineRef.current.setEQ(selectedPad, params)
    setDisplayInfo(`PAD ${selectedPad + 1} EQ UPDATED`)
  }

  const getADSR = (padId: number) => {
    if (!audioEngineRef.current) {
      return { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.2 }
    }
    return audioEngineRef.current.getADSR(padId)
  }

  const getEQ = (padId: number) => {
    if (!audioEngineRef.current) {
      return { lowGain: 0, lowMidGain: 0, midGain: 0, highMidGain: 0, highGain: 0 }
    }
    return audioEngineRef.current.getEQ(padId)
  }

  const getPlayer = (padId: number) => {
    return audioEngineRef.current?.getPlayer(padId)
  }

  const getEnvelope = (padId: number) => {
    return audioEngineRef.current?.getEnvelope(padId)
  }

  const getMeterBus = (padId: number) => {
    return audioEngineRef.current?.getMeterBus(padId)
  }

  const getStartPoint = (padId: number) => {
    return audioEngineRef.current?.getStartPoint(padId) ?? 0
  }

  const getEndPoint = (padId: number) => {
    return audioEngineRef.current?.getEndPoint(padId) ?? 100
  }

  const getPitch = (padId: number) => {
    return audioEngineRef.current?.getPitch(padId) ?? 0
  }

  const getVolume = (padId: number) => {
    return audioEngineRef.current?.getVolume(padId) ?? 0
  }

  const KEY_BINDINGS = ["1", "2", "3", "4", "Q", "W", "E", "R", "A", "S", "D", "F", "Z", "X", "C", "V"]

  if (!initialized) {
    return (
      <MPCContainer>
        <div style={{ color: "#666", fontSize: "18px" }}>Initializing MPC...</div>
      </MPCContainer>
    )
  }

  return (
    <MPCContainer>
      <MPCBody>
        <SignatureText>Mikey Diserio Signature Edition</SignatureText>

        <Header>
          <Logo>
            <Brand>AKAI</Brand>
            <Model>Professional</Model>
          </Logo>
          <Logo>
            <Brand style={{ fontSize: window.innerWidth <= 768 ? "20px" : "32px", textAlign: "right" }}>MPC60 II</Brand>
            <Model style={{ textAlign: "right" }}>WEB EDITION</Model>
          </Logo>
        </Header>

        {/* Desktop View */}
        <DesktopViewContainer>
          <LeftPanel>
            <DisplayScreen mode={displayMode} info={displayInfo} />
            <KitSelector
              kitName={DRUM_KITS[currentKitIndex].name}
              onPrevKit={handlePrevKit}
              onNextKit={handleNextKit}
            />
            <TransportControls
              isPlaying={isPlaying}
              bpm={bpm}
              onPlay={handlePlay}
              onStop={handleStop}
              onBPMChange={handleBPMChange}
              onClear={handleClear}
            />
            <PadGrid>
              {padLabels.map((label, idx) => (
                <MPCPad
                  key={idx}
                  id={idx}
                  label={label}
                  keyBinding={KEY_BINDINGS[idx]}
                  isActive={activePads.has(idx)}
                  onTrigger={() => triggerPad(idx)}
                  onSampleDrop={(file) => handleSampleDrop(idx, file)}
                  onEditClick={handleEditClick}
                />
              ))}
            </PadGrid>
            <AudioOutPanel padLabels={padLabels} getPlayer={getPlayer} getEnvelope={getEnvelope} getMeterBus={getMeterBus} />
          </LeftPanel>

          <RightPanel>
            <WaveformEditor
              selectedPad={selectedPad}
              padLabel={selectedPad !== null ? padLabels[selectedPad] : ""}
              padLabels={padLabels}
              onPadSelect={handlePadSelect}
              onStartChange={handleStartChange}
              onEndChange={handleEndChange}
              onVolumeChange={handleVolumeChange}
              onPitchChange={handlePitchChange}
              onADSRChange={handleADSRChange}
              onEQChange={handleEQChange}
              getPlayer={getPlayer}
              getADSR={getADSR}
              getEQ={getEQ}
              getStartPoint={getStartPoint}
              getEndPoint={getEndPoint}
              getPitch={getPitch}
              getVolume={getVolume}
            />

            <Section>
              <SectionTitle>Pattern Sequencer</SectionTitle>
              <SequencerGrid
                steps={16}
                pads={16}
                currentStep={currentStep}
                pattern={pattern}
                currentPatternIndex={currentPatternIndex}
                padLabels={padLabels}
                swing={swing}
                onStepToggle={handleStepToggle}
                onPatternChange={handlePatternChange}
                onSwingChange={handleSwingChange}
                onCopyPattern={handleCopyPattern}
              />
            </Section>
          </RightPanel>
        </DesktopViewContainer>

        {/* Mobile View - Pads Section */}
        <MobileViewContainer $visible={mobileView === "pads"}>
          <DisplayScreen mode={displayMode} info={displayInfo} />
          <KitSelector kitName={DRUM_KITS[currentKitIndex].name} onPrevKit={handlePrevKit} onNextKit={handleNextKit} />
          <TransportControls
            isPlaying={isPlaying}
            bpm={bpm}
            onPlay={handlePlay}
            onStop={handleStop}
            onBPMChange={handleBPMChange}
            onClear={handleClear}
          />
          <PadGrid>
            {padLabels.map((label, idx) => (
              <MPCPad
                key={idx}
                id={idx}
                label={label}
                keyBinding={KEY_BINDINGS[idx]}
                isActive={activePads.has(idx)}
                onTrigger={() => triggerPad(idx)}
                onSampleDrop={(file) => handleSampleDrop(idx, file)}
                onEditClick={handleEditClick}
              />
            ))}
          </PadGrid>
          <AudioOutPanel padLabels={padLabels} getPlayer={getPlayer} />
        </MobileViewContainer>

        {/* Mobile View - Sequencer Section */}
        <MobileViewContainer $visible={mobileView === "sequencer"}>
          <DisplayScreen mode={displayMode} info={displayInfo} />
          <TransportControls
            isPlaying={isPlaying}
            bpm={bpm}
            onPlay={handlePlay}
            onStop={handleStop}
            onBPMChange={handleBPMChange}
            onClear={handleClear}
          />
          <Section>
            <SectionTitle>Pattern Sequencer</SectionTitle>
            <SequencerGrid
              steps={16}
              pads={16}
              currentStep={currentStep}
              pattern={pattern}
              currentPatternIndex={currentPatternIndex}
              padLabels={padLabels}
              swing={swing}
              onStepToggle={handleStepToggle}
              onPatternChange={handlePatternChange}
              onSwingChange={handleSwingChange}
              onCopyPattern={handleCopyPattern}
            />
          </Section>
        </MobileViewContainer>

        {/* Mobile View - Editor Section */}
        <MobileViewContainer $visible={mobileView === "editor"}>
          <DisplayScreen mode={displayMode} info={displayInfo} />
          <WaveformEditor
            selectedPad={selectedPad}
            padLabel={selectedPad !== null ? padLabels[selectedPad] : ""}
            padLabels={padLabels}
            onPadSelect={handlePadSelect}
            onStartChange={handleStartChange}
            onEndChange={handleEndChange}
            onVolumeChange={handleVolumeChange}
            onPitchChange={handlePitchChange}
            onADSRChange={handleADSRChange}
            onEQChange={handleEQChange}
            getPlayer={getPlayer}
            getADSR={getADSR}
            getEQ={getEQ}
            getStartPoint={getStartPoint}
            getEndPoint={getEndPoint}
            getPitch={getPitch}
            getVolume={getVolume}
          />
        </MobileViewContainer>

        {/* Mobile Navigation */}
        <MobileNavigation>
          <MobileNavButton $active={mobileView === "pads"} onClick={() => setMobileView("pads")}>
            Pads
          </MobileNavButton>
          <MobileNavButton $active={mobileView === "sequencer"} onClick={() => setMobileView("sequencer")}>
            Sequencer
          </MobileNavButton>
          <MobileNavButton $active={mobileView === "editor"} onClick={() => setMobileView("editor")}>
            Editor
          </MobileNavButton>
        </MobileNavigation>

      </MPCBody>

      {/* Rename Pad Modal - Outside MPCBody to avoid clipping */}
      <RenamePadModal
        isOpen={renameModalOpen}
        padId={padToRename}
        currentName={padToRename !== null ? padLabels[padToRename] : ""}
        currentSampleFileName={padToRename !== null ? sampleFileNames[padToRename] : null}
        onClose={() => {
          setRenameModalOpen(false)
          setPadToRename(null)
        }}
        onSave={handleRenamePad}
        onSampleUpload={handleSampleUpload}
      />
    </MPCContainer>
  )
}
