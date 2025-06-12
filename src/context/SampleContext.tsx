"use client";
import { createContext, ReactNode, useContext, useState } from "react";
import { Sample, SampleContextType } from "../types";

const SampleContext = createContext<SampleContextType | undefined>(undefined);

export const SampleProvider = ({ children }: { children: ReactNode }) => {
  const [samples, setSamplesState] = useState<Sample[]>([]);
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
	const [tempoSpeed, setTempoSpeed] = useState('Normal')
	const [activeFilter, setActiveFilter] = useState('')

  const setSamples = (newSamples: Sample[]) => {
    setSamplesState(newSamples);
  };

  const selectSample = (sample: Sample) => {
    setSelectedSample(sample);
  };

	const setTempo = (tempo: string) => {
		setTempoSpeed(tempo);
	}

	const setFilter = (filter: string) => {
		setActiveFilter(filter);
	};

	return (
    <SampleContext.Provider
      value={{ samples, selectedSample, setSamples, selectSample, setTempo, setFilter, tempoSpeed, activeFilter } as SampleContextType}
    >
      {children}
    </SampleContext.Provider>
  );
};

export const useSampleContext = (): SampleContextType => {
  const context = useContext(SampleContext);
  if (!context) {
    throw new Error("useSampleContext must be used within a SampleProvider");
  }
  return context;
};
