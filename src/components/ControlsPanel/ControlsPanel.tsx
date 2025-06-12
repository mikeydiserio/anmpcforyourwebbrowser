'use client';
import { MPCContext } from '@/context/MPCContext';
import styled from '@emotion/styled';
import React, { useContext } from 'react';
import * as Tone from 'tone';
import Knob from './Knob';

const PanelContainer = styled.div`
  background-color: #2d2d2d;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--neon-blue);
  margin-bottom: 16px;
`;

const RangeContainer = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  color: var(--neon-blue);
  margin-bottom: 4px;
`;

const Slider = styled.input`
  width: 100%;
  appearance: none;
  height: 4px;
  background-color: #2d2d2d;
  border-radius: 4px;
  cursor: pointer;
`;

const EffectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const BottomControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MetronomeButton = styled.button<{ active: boolean }>`
  background-color: #2d2d2d;
  border: 1px solid ${(props) => (props.active ? 'var(--neon-blue)' : '#444')};
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const LoopLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: var(--neon-blue);
`;

const ControlsPanel: React.FC = () => {
  const context = useContext(MPCContext);
  if (!context) throw new Error('AppContext is not defined');
  const { bpm, setBpm, metronomeOn, setMetronomeOn, loopOn, setLoopOn, metronome } = context;

  const handleBpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBpm = parseInt(e.target.value, 10);
    setBpm(newBpm);
		Tone.getTransport().bpm.rampTo(newBpm, 0.1); // Instant change; adjust second parameter for a smooth transition
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    Tone.getDestination().volume.value = (value / 100) * 40 - 40;
  };

  const handleMetronomeToggle = () => {
		setMetronomeOn(!metronomeOn)


  if (!metronome.loaded) {
      metronome.load("./sounds/woodblock.wav").then(() => {
          // this will start the player on every quarter note
          Tone.getTransport().scheduleRepeat((time) => {
						metronome.start(time);
          }, "4n");
          // start the Transport for the events to start
          Tone.getTransport().start();
      });
  }
	if(metronomeOn){
		Tone.getTransport().stop();
		metronome.stop();
	} else {
		Tone.getTransport().start();
		metronome.start();
	}
}

  const handleLoopToggle = (e: React.ChangeEvent<HTMLInputElement>) => setLoopOn(e.target.checked);

  return (
    <PanelContainer>

      <SectionTitle>
        <i className="fas fa-sliders-h" style={{ marginRight: '8px' }} />
        CONTROLS
      </SectionTitle>
      <RangeContainer>
        <Label>BPM</Label>
        <Slider type="range" min="40" max="250" value={bpm} onChange={handleBpmChange} />
      </RangeContainer>
      <RangeContainer>
        <Label>Volume</Label>
        <Slider type="range" min="0" max="100" defaultValue="80" onChange={handleVolumeChange} />
      </RangeContainer>
      <RangeContainer>
        <Label>Effects</Label>
        <EffectsGrid>
          <Knob knobId="reverb" label="Reverb" />
          <Knob knobId="delay" label="Delay" />
          <Knob knobId="filter" label="Filter" />
          <Knob knobId="distortion" label="Distort" />
        </EffectsGrid>
      </RangeContainer>
      <BottomControls>
        <MetronomeButton active={metronomeOn} onClick={handleMetronomeToggle}>
          {metronomeOn ? <i>Metronome On</i> : <i>Metronome Off</i>}
        </MetronomeButton>
        <LoopLabel>
          <span>Loop</span>
          <input type="checkbox" onChange={handleLoopToggle} checked={loopOn} />
        </LoopLabel>
      </BottomControls>
    </PanelContainer>
  );
};

export default ControlsPanel;
