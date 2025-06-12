'use client';
import { MPCContext, MPCContextProps } from '@/context/MPCContext';
import styled from '@emotion/styled';
import React, { useContext } from 'react';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  position: relative;
  margin-bottom: 16px;
`;

const PadButton = styled.button`
  aspect-ratio: 1;
  background-color: rgba(80, 78, 78, 0.5);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.08s ease, opacity 0.08s ease;
  border: none;
	height: 200px;
	width: 200px;


  &:active {
    transform: scale(0.96);
    opacity: 0.9;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const TransportLine = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 2px;
  background-color: var(--neon-blue);
  width: 0;
  transition: left 0.1s linear;
`;

const PadGrid: React.FC = () => {
  const context: MPCContextProps = useContext(MPCContext) as MPCContextProps;
  if (!context) throw new Error('AppContext is not defined');
  const {  activePadIndex, setActivePadIndex, players, padSamples } = context;

  const handlePadClick = (index: number) => {
		console.log('Pad clicked:', index);
    setActivePadIndex(index);
		console.log(players, players[index]);
    if (players[index]?.loaded) {
      players[index]?.start();
    }
  };

  const handlePadDoubleClick = (index: number) => {
    setActivePadIndex(index);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('openSampleModal'));
    }
  };

  return (
			<Grid>
				{players.map((player, i) => (
					<PadButton
						key={i}
						data-index={i.toString()}
						onClick={() => handlePadClick(i)}
						onDoubleClick={() => handlePadDoubleClick(i)}
					>
						<button onClick={() => handlePadDoubleClick(i)}>
							{activePadIndex === i && (
								<TransportLine style={{ left: `${(i % 4) * 25}%` }} />
							)}
						</button>
            {padSamples && padSamples[i]?.fileName ? (
								<span>{padSamples[i].fileName}</span>
							) : (
								<span>Load Sample</span>
							)}

						{player.loaded && <HiddenInput type="file" accept="audio/*" />}
					</PadButton>
				))}
				<TransportLine id="transport-line" />
			</Grid>
		);
};

export default PadGrid;
