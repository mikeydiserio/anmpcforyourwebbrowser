"use client"

import * as Tone from "tone"

export interface Sample {
  id: number
  name: string
  url: string
  player: Tone.Player | null
}

export interface ADSRParams {
  attack: number
  decay: number
  sustain: number
  release: number
}

export interface EQParams {
  lowGain: number
  lowMidGain: number
  midGain: number
  highMidGain: number
  highGain: number
}

interface PadEQFilters {
  eq3: Tone.EQ3
  lowMidFilter: Tone.Filter
  highMidFilter: Tone.Filter
}

// Buffer source pool for efficient playback
interface BufferSourceNode {
  source: Tone.ToneAudioBuffer
  gainNode: Tone.Gain
  inUse: boolean
  lastUsed: number
}

interface PadSettings {
  startPoint: number // 0-100 percentage
  endPoint: number // 0-100 percentage
  pitch: number // semitones, -12 to +12
  volume: number // dB, -60 to +6
}

export class AudioEngine {
  private static instance: AudioEngine
  private buffers: Map<number, Tone.ToneAudioBuffer>
  private gainNodes: Map<number, Tone.Gain>
  private envelopes: Map<number, Tone.AmplitudeEnvelope>
  private eqFilters: Map<number, PadEQFilters>
  private meterBuses: Map<number, Tone.Volume>
  private players: Map<number, Tone.Player> // Keep for backwards compatibility
  private padSettings: Map<number, PadSettings>
  private initialized = false
  private customSamples: Map<number, string> = new Map()

  private constructor() {
    this.buffers = new Map()
    this.gainNodes = new Map()
    this.envelopes = new Map()
    this.eqFilters = new Map()
    this.meterBuses = new Map()
    this.players = new Map()
    this.padSettings = new Map()
  }

  static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine()
    }
    return AudioEngine.instance
  }

  async initialize() {
    if (this.initialized) return

    // Don't await Tone.start() - it requires user interaction
    // Audio context will be started on first user interaction
    // Aggressive optimization for ultra-low latency
    Tone.context.lookAhead = 0.001 // Minimal lookAhead for immediate response
    Tone.context.updateInterval = 0.001 // Update as fast as possible
    Tone.context.latencyHint = "interactive" // Prioritize low latency
    
    this.initialized = true
  }

  async ensureAudioContextStarted() {
    if (Tone.context.state !== "running") {
      await Tone.start()
    }
  }

  async loadSample(padId: number, url: string): Promise<void> {
    try {
      // Clean up old resources
      const oldPlayer = this.players.get(padId)
      if (oldPlayer) {
        oldPlayer.dispose()
      }

      const oldGainNode = this.gainNodes.get(padId)
      if (oldGainNode) {
        oldGainNode.dispose()
      }

      const oldEQ = this.eqFilters.get(padId)
      if (oldEQ) {
        oldEQ.eq3.dispose()
        oldEQ.lowMidFilter.dispose()
        oldEQ.highMidFilter.dispose()
      }

      const oldMeterBus = this.meterBuses.get(padId)
      if (oldMeterBus) {
        oldMeterBus.dispose()
      }

      // Load audio buffer directly - much more efficient than Player
      const buffer = new Tone.ToneAudioBuffer(url, () => {
        console.log(`[v0] Loaded buffer for pad ${padId}`)
      })

      // Create persistent gain node for VU metering (reused for all triggers)
      const gainNode = new Tone.Gain(1)
      
      // Store envelope settings (for reference, not used as audio node)
      const envelope = new Tone.AmplitudeEnvelope({
        attack: 0.01,
        decay: 0.1,
        sustain: 0.5,
        release: 0.2,
      })

      // Create EQ filter (5-band using EQ3 for low/mid/high, plus two peaking filters)
      // These are stored for UI but not used in playback chain (for performance)
      const eq3 = new Tone.EQ3({
        low: 0,
        mid: 0,
        high: 0,
        lowFrequency: 200,
        highFrequency: 3000,
      })

      const lowMidFilter = new Tone.Filter({
        type: "peaking",
        frequency: 400,
        Q: 1,
        gain: 0,
      })

      const highMidFilter = new Tone.Filter({
        type: "peaking",
        frequency: 2000,
        Q: 1,
        gain: 0,
      })

      // Create a meter bus for VU metering (fan-out node)
      const meterBus = new Tone.Volume(0).toDestination()
      
      // Connect persistent gain node: gainNode → destination + meterBus (fan-out)
      gainNode.toDestination()
      gainNode.connect(meterBus)

      // Store everything
      this.buffers.set(padId, buffer)
      this.gainNodes.set(padId, gainNode)
      this.envelopes.set(padId, envelope)
      this.meterBuses.set(padId, meterBus)
      this.eqFilters.set(padId, {
        eq3,
        lowMidFilter,
        highMidFilter,
      })

      // Create a player for backwards compatibility (waveform display, etc.)
      const player = new Tone.Player({
        url,
        onload: () => console.log(`[v0] Loaded player for pad ${padId}`),
        onerror: (error) => console.error(`[v0] Error loading player for pad ${padId}:`, error),
      })
      player.volume.value = 0
      this.players.set(padId, player)
      
      // Initialize default pad settings
      this.padSettings.set(padId, {
        startPoint: 0,
        endPoint: 100,
        pitch: 0,
        volume: 0,
      })
      
      this.customSamples.set(padId, url)
    } catch (error) {
      console.error(`[v0] Error in loadSample for pad ${padId}:`, error)
      throw error
    }
  }

  async loadKit(samples: string[]): Promise<void> {
    try {
      console.log(`[v0] Loading kit with ${samples.length} samples`)
      // Clear custom samples when loading a kit
      this.customSamples.clear()

      const loadPromises = samples.map((url, index) => this.loadSample(index, url))
      await Promise.all(loadPromises)
      console.log("[v0] Kit loading complete")
    } catch (error) {
      console.error("[v0] Error in loadKit:", error)
      throw error
    }
  }

  hasCustomSample(padId: number): boolean {
    return this.customSamples.has(padId)
  }

  async triggerPad(padId: number, velocity = 1) {
    // Ensure audio context is started on first interaction
    await this.ensureAudioContextStarted()
    this.triggerPadSync(padId, velocity)
  }

  triggerPadSync(padId: number, velocity = 1, time?: number) {
    // Stable playback with start/end/pitch/volume support
    // VU meters connect to gainNodes (persistent), not per-trigger connections
    const buffer = this.buffers.get(padId)
    const sourceEnvelope = this.envelopes.get(padId)
    const settings = this.padSettings.get(padId)
    const persistentGainNode = this.gainNodes.get(padId)

    if (!buffer || !buffer.loaded || !sourceEnvelope) return

    const triggerTime = time !== undefined ? time : Tone.now()
    const fullDuration = buffer.duration
    
    // Get settings or use defaults
    const startPoint = settings?.startPoint ?? 0
    const endPoint = settings?.endPoint ?? 100
    const pitch = settings?.pitch ?? 0
    const volumeDb = settings?.volume ?? 0

    try {
      // Calculate start and end times based on percentages
      const startTime = (startPoint / 100) * fullDuration
      const endTime = (endPoint / 100) * fullDuration
      const duration = endTime - startTime
      
      if (duration <= 0) return // Invalid range

      // Calculate playback rate for pitch shifting (1 semitone = 2^(1/12))
      const playbackRate = Math.pow(2, pitch / 12)
      const adjustedDuration = duration / playbackRate
      
      // Convert volume dB to linear gain
      const volumeGain = Tone.dbToGain(volumeDb)

      // Simple chain: buffer → envelopeGain → persistentGainNode → destination
      // VU meters connect to persistentGainNode (not recreated each time)
      const bufferSource = new Tone.ToneBufferSource(buffer)
      bufferSource.playbackRate = playbackRate
      
      const envelopeGain = new Tone.Gain(0)
      
      // ADSR via gain automation (scaled by volume)
      const attack = Math.max(0.001, sourceEnvelope.attack)
      const decay = Math.max(0.001, sourceEnvelope.decay)
      const sustain = Math.max(0.1, Math.min(1, sourceEnvelope.sustain))
      const release = Math.max(0.001, sourceEnvelope.release)
      
      const peakGain = velocity * volumeGain
      const sustainGain = peakGain * sustain
      
      envelopeGain.gain.setValueAtTime(0, triggerTime)
      envelopeGain.gain.linearRampToValueAtTime(peakGain, triggerTime + attack)
      envelopeGain.gain.linearRampToValueAtTime(sustainGain, triggerTime + attack + decay)
      envelopeGain.gain.setValueAtTime(sustainGain, triggerTime + adjustedDuration)
      envelopeGain.gain.linearRampToValueAtTime(0.0001, triggerTime + adjustedDuration + release)
      
      // Connect through persistent gain node (for VU metering)
      bufferSource.connect(envelopeGain)
      if (persistentGainNode) {
        envelopeGain.connect(persistentGainNode)
      } else {
        // Fallback if no persistent gain node
        envelopeGain.toDestination()
      }
      
      // Start playback at the offset (start point) and stop at adjusted duration
      bufferSource.start(triggerTime, startTime)
      bufferSource.stop(triggerTime + adjustedDuration + release + 0.1)
      
      // Cleanup
      const cleanupDelay = (adjustedDuration + release + 0.2) * 1000
      setTimeout(() => {
        try {
          bufferSource.dispose()
          envelopeGain.dispose()
        } catch (e) {
          // Ignore
        }
      }, cleanupDelay)
      
    } catch (error) {
      console.error(`[AudioEngine] Error on pad ${padId}:`, error)
    }
  }

  stopPad(padId: number) {
    const player = this.players.get(padId)
    if (player) {
      player.stop()
    }
  }

  setADSR(padId: number, params: Partial<ADSRParams>) {
    const envelope = this.envelopes.get(padId)
    if (envelope) {
      if (params.attack !== undefined) envelope.attack = params.attack
      if (params.decay !== undefined) envelope.decay = params.decay
      if (params.sustain !== undefined) envelope.sustain = params.sustain
      if (params.release !== undefined) envelope.release = params.release
    }
  }

  getADSR(padId: number): ADSRParams {
    const envelope = this.envelopes.get(padId)
    if (envelope) {
      return {
        attack: envelope.attack,
        decay: envelope.decay,
        sustain: envelope.sustain,
        release: envelope.release,
      }
    }
    return { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.2 }
  }

  setEQ(padId: number, params: Partial<EQParams>) {
    const filters = this.eqFilters.get(padId)
    if (!filters) return

    // EQ3 handles low, mid, high bands
    if (params.lowGain !== undefined) {
      filters.eq3.low.value = params.lowGain
    }
    if (params.midGain !== undefined) {
      filters.eq3.mid.value = params.midGain
    }
    if (params.highGain !== undefined) {
      filters.eq3.high.value = params.highGain
    }

    // Additional filters for low-mid and high-mid
    if (params.lowMidGain !== undefined) {
      filters.lowMidFilter.gain.value = params.lowMidGain
    }
    if (params.highMidGain !== undefined) {
      filters.highMidFilter.gain.value = params.highMidGain
    }
  }

  getEQ(padId: number): EQParams {
    const filters = this.eqFilters.get(padId)
    if (!filters) {
      return {
        lowGain: 0,
        lowMidGain: 0,
        midGain: 0,
        highMidGain: 0,
        highGain: 0,
      }
    }

    return {
      lowGain: filters.eq3.low.value,
      lowMidGain: filters.lowMidFilter.gain.value,
      midGain: filters.eq3.mid.value,
      highMidGain: filters.highMidFilter.gain.value,
      highGain: filters.eq3.high.value,
    }
  }

  getPlayer(padId: number): Tone.Player | undefined {
    return this.players.get(padId)
  }

  getEnvelope(padId: number): Tone.AmplitudeEnvelope | undefined {
    return this.envelopes.get(padId)
  }

  getMeterBus(padId: number): Tone.Volume | undefined {
    return this.meterBuses.get(padId)
  }

  // Start/End/Pitch/Volume controls
  setStartPoint(padId: number, startPoint: number) {
    const settings = this.padSettings.get(padId)
    if (settings) {
      settings.startPoint = Math.max(0, Math.min(100, startPoint))
    }
  }

  setEndPoint(padId: number, endPoint: number) {
    const settings = this.padSettings.get(padId)
    if (settings) {
      settings.endPoint = Math.max(0, Math.min(100, endPoint))
    }
  }

  setPitch(padId: number, pitch: number) {
    const settings = this.padSettings.get(padId)
    if (settings) {
      settings.pitch = Math.max(-12, Math.min(12, pitch))
    }
  }

  setVolume(padId: number, volume: number) {
    const settings = this.padSettings.get(padId)
    if (settings) {
      settings.volume = Math.max(-60, Math.min(6, volume))
    }
  }

  getStartPoint(padId: number): number {
    return this.padSettings.get(padId)?.startPoint ?? 0
  }

  getEndPoint(padId: number): number {
    return this.padSettings.get(padId)?.endPoint ?? 100
  }

  getPitch(padId: number): number {
    return this.padSettings.get(padId)?.pitch ?? 0
  }

  getVolume(padId: number): number {
    return this.padSettings.get(padId)?.volume ?? 0
  }

  dispose() {
    this.buffers.forEach((buffer) => buffer.dispose())
    this.gainNodes.forEach((gain) => gain.dispose())
    this.players.forEach((player) => player.dispose())
    this.envelopes.forEach((env) => env.dispose())
    this.meterBuses.forEach((bus) => bus.dispose())
    this.eqFilters.forEach((filters) => {
      filters.eq3.dispose()
      filters.lowMidFilter.dispose()
      filters.highMidFilter.dispose()
    })
    this.buffers.clear()
    this.gainNodes.clear()
    this.players.clear()
    this.envelopes.clear()
    this.meterBuses.clear()
    this.eqFilters.clear()
    this.customSamples.clear()
    this.initialized = false
  }
}
