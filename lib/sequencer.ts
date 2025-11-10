"use client"

import * as Tone from "tone"
import { AudioEngine } from "./audio-engine"

export interface Step {
  padId: number
  active: boolean
  velocity: number
}

export interface Pattern {
  steps: Step[][]
  length: number
}

export class Sequencer {
  private audioEngine: AudioEngine
  private patterns: Pattern[]
  private currentPatternIndex = 0
  private currentStep = 0
  private sequence: Tone.Sequence | null = null
  private isPlaying = false
  private bpm = 120
  private swing = 50
  private saveTimeout: ReturnType<typeof setTimeout> | null = null

  constructor() {
    this.audioEngine = AudioEngine.getInstance()
    this.patterns = Array(99)
      .fill(null)
      .map(() => ({
        steps: Array(16)
          .fill(null)
          .map(() =>
            Array(16)
              .fill(null)
              .map((_, i) => ({
                padId: i,
                active: false,
                velocity: 1,
              })),
          ),
        length: 16,
      }))
    
    // Load patterns from localStorage
    this.loadFromLocalStorage()
  }

  private saveToLocalStorage() {
    // Debounce saves to avoid excessive localStorage writes
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
    }
    
    this.saveTimeout = setTimeout(() => {
      try {
        const patternsData = this.patterns.map((pattern) => ({
          steps: pattern.steps.map((step) =>
            step.map((pad) => ({
              padId: pad.padId,
              active: pad.active,
              velocity: pad.velocity,
            })),
          ),
          length: pattern.length,
        }))
        
        localStorage.setItem("mpc_patterns", JSON.stringify(patternsData))
        localStorage.setItem("mpc_currentPatternIndex", String(this.currentPatternIndex))
        localStorage.setItem("mpc_swing", String(this.swing))
        localStorage.setItem("mpc_bpm", String(this.bpm))
      } catch (error) {
        console.error("[v0] Error saving to localStorage:", error)
      }
    }, 300) // Debounce by 300ms
  }

  private loadFromLocalStorage() {
    try {
      const patternsData = localStorage.getItem("mpc_patterns")
      if (patternsData) {
        const parsed = JSON.parse(patternsData) as Pattern[]
        if (Array.isArray(parsed) && parsed.length === 99) {
          this.patterns = parsed.map((pattern) => ({
            steps: pattern.steps.map((step) =>
              step.map((pad, padIndex) => ({
                padId: pad.padId ?? padIndex,
                active: pad.active ?? false,
                velocity: pad.velocity ?? 1,
              })),
            ),
            length: pattern.length ?? 16,
          }))
        }
      }

      const savedPatternIndex = localStorage.getItem("mpc_currentPatternIndex")
      if (savedPatternIndex) {
        const index = Number.parseInt(savedPatternIndex, 10)
        if (index >= 0 && index < 99) {
          this.currentPatternIndex = index
        }
      }

      const savedSwing = localStorage.getItem("mpc_swing")
      if (savedSwing) {
        const swingValue = Number.parseFloat(savedSwing)
        if (!Number.isNaN(swingValue)) {
          this.swing = Math.max(50, Math.min(75, swingValue))
        }
      }

      const savedBPM = localStorage.getItem("mpc_bpm")
      if (savedBPM) {
        const bpmValue = Number.parseFloat(savedBPM)
        if (!Number.isNaN(bpmValue)) {
          this.bpm = bpmValue
        }
      }
    } catch (error) {
      console.error("[v0] Error loading from localStorage:", error)
    }
  }

  setCurrentPattern(patternIndex: number) {
    if (patternIndex < 0 || patternIndex >= 99) return
    this.currentPatternIndex = patternIndex
    this.saveToLocalStorage()
  }

  getCurrentPattern(): Pattern {
    return this.patterns[this.currentPatternIndex]
  }

  getCurrentPatternIndex(): number {
    return this.currentPatternIndex
  }

  toggleStep(step: number, padId: number) {
    this.patterns[this.currentPatternIndex].steps[step][padId].active =
      !this.patterns[this.currentPatternIndex].steps[step][padId].active
    this.saveToLocalStorage()
  }

  setStepActive(step: number, padId: number, active: boolean) {
    this.patterns[this.currentPatternIndex].steps[step][padId].active = active
    this.saveToLocalStorage()
  }

  isStepActive(step: number, padId: number): boolean {
    return this.patterns[this.currentPatternIndex].steps[step][padId].active
  }

  getCurrentStep(): number {
    return this.currentStep
  }

  async play() {
    if (this.isPlaying) return

    // Ensure audio context is started before playing
    await this.audioEngine.ensureAudioContextStarted()

    // Optimize transport for low latency and stable playback
    const transport = Tone.getTransport()
    transport.bpm.value = this.bpm
    
    // Cancel any previous scheduling
    transport.cancel()
    
    const initialPattern = this.patterns[this.currentPatternIndex]

    // Pre-calculate swing duration once for efficiency
    const sixteenthNoteDuration = Tone.Time("16n").toSeconds()
    const swingDelay = this.swing > 50 
      ? sixteenthNoteDuration * ((this.swing - 50) / 50) * 0.66 
      : 0

    // Trigger step 0 immediately when play is pressed (no delay)
    this.currentStep = 0
    const now = Tone.now()
    initialPattern.steps[0].forEach((stepData) => {
      if (stepData.active) {
        // Use a tiny lookahead (0.02s) for more stable initial trigger
        this.audioEngine.triggerPadSync(stepData.padId, stepData.velocity, now + 0.02)
      }
    })

    let firstStep0Triggered = true

    this.sequence = new Tone.Sequence(
      (time, step) => {
        this.currentStep = step

        // Skip the first step 0 trigger since we already triggered it immediately
        if (step === 0 && firstStep0Triggered) {
          firstStep0Triggered = false
          return
        }

        // Read the current pattern dynamically (not from closure) so pattern switching works
        const currentPattern = this.patterns[this.currentPatternIndex]
        
        // Make sure step is within bounds of current pattern
        if (step >= currentPattern.steps.length) return

        // Apply pre-calculated swing to odd steps
        const triggerTime = (step % 2 === 1 && swingDelay > 0) 
          ? time + swingDelay 
          : time

        // Batch trigger all active pads for this step with precise timing
        currentPattern.steps[step].forEach((stepData) => {
          if (stepData.active) {
            this.audioEngine.triggerPadSync(stepData.padId, stepData.velocity, triggerTime)
          }
        })
      },
      Array.from({ length: initialPattern.length }, (_, i) => i),
      "16n",
    )

    // Start transport and sequence together for better sync
    this.sequence.start(0)
    transport.start("+0.02") // Small lookahead for stability
    this.isPlaying = true
  }

  stop() {
    if (!this.isPlaying) return

    Tone.getTransport().stop()
    if (this.sequence) {
      this.sequence.stop()
      this.sequence.dispose()
      this.sequence = null
    }
    this.currentStep = 0
    this.isPlaying = false
  }

  setBPM(bpm: number) {
    this.bpm = bpm
    Tone.getTransport().bpm.value = bpm
    this.saveToLocalStorage()
  }

  getBPM(): number {
    return this.bpm
  }

  getIsPlaying(): boolean {
    return this.isPlaying
  }

  clearPattern() {
    this.patterns[this.currentPatternIndex].steps.forEach((step) => {
      step.forEach((pad) => {
        pad.active = false
      })
    })
    this.saveToLocalStorage()
  }

  getPattern(): Pattern {
    return this.patterns[this.currentPatternIndex]
  }

  setSwing(swing: number) {
    this.swing = Math.max(50, Math.min(75, swing))
    this.saveToLocalStorage()
  }

  getSwing(): number {
    return this.swing
  }

  copyPattern(sourcePatternIndex: number, targetPatternIndex: number) {
    if (sourcePatternIndex < 0 || sourcePatternIndex >= 99) return
    if (targetPatternIndex < 0 || targetPatternIndex >= 99) return
    if (sourcePatternIndex === targetPatternIndex) return

    const sourcePattern = this.patterns[sourcePatternIndex]
    const targetPattern = this.patterns[targetPatternIndex]

    // Deep copy the pattern steps
    targetPattern.steps = sourcePattern.steps.map((step) =>
      step.map((pad) => ({
        padId: pad.padId,
        active: pad.active,
        velocity: pad.velocity,
      })),
    )
    targetPattern.length = sourcePattern.length
    this.saveToLocalStorage()
  }
}
