export interface DrumKit {
  name: string
  samples: string[]
}

// Predefined sample mappings for each kit based on actual file structure in public/drum-machines
const KIT_SAMPLE_MAPPINGS: Record<string, string[]> = {
  "Roland TR-808": [
    "/drum-machines/Roland TR-808/Bassdrum-01.wav", // Kick
    "/drum-machines/Roland TR-808/Snaredrum.wav", // Snare
    "/drum-machines/Roland TR-808/Clap.wav", // Clap
    "/drum-machines/Roland TR-808/Hat Closed.wav", // HH Closed
    "/drum-machines/Roland TR-808/Tom L.wav", // Low Tom
    "/drum-machines/Roland TR-808/Tom M.wav", // Mid Tom
    "/drum-machines/Roland TR-808/Tom H.wav", // Hi Tom
    "/drum-machines/Roland TR-808/Hat Open.wav", // HH Open
    "/drum-machines/Roland TR-808/Crash-01.wav", // Cymbal
    "/drum-machines/Roland TR-808/Rimshot.wav", // Rim
    "/drum-machines/Roland TR-808/Cowbell.wav", // Cowbell
    "/drum-machines/Roland TR-808/Cabasa.wav", // Conga High (using Cabasa)
    "/drum-machines/Roland TR-808/Claves.wav", // Conga Low (using Claves)
    "/drum-machines/Roland TR-808/Cabasa.wav", // Maracas (using Cabasa)
    "/drum-machines/Roland TR-808/Claves.wav", // Clave
    "/drum-machines/Roland TR-808/Crash-02.wav", // Accent (using Crash-02)
  ],
  "Roland TR-606": [
    "/drum-machines/Roland TR-606/Bassdrum.wav", // Kick
    "/drum-machines/Roland TR-606/Snaredrum.wav", // Snare
    "/drum-machines/Roland TR-606/Cymbal.wav", // Clap (using Cymbal)
    "/drum-machines/Roland TR-606/Hat Closed.wav", // HH Closed
    "/drum-machines/Roland TR-606/Tom H.wav", // Tom
    "/drum-machines/Roland TR-606/Tom L.wav", // Tom 2
    "/drum-machines/Roland TR-606/Hat Open.wav", // HH Open
    "/drum-machines/Roland TR-606/Cymbal.wav", // Perc
    "/drum-machines/Roland TR-606/Cymbal.wav", // Perc 2
    "/drum-machines/Roland TR-606/Cymbal.wav", // Shaker
    "/drum-machines/Roland TR-606/Cymbal.wav", // Cowbell
    "/drum-machines/Roland TR-606/Cymbal.wav", // Rim
    "/drum-machines/Roland TR-606/Cymbal.wav", // Clav
    "/drum-machines/Roland TR-606/Cymbal.wav", // Snap
    "/drum-machines/Roland TR-606/Cymbal.wav", // Chord
    "/drum-machines/Roland TR-606/Cymbal.wav", // FX
  ],
  "Roland TR-707": [
    "/drum-machines/Roland TR-707/Bassdrum-01.wav", // Kick
    "/drum-machines/Roland TR-707/Snaredrum-01.wav", // Snare
    "/drum-machines/Roland TR-707/Clap.wav", // Clap
    "/drum-machines/Roland TR-707/Hat Closed.wav", // HH Closed
    "/drum-machines/Roland TR-707/Tom H.wav", // Tom 1
    "/drum-machines/Roland TR-707/Tom M.wav", // Tom 2
    "/drum-machines/Roland TR-707/Crash.wav", // Cymbal
    "/drum-machines/Roland TR-707/Hat Open.wav", // HH Open
    "/drum-machines/Roland TR-707/Cowbell.wav", // Perc
    "/drum-machines/Roland TR-707/Tambourine.wav", // Shaker
    "/drum-machines/Roland TR-707/Cowbell.wav", // Cowbell
    "/drum-machines/Roland TR-707/Rimshot.wav", // Rim
    "/drum-machines/Roland TR-707/Rimshot.wav", // Clav
    "/drum-machines/Roland TR-707/Rimshot.wav", // Snap
    "/drum-machines/Roland TR-707/Rimshot.wav", // Chord
    "/drum-machines/Roland TR-707/Tom L.wav", // FX
  ],
  "LinnDrum": [
    "/drum-machines/Akai Linndrum/Bassdrum.wav", // Kick
    "/drum-machines/Akai Linndrum/SD.wav", // Snare
    "/drum-machines/Akai Linndrum/Clap.wav", // Clap
    "/drum-machines/Akai Linndrum/Closed Hat.wav", // HH Closed
    "/drum-machines/Akai Linndrum/Tom L.wav", // Tom
    "/drum-machines/Akai Linndrum/Tom M.wav", // Tom 2
    "/drum-machines/Akai Linndrum/Crash.wav", // Cymbal
    "/drum-machines/Akai Linndrum/Open Hat.wav", // HH Open
    "/drum-machines/Akai Linndrum/Cowbell.wav", // Perc
    "/drum-machines/Akai Linndrum/Shuffle.wav", // Shaker
    "/drum-machines/Akai Linndrum/Cowbell.wav", // Cowbell
    "/drum-machines/Akai Linndrum/Tambourin.wav", // Rim
    "/drum-machines/Akai Linndrum/Tambourin.wav", // Clav
    "/drum-machines/Akai Linndrum/Tambourin.wav", // Snap
    "/drum-machines/Akai Linndrum/Tambourin.wav", // Chord
    "/drum-machines/Akai Linndrum/Ride.wav", // FX
  ],
  "Akai Sampler": [
    "/drum-machines/Akai MPC-60/Bass.wav", // Kick
    "/drum-machines/Akai MPC-60/Snare 1.wav", // Snare
    "/drum-machines/Akai MPC-60/Clap.wav", // Clap
    "/drum-machines/Akai MPC-60/Closed Hat.wav", // HiHat
    "/drum-machines/Akai MPC-60/Tom L.wav", // Tom1
    "/drum-machines/Akai MPC-60/Tom M.wav", // Tom2
    "/drum-machines/Akai MPC-60/Crash.wav", // Cymbal
    "/drum-machines/Akai MPC-60/Bongo.wav", // Perc1
    "/drum-machines/Akai MPC-60/Conga H.wav", // Perc2
    "/drum-machines/Akai MPC-60/Conga L.wav", // Shaker
    "/drum-machines/Akai MPC-60/Conga H.wav", // Cowbell
    "/drum-machines/Akai MPC-60/Rim Gated.wav", // Rim
    "/drum-machines/Akai MPC-60/Click.wav", // Clav
    "/drum-machines/Akai MPC-60/Click.wav", // Snap
    "/drum-machines/Akai MPC-60/Electric Piano.wav", // Chord
    "/drum-machines/Akai MPC-60/Timbale.wav", // FX
  ],
  "Korg Minipops": [
    "/drum-machines/Korg Minipops/BASSDRUM/Bassdrum-01.wav", // Bass Drum
    "/drum-machines/Korg Minipops/SNARES/Snaredrum-01.wav", // Snare
    "/drum-machines/Korg Minipops/SNARES/Snaredrum-02.wav", // Clap
    "/drum-machines/Korg Minipops/CYMBALS/Hat Closed-01.wav", // HiHat
    "/drum-machines/Korg Minipops/MISC/Tom-01.wav", // Tom
    "/drum-machines/Korg Minipops/MISC/Tom-02.wav", // Conga
    "/drum-machines/Korg Minipops/CYMBALS/Hat Open-01.wav", // Cymbal
    "/drum-machines/Korg Minipops/CYMBALS/Hat Open-02.wav", // Rim
    "/drum-machines/Korg Minipops/MISC/Woodblock-01.wav", // Perc1
    "/drum-machines/Korg Minipops/MISC/Woodblock-02.wav", // Perc2
    "/drum-machines/Korg Minipops/SNARES/Snaredrum-03.wav", // Shaker
    "/drum-machines/Korg Minipops/MISC/Woodblock-01.wav", // Cowbell
    "/drum-machines/Korg Minipops/SNARES/Snaredrum-04.wav", // Clave
    "/drum-machines/Korg Minipops/SNARES/Snaredrum-05.wav", // Snap
    "/drum-machines/Korg Minipops/BASSDRUM/Bassdrum-02.wav", // Block
    "/drum-machines/Korg Minipops/CYMBALS/Hat Open-03.wav", // FX
  ],
  "Oberheim DMX": [
    "/drum-machines/Oberheim DMX/Bassdrum-01.wav", // Kick
    "/drum-machines/Oberheim DMX/Snaredrum-01.wav", // Snare
    "/drum-machines/Oberheim DMX/Clap.wav", // Clap
    "/drum-machines/Oberheim DMX/Hat Closed.wav", // HH Closed
    "/drum-machines/Oberheim DMX/Hat Open.wav", // HH Open
    "/drum-machines/Oberheim DMX/Tom L.wav", // Tom Low
    "/drum-machines/Oberheim DMX/Tom M.wav", // Tom Mid
    "/drum-machines/Oberheim DMX/Tom H.wav", // Tom High
    "/drum-machines/Oberheim DMX/Crash.wav", // Cymbal
    "/drum-machines/Oberheim DMX/Rim Shot.wav", // Rim
    "/drum-machines/Oberheim DMX/Cabasa.wav", // Cowbell
    "/drum-machines/Oberheim DMX/Tamborine.wav", // Shaker
    "/drum-machines/Oberheim DMX/Cabasa.wav", // Clave
    "/drum-machines/Oberheim DMX/Timbale H.wav", // Perc
    "/drum-machines/Oberheim DMX/Timbale M.wav", // Block
    "/drum-machines/Oberheim DMX/Timbale L.wav", // FX
  ],
  "Roland TR-909": [
    "/drum-machines/Roland TR-909/Bassdrum-01.wav", // Kick
    "/drum-machines/Roland TR-909/naredrum.wav", // Snare (note: filename appears to be missing 'S')
    "/drum-machines/Roland TR-909/Clap.wav", // Clap
    "/drum-machines/Roland TR-909/Hat Closed.wav", // HH Closed
    "/drum-machines/Roland TR-909/Hat Open.wav", // HH Open
    "/drum-machines/Roland TR-909/Tom L.wav", // Low Tom
    "/drum-machines/Roland TR-909/Tom M.wav", // Mid Tom
    "/drum-machines/Roland TR-909/Tom H.wav", // Hi Tom
    "/drum-machines/Roland TR-909/Crash.wav", // Crash
    "/drum-machines/Roland TR-909/Ride.wav", // Ride
    "/drum-machines/Roland TR-909/Rimhot.wav", // Rim (note: filename appears to be 'Rimhot' not 'Rimshot')
    "/drum-machines/Roland TR-909/Rimhot.wav", // Clav
    "/drum-machines/Roland TR-909/Crash.wav", // Shaker
    "/drum-machines/Roland TR-909/Crash.wav", // Perc
    "/drum-machines/Roland TR-909/Crash.wav", // Block
    "/drum-machines/Roland TR-909/Bassdrum-02.wav", // FX
  ],
  "Yamaha RX-5": [
    "/drum-machines/Yamaha RX-5/Bassdrum.wav", // Kick
    "/drum-machines/Yamaha RX-5/Snaredrum.wav", // Snare
    "/drum-machines/Yamaha RX-5/Snaredrum-02.wav", // Clap
    "/drum-machines/Yamaha RX-5/Hat Closed.wav", // HH Closed
    "/drum-machines/Yamaha RX-5/Hat Open.wav", // HH Open
    "/drum-machines/Yamaha RX-5/Tom.wav", // Tom
    "/drum-machines/Yamaha RX-5/Snaredrum-03.wav", // Tom 2
    "/drum-machines/Yamaha RX-5/Bassdrum-02.wav", // Cymbal
    "/drum-machines/Yamaha RX-5/Tambourine.wav", // Perc
    "/drum-machines/Yamaha RX-5/Shaker.wav", // Shaker
    "/drum-machines/Yamaha RX-5/Cowbell.wav", // Cowbell
    "/drum-machines/Yamaha RX-5/Rimshot.wav", // Rim
    "/drum-machines/Yamaha RX-5/Rimshot.wav", // Clav
    "/drum-machines/Yamaha RX-5/Rimshot.wav", // Snap
    "/drum-machines/Yamaha RX-5/Tambourine.wav", // Block
    "/drum-machines/Yamaha RX-5/SFX.wav", // FX
  ],
  "Yamaha RY-30": [
    "/drum-machines/Yamaha RY-30/BASSDRUM/Bassdrum-01.wav", // Kick
    "/drum-machines/Yamaha RY-30/SNARES/Snare1.wav", // Snare
    "/drum-machines/Yamaha RY-30/SNARES/Snare2.wav", // Clap
    "/drum-machines/Yamaha RY-30/CYMBALS/Hat Closed-01.wav", // HiHat Closed
    "/drum-machines/Yamaha RY-30/CYMBALS/Hat Open-01.wav", // HiHat Open
    "/drum-machines/Yamaha RY-30/Toms/Tom L-01.wav", // Tom1
    "/drum-machines/Yamaha RY-30/Toms/Tom M-03.wav", // Tom2
    "/drum-machines/Yamaha RY-30/CYMBALS/Crash1.wav", // Cymbal
    "/drum-machines/Yamaha RY-30/Percussion/Bongo-01.wav", // Perc1
    "/drum-machines/Yamaha RY-30/Percussion/Tamb.wav", // Shaker
    "/drum-machines/Yamaha RY-30/Percussion/Cowbell-01.wav", // Cowbell
    "/drum-machines/Yamaha RY-30/SNARES/Rimshot1.wav", // Rim
    "/drum-machines/Yamaha RY-30/Percussion/Clap.wav", // Clav
    "/drum-machines/Yamaha RY-30/Misc/Snap.wav", // Snap
    "/drum-machines/Yamaha RY-30/Misc/String.wav", // Chord
    "/drum-machines/Yamaha RY-30/Misc/Noise.wav", // FX
  ],
}

export const DRUM_KITS: DrumKit[] = [
  {
    name: "Roland TR-808",
    samples: KIT_SAMPLE_MAPPINGS["Roland TR-808"],
  },
  {
    name: "Roland TR-606",
    samples: KIT_SAMPLE_MAPPINGS["Roland TR-606"],
  },
  {
    name: "Roland TR-707",
    samples: KIT_SAMPLE_MAPPINGS["Roland TR-707"],
  },
  {
    name: "LinnDrum",
    samples: KIT_SAMPLE_MAPPINGS["LinnDrum"],
  },
  {
    name: "Akai Sampler",
    samples: KIT_SAMPLE_MAPPINGS["Akai Sampler"],
  },
  {
    name: "Korg Minipops",
    samples: KIT_SAMPLE_MAPPINGS["Korg Minipops"],
  },
  {
    name: "Oberheim DMX",
    samples: KIT_SAMPLE_MAPPINGS["Oberheim DMX"],
  },
  {
    name: "Roland TR-909",
    samples: KIT_SAMPLE_MAPPINGS["Roland TR-909"],
  },
  {
    name: "Yamaha RX-5",
    samples: KIT_SAMPLE_MAPPINGS["Yamaha RX-5"],
  },
  {
    name: "Yamaha RY-30",
    samples: KIT_SAMPLE_MAPPINGS["Yamaha RY-30"],
  },
]

export const PAD_NAMES = [
  "Kick",
  "Snare",
  "Clap",
  "HiHat",
  "Tom1",
  "Tom2",
  "Cymbal",
  "Perc1",
  "Perc2",
  "Shaker",
  "Cowbell",
  "Rim",
  "Clav",
  "Snap",
  "Chord",
  "FX",
]
