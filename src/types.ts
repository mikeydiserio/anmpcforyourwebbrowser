// types/index.ts

export interface Sample {
	id: string
	title: string
	artist: string
	albumName: string
	albumArt: string
	year: string
	drummer: string
	originalTrack: string
	sample: string
	bpm?: number
	key?: string
	image?: string
	artistPicture?: string
	description?: string
	comments?: CommentType[]
	createdAt?: Date
	updatedAt?: Date
}
export interface SampleContextType {
	samples: Sample[];
	selectedSample: Sample | null;
	setSamples: (samples: Sample[]) => void;
	selectSample: (sample: Sample) => void;
	tempoSpeed: string;
	setTempo: (tempo: string) => void;
	activeFilter: string;
}

  export interface CommentType {
    id: string
    content: string
    sampleId: string
    createdAt: Date
    verified: boolean
  }

  export interface PlayerState {
    currentSampleId: string | null
    isPlaying: boolean
    effects: {
      reverb: number
      eq: [number, number]
    }
  }
