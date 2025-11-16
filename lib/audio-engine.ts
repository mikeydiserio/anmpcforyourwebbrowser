"use client"

import * as Tone from "tone"

const PAD_STATE_STORAGE_KEY = "mpc_pad_params_v1"

const DEFAULT_EQ_PARAMS: EQParams = Object.freeze({
  lowGain: 0,
  lowMidGain: 0,
  midGain: 0,
  highMidGain: 0,
  highGain: 0,
})

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

export interface FXParams {
  reverbSize: number
  reverbTime: number
  reverbWet: number
  delayTime: Tone.Unit.Time
  delayPingPong: boolean
  delayWet: number
  saturationAmount: number
  phaserFrequency: number
  phaserDepth: number
  chorusFrequency: number
  chorusDepth: number
}

export const DEFAULT_FX_PARAMS: FXParams = Object.freeze({
  reverbSize: 0.5,
  reverbTime: 1.0,
  reverbWet: 0.3,
  delayTime: "8n",
  delayPingPong: false,
  delayWet: 0.3,
  saturationAmount: 0,
  phaserFrequency: 0.5,
  phaserDepth: 0.5,
  chorusFrequency: 1.5,
  chorusDepth: 0.5,
} as FXParams)

interface PadFXChain {
  inputGain: Tone.Gain
  saturation: Tone.Distortion
  phaser: Tone.Phaser
  chorus: Tone.Chorus
  delay: Tone.FeedbackDelay
  pingPongDelay: Tone.PingPongDelay
  reverb: Tone.Reverb
  currentDelayNode: Tone.FeedbackDelay | Tone.PingPongDelay
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
  private meterBuses: Map<number, Tone.Gain>
  private fxChains: Map<number, PadFXChain>
  private players: Map<number, Tone.Player> // Keep for backwards compatibility
  private padSettings: Map<number, PadSettings>
  private padFXParams: Map<number, FXParams>
  private padEQValues: Map<number, EQParams>
  private initialized = false
  private customSamples: Map<number, string> = new Map()

  private constructor() {
    this.buffers = new Map()
    this.gainNodes = new Map()
    this.envelopes = new Map()
    this.eqFilters = new Map()
    this.meterBuses = new Map()
    this.fxChains = new Map()
    this.players = new Map()
    this.padSettings = new Map()
    this.padFXParams = new Map()
    this.padEQValues = new Map()
    this.loadPersistedPadState()
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

      const oldFX = this.fxChains.get(padId)
      if (oldFX) {
        try {
          oldFX.chorus.stop()
        } catch {
          // ignore
        }
        oldFX.inputGain.dispose()
        oldFX.saturation.dispose()
        oldFX.phaser.dispose()
        oldFX.chorus.dispose()
        oldFX.delay.dispose()
        oldFX.pingPongDelay.dispose()
        oldFX.reverb.dispose()
        this.fxChains.delete(padId)
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

      // Create a meter bus for VU metering (fan-out tap only; NOT routed to destination)
      const meterBus = new Tone.Gain(1)
      
      // Connect persistent gain node: gainNode → destination + meterBus (fan-out)
      gainNode.toDestination()
      gainNode.connect(meterBus)

      const fxChain = this.createPadFXChain(gainNode, {
        eq3,
        lowMidFilter,
        highMidFilter,
      })
      this.fxChains.set(padId, fxChain)
      const fxState =
        this.padFXParams.get(padId) ?? this.createDefaultFXParams()
      const normalizedFx = { ...this.createDefaultFXParams(), ...fxState }
      this.padFXParams.set(padId, normalizedFx)
      this.applyFXParams(padId, normalizedFx)

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
      const storedEQ = this.padEQValues.get(padId)
      if (storedEQ) {
        this.applyEQParams(padId, storedEQ)
      } else {
        this.padEQValues.set(padId, { ...DEFAULT_EQ_PARAMS })
      }

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
    const padFXChain = this.fxChains.get(padId)

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
      if (padFXChain) {
        envelopeGain.connect(padFXChain.inputGain)
      } else if (persistentGainNode) {
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
    const next = { ...(this.padEQValues.get(padId) ?? DEFAULT_EQ_PARAMS) }
    if (params.lowGain !== undefined) next.lowGain = params.lowGain
    if (params.lowMidGain !== undefined) next.lowMidGain = params.lowMidGain
    if (params.midGain !== undefined) next.midGain = params.midGain
    if (params.highMidGain !== undefined) next.highMidGain = params.highMidGain
    if (params.highGain !== undefined) next.highGain = params.highGain

    this.padEQValues.set(padId, next)
    this.applyEQParams(padId, next)
    this.persistPadState()
  }

  getEQ(padId: number): EQParams {
    const stored = this.padEQValues.get(padId)
    if (stored) {
      return { ...stored }
    }

    const filters = this.eqFilters.get(padId)
    if (filters) {
      const current: EQParams = {
        lowGain: filters.eq3.low.value,
        lowMidGain: filters.lowMidFilter.gain.value,
        midGain: filters.eq3.mid.value,
        highMidGain: filters.highMidFilter.gain.value,
        highGain: filters.eq3.high.value,
      }
      this.padEQValues.set(padId, current)
      return { ...current }
    }

    return { ...DEFAULT_EQ_PARAMS }
  }

  setFX(padId: number, params: Partial<FXParams>) {
    const current = this.padFXParams.get(padId) ?? this.createDefaultFXParams()
    const next = { ...current, ...params }
    this.padFXParams.set(padId, next)
    this.applyFXParams(padId, next)
    this.persistPadState()
  }

  getFX(padId: number): FXParams {
    const current = this.padFXParams.get(padId)
    return current ? { ...current } : this.createDefaultFXParams()
  }

  private loadPersistedPadState() {
    if (typeof window === "undefined") return
    try {
      const raw = window.localStorage.getItem(PAD_STATE_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Record<
        string,
        {
          fx?: Partial<FXParams>
          eq?: Partial<EQParams>
        }
      >
      Object.entries(parsed).forEach(([padKey, state]) => {
        const padId = Number.parseInt(padKey, 10)
        if (Number.isNaN(padId)) return
        if (state.eq) {
          this.padEQValues.set(padId, { ...DEFAULT_EQ_PARAMS, ...state.eq })
        }
        if (state.fx) {
          this.padFXParams.set(padId, { ...this.createDefaultFXParams(), ...state.fx })
        }
      })
    } catch (error) {
      console.error("[AudioEngine] Failed to load pad params:", error)
    }
  }

  private persistPadState() {
    if (typeof window === "undefined") return
    try {
      const padIds = new Set<number>([
        ...this.padEQValues.keys(),
        ...this.padFXParams.keys(),
      ])
      const payload: Record<number, { fx?: FXParams; eq?: EQParams }> = {}
      padIds.forEach((padId) => {
        const entry: { fx?: FXParams; eq?: EQParams } = {}
        const eq = this.padEQValues.get(padId)
        if (eq) {
          entry.eq = { ...eq }
        }
        const fx = this.padFXParams.get(padId)
        if (fx) {
          entry.fx = { ...fx }
        }
        if (entry.fx || entry.eq) {
          payload[padId] = entry
        }
      })
      window.localStorage.setItem(PAD_STATE_STORAGE_KEY, JSON.stringify(payload))
    } catch (error) {
      console.error("[AudioEngine] Failed to persist pad params:", error)
    }
  }

  private createDefaultFXParams(): FXParams {
    return { ...DEFAULT_FX_PARAMS }
  }

  private applyEQParams(padId: number, params: EQParams) {
    const filters = this.eqFilters.get(padId)
    if (!filters) return

    filters.eq3.low.value = params.lowGain
    filters.eq3.mid.value = params.midGain
    filters.eq3.high.value = params.highGain
    filters.lowMidFilter.gain.value = params.lowMidGain
    filters.highMidFilter.gain.value = params.highMidGain
  }

  private createPadFXChain(gainNode: Tone.Gain, eqNodes: PadEQFilters): PadFXChain {
    const inputGain = new Tone.Gain(1)
    const saturation = new Tone.Distortion(0)
    saturation.oversample = "4x"

    const phaser = new Tone.Phaser({
      frequency: 0.5,
      octaves: 2,
      baseFrequency: 350,
      wet: 0,
    })

    const chorus = new Tone.Chorus({
      frequency: 1.5,
      depth: 0.5,
      wet: 0,
      spread: 60,
    }).start()

    const delay = new Tone.FeedbackDelay("8n", 0.2)
    const pingPongDelay = new Tone.PingPongDelay("8n", 0.2)

    const reverb = new Tone.Reverb({
      decay: 1.2,
      preDelay: 0.01,
      wet: 0.3,
    })
    reverb.generate().catch(() => {
      // Ignore impulse errors and continue with default buffer
    })

    inputGain.connect(saturation)
    saturation.connect(eqNodes.eq3)
    eqNodes.eq3.connect(eqNodes.lowMidFilter)
    eqNodes.lowMidFilter.connect(eqNodes.highMidFilter)
    eqNodes.highMidFilter.connect(phaser)
    phaser.connect(chorus)
    chorus.connect(delay)
    delay.connect(reverb)
    reverb.connect(gainNode)

    return {
      inputGain,
      saturation,
      phaser,
      chorus,
      delay,
      pingPongDelay,
      reverb,
      currentDelayNode: delay,
    }
  }

  private updateDelayRouting(chain: PadFXChain, usePingPong: boolean) {
    const nextNode = usePingPong ? chain.pingPongDelay : chain.delay
    if (chain.currentDelayNode === nextNode) {
      return
    }

    try {
      chain.chorus.disconnect(chain.currentDelayNode)
    } catch {
      // ignore
    }

    try {
      chain.currentDelayNode.disconnect(chain.reverb)
    } catch {
      // ignore
    }

    chain.chorus.connect(nextNode)
    nextNode.connect(chain.reverb)
    chain.currentDelayNode = nextNode
  }

  private applyFXParams(padId: number, params: FXParams) {
    const chain = this.fxChains.get(padId)
    if (!chain) return

    const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

    chain.saturation.distortion = clamp(params.saturationAmount / 10, 0, 1)

    chain.reverb.wet.value = clamp(params.reverbWet, 0, 1)
    chain.reverb.decay = clamp(params.reverbTime, 0.1, 10)
    chain.reverb.preDelay = clamp(params.reverbSize * 0.1, 0, 0.2)

    chain.delay.delayTime.value = params.delayTime
    chain.pingPongDelay.delayTime.value = params.delayTime

    const wet = clamp(params.delayWet, 0, 1)
    if (params.delayPingPong) {
      chain.delay.wet.value = 0
      chain.pingPongDelay.wet.value = wet
    } else {
      chain.delay.wet.value = wet
      chain.pingPongDelay.wet.value = 0
    }

    this.updateDelayRouting(chain, params.delayPingPong)

    chain.phaser.frequency.value = clamp(params.phaserFrequency, 0.1, 10)
    chain.phaser.octaves = clamp(params.phaserDepth * 4, 0.1, 6)
    chain.phaser.wet.value = clamp(params.phaserDepth, 0, 1)

    chain.chorus.frequency.value = clamp(params.chorusFrequency, 0.1, 10)
    chain.chorus.depth = clamp(params.chorusDepth, 0, 1)
    chain.chorus.wet.value = clamp(params.chorusDepth, 0, 1)
  }

  getPlayer(padId: number): Tone.Player | undefined {
    return this.players.get(padId)
  }

  getEnvelope(padId: number): Tone.AmplitudeEnvelope | undefined {
    return this.envelopes.get(padId)
  }

  getMeterBus(padId: number): Tone.Gain | undefined {
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
    this.fxChains.forEach((chain) => {
      try {
        chain.chorus.stop()
      } catch {
        // ignore
      }
      chain.inputGain.dispose()
      chain.saturation.dispose()
      chain.phaser.dispose()
      chain.chorus.dispose()
      chain.delay.dispose()
      chain.pingPongDelay.dispose()
      chain.reverb.dispose()
    })
    this.buffers.clear()
    this.gainNodes.clear()
    this.players.clear()
    this.envelopes.clear()
    this.meterBuses.clear()
    this.eqFilters.clear()
    this.fxChains.clear()
    this.padFXParams.clear()
    this.padEQValues.clear()
    this.customSamples.clear()
    this.initialized = false
  }
}
