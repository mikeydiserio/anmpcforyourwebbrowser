"use client";
import React, { createContext, ReactNode, useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';

export interface MPCContextProps {
  bpm: number;
  setBpm: (bpm: number) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  activePadIndex: number;
  setActivePadIndex: (index: number | null) => void;
  metronomeOn: boolean;
  setMetronomeOn: (on: boolean) => void;
	metronome: Tone.Player;
  loopOn: boolean;
  setLoopOn: (on: boolean) => void;
  players: Tone.Player[];
	padSamples: { fileName: string; dataUrl: string }[] | null;
	setPadSamples: (samples: { fileName: string; dataUrl: string }[] | null) => void;
	// Add any other properties you
}

export const MPCContext = createContext<MPCContextProps | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const MPCContextProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [bpm, setBpm] = useState<number>(120);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activePadIndex, setActivePadIndex] = useState<number | null>(0);
  const [metronomeOn, setMetronomeOn] = useState<boolean>(false);
  const [loopOn, setLoopOn] = useState<boolean>(false);

		const metronome = new Tone.Player("./sounds/woodblock.wav").toDestination();

	// padSamples: an array of 16 elements, each holding an object { fileName, dataUrl } or null.
	const [padSamples, setPadSamples] = useState(() => {
	if (typeof window !== 'undefined') {
		const saved = localStorage.getItem('mpc-pad-samples');
		return saved ? JSON.parse(saved) : Array(16).fill(null);
	}
	return Array(16).fill(null);
});

// After – note the .toDestination() call!
const playersRef = useRef<Tone.Player[]>(
  Array.from({ length: 16 }, () => new Tone.Player().toDestination())
);

const players = playersRef.current;


 // Load stored samples into players on mount.
 useEffect(() => {
	padSamples.forEach((sample: { dataUrl: string; }, index: number) => {
		if (sample && sample.dataUrl) {
			players[index]?.load(sample.dataUrl)
		}
	});
	// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

 // Persist padSamples to localStorage whenever they change.
 useEffect(() => {
		localStorage.setItem('mpc-pad-samples', JSON.stringify(padSamples));
}, [padSamples]);


  const contextValue: MPCContextProps = {
    bpm,
    setBpm,
    isPlaying,
    setIsPlaying,
    activePadIndex: activePadIndex ?? 0,
    setActivePadIndex,
    metronomeOn,
    setMetronomeOn,
		metronome,
    loopOn,
    setLoopOn,
    players: playersRef.current,
		padSamples,
		setPadSamples,
  };

  return (
    <MPCContext.Provider value={contextValue}>
      {children}
    </MPCContext.Provider>
  );
};


// "use client";
// import { createContext, useRef, useState } from 'react';
// import * as Tone from 'tone';

// const defaultContextValue = {
//   bpm: 120,
//   isPlaying: false,
//   activePadIndex: 1,
//   metronomeOn: false,
//   loopOn: false,
//   players: [] as Tone.Player[],
// }
// export const MPCContext = createContext(defaultContextValue);

// import { ReactNode } from 'react';

// export const MPCContextProvider = ({ children }: { children: ReactNode }) => {
//   const [bpm, setBpm] = useState(120);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [activePadIndex, setActivePadIndex] = useState(1);
//   const [metronomeOn, setMetronomeOn] = useState(false);
//   const [loopOn, setLoopOn] = useState(false);


//   // Create an array of 16 players
//   const playersRef = useRef(Array.from({ length: 16 }, () => new Tone.Player().toDestination()));

//   const contextValue = {
//     bpm,
//     setBpm,
//     isPlaying,
//     setIsPlaying,
//     activePadIndex,
//     setActivePadIndex,
//     metronomeOn,
//     setMetronomeOn,
//     loopOn,
//     setLoopOn,
//     players: playersRef.current,
//   };

//   return (
//     <MPCContext.Provider value={contextValue}>
//       {children}
//     </MPCContext.Provider>
//   );
// };
