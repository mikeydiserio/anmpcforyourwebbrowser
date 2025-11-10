"use client"

import type React from "react"
import { useState } from "react"
import styled from "styled-components"
import { ArrangementView } from "./arrangement-view"

interface SequencerGridProps {
  steps: number
  pads: number
  currentStep: number
  pattern: boolean[][]
  currentPatternIndex: number
  padLabels: string[]
  swing: number
  onStepToggle: (step: number, pad: number) => void
  onPatternChange: (patternIndex: number) => void
  onSwingChange: (swing: number) => void
  onCopyPattern?: () => void
}

const GridContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const TabContainer = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
`

const Tab = styled.button<{ $active: boolean }>`
  background: ${(props) =>
    props.$active ? "linear-gradient(145deg, #f0e8d0, #d8d0b8)" : "linear-gradient(145deg, #4a4a4a, #3a3a3a)"};
  color: ${(props) => (props.$active ? "#2a2a2a" : "#888")};
  border: 2px solid ${(props) => (props.$active ? "#c8c0b0" : "#2a2a2a")};
  border-radius: 4px 4px 0 0;
  padding: 8px 16px;
  font-size: 11px;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.1s ease;
  box-shadow: ${(props) =>
    props.$active
      ? "inset 0 2px 4px rgba(0,0,0,0.2), 0 1px 2px rgba(255,255,255,0.3)"
      : "inset 0 -2px 4px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)"};

  &:hover {
    background: ${(props) =>
      props.$active ? "linear-gradient(145deg, #f5edd5, #ddd5bd)" : "linear-gradient(145deg, #555, #444)"};
  }

  &:active {
    transform: scale(0.98);
  }
`

const PatternContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: linear-gradient(145deg, #c8c0b0, #b0a898);
  padding: 12px;
  border-radius: 4px;
  border: 3px solid #8a826e;
  box-shadow: 
    inset 0 2px 6px rgba(255, 255, 255, 0.3),
    inset 0 -2px 8px rgba(0, 0, 0, 0.4),
    0 4px 12px rgba(0, 0, 0, 0.5);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      linear-gradient(45deg, transparent 48%, rgba(0,0,0,0.02) 50%, transparent 52%),
      linear-gradient(-45deg, transparent 48%, rgba(0,0,0,0.02) 50%, transparent 52%);
    background-size: 3px 3px;
    pointer-events: none;
    border-radius: 4px;
  }
`

const GridHeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(138, 130, 110, 0.5);
  color: #2a2a2a;
  font-weight: bold;
  font-size: 11px;
  position: relative;
  z-index: 1;
  
  select {
    background: linear-gradient(145deg, #4a4a4a, #3a3a3a);
    color: #d4af37;
    border: 2px solid #2a2a2a;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 11px;
    cursor: pointer;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
    
    &:hover {
      background: linear-gradient(145deg, #555, #444);
    }
  }
`

const SwingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  background: linear-gradient(145deg, #3a3a3a, #2a2a2a);
  border: 2px solid #1a1a1a;
  border-radius: 4px;
  min-width: 100px;
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.2);
`

const SwingLabel = styled.div`
  font-size: 9px;
  color: #7eb3e8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`

const SwingValue = styled.div`
  font-size: 11px;
  color: #7eb3e8;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`

const CopyButton = styled.button`
  background: linear-gradient(145deg, #4a9eff, #3a8eef);
  color: white;
  border: 2px solid #2a7edf;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.1s;
  box-shadow: 
    inset 0 2px 4px rgba(0,0,0,0.2),
    0 2px 4px rgba(0,0,0,0.3);
  white-space: nowrap;

  &:hover {
    background: linear-gradient(145deg, #5ab3ff, #4a9eff);
  }

  &:active {
    box-shadow: inset 0 2px 6px rgba(0,0,0,0.3);
    transform: translateY(1px);
  }
`

const StepRow = styled.div`
  display: flex;
  gap: 2px;
  flex: 1;
`

const StepButton = styled.button<{ $active: boolean; $current: boolean }>`
  flex: 1;
  min-width: 0;
  height: 32px;
  background: ${(props) => {
    if (props.$active && props.$current) return "#ff6b6b"
    if (props.$active) return "#4a9eff"
    if (props.$current) return "#3a3a3a"
    return "#2a2a2a"
  }};
  border: 1px solid ${(props) => (props.$current ? "#666" : "#444")};
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.05s ease;

  &:hover {
    background: ${(props) => (props.$active ? "#5ab3ff" : "#363636")};
  }

  &:active {
    transform: scale(0.95);
  }
`

const PadLabel = styled.div`
  width: 60px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 8px;
  font-size: 9px;
  color: #2a2a2a;
  font-weight: bold;
  text-transform: uppercase;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.3);
`

const Row = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  width: 100%;
`

export const SequencerGrid: React.FC<SequencerGridProps> = ({
  steps,
  pads,
  currentStep,
  pattern,
  currentPatternIndex,
  padLabels,
  swing,
  onStepToggle,
  onPatternChange,
  onSwingChange,
  onCopyPattern,
}) => {
  const [activeTab, setActiveTab] = useState<"pattern" | "arrangement">("pattern")

  return (
    <GridContainer>
      <TabContainer>
        <Tab $active={activeTab === "pattern"} onClick={() => setActiveTab("pattern")}>
          Pattern
        </Tab>
        <Tab $active={activeTab === "arrangement"} onClick={() => setActiveTab("arrangement")}>
          Arrangement View
        </Tab>
      </TabContainer>

      {activeTab === "pattern" ? (
        <PatternContainer>
          <GridHeaderContent>
            <div>Pattern:</div>
            <select value={currentPatternIndex} onChange={(e) => onPatternChange(Number(e.target.value))}>
              {Array.from({ length: 99 }, (_, i) => (
                <option key={i} value={i}>
                  Pattern {String(i + 1).padStart(2, "0")}
                </option>
              ))}
            </select>
            {onCopyPattern && (
              <CopyButton onClick={onCopyPattern} title="Copy current pattern to next empty pattern">
                Copy Pattern
              </CopyButton>
            )}
            <SwingContainer>
              <SwingLabel>Swing</SwingLabel>
              <SwingValue>{swing}%</SwingValue>
              <input 
                type="range" 
                min="50" 
                max="75" 
                step="1"
                value={swing} 
                onChange={(e) => onSwingChange(Number(e.target.value))} 
              />
            </SwingContainer>
          </GridHeaderContent>

          {Array.from({ length: pads }).map((_, padIdx) => (
            <Row key={padIdx}>
              <PadLabel>{padLabels[padIdx]}</PadLabel>
              <StepRow>
                {Array.from({ length: steps }).map((_, stepIdx) => (
                  <StepButton
                    key={stepIdx}
                    $active={pattern[stepIdx]?.[padIdx] || false}
                    $current={stepIdx === currentStep}
                    onClick={() => onStepToggle(stepIdx, padIdx)}
                  />
                ))}
              </StepRow>
            </Row>
          ))}
        </PatternContainer>
      ) : (
        <ArrangementView />
      )}
    </GridContainer>
  )
}
