'use client';
import { MPCContext } from '@/context/MPCContext';
import styled from '@emotion/styled';
import React, { useContext, useEffect, useState } from 'react';
import * as Tone from 'tone';

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
`;

const Cell = styled.div<{ active: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 10%;
  background-color: ${(props) => (props.active ? 'currentColor' : '#2d2d2d')};
  cursor: pointer;
  transition: transform 0.1s ease, background-color 0.1s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const RowLabel = styled.td`
  padding-right: 8px;
  font-size: 12px;
  color: var(--neon-blue);
`;

const Sequencer: React.FC = () => {
  const context = useContext(MPCContext);
  if (!context) throw new Error('AppContext is not defined');
  const { bpm, players, loopOn } = context;
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Initialize a 16x16 grid for each pad’s sequence steps.
  const [activeSteps, setActiveSteps] = useState<boolean[][]>(
    Array.from({ length: 16 }, () => Array(16).fill(false))
  );

  const toggleStep = (row: number, col: number) => {
    setActiveSteps((prev) => {
      const newSteps = prev.map((r) => [...r]);
      newSteps[row] = newSteps[row] ?? [];
      newSteps[row][col] = !newSteps[row][col];
      return newSteps;
    });
  };

  useEffect(() => {

    Tone.getTransport().bpm.value = bpm;
  }, [bpm]);

  useEffect(() => {
    const stepDuration = (60 / bpm) / 4; // 16th notes
    const intervalId = setInterval(() => {
      // Update transport line position
      const transportLine = document.getElementById('transport-line');
      const stepWidth = 100 / 16;
      if (transportLine) {
        transportLine.style.left = `${currentStep * stepWidth}%`;
        transportLine.style.width = `${stepWidth}%`;
      }
      // Play active steps for the current step
      activeSteps.forEach((rowSteps, rowIndex) => {
        if (rowSteps[currentStep] && players[rowIndex]?.loaded) {
          players[rowIndex].start();
        }
      });
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next >= 16) {
          if (!loopOn) clearInterval(intervalId);
          return 0;
        }
        return next;
      });
    }, stepDuration * 1000);

    return () => clearInterval(intervalId);
  }, [bpm, activeSteps, players, loopOn, currentStep]);

  return (
    <Table>
      <tbody>
        {activeSteps.map((row, rowIndex) => (
          <tr key={rowIndex}>
            <RowLabel>{rowIndex + 1}</RowLabel>
            {row.map((active, colIndex) => (
              <td key={colIndex}>
                <Cell active={active} onClick={() => toggleStep(rowIndex, colIndex)} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default Sequencer;
