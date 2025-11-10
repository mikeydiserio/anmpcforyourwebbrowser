"use client"

import type React from "react"
import { useState } from "react"
import styled from "styled-components"

interface ArrangementSlot {
  patternIndex: number
  position: number // Measure position in the arrangement
}

interface ArrangementViewProps {
  onArrangementChange?: (arrangement: ArrangementSlot[]) => void
}

const ArrangementContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #1a1a1a;
  padding: 12px;
  border-radius: 4px;
  border: 2px solid #333;
  min-height: 300px;
`

const ArrangementHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid #333;
`

const HeaderLabel = styled.div`
  font-size: 11px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const AddButton = styled.button`
  background: #4a9eff;
  color: #fff;
  border: none;
  border-radius: 3px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: bold;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.1s ease;

  &:hover {
    background: #5ab3ff;
  }

  &:active {
    transform: scale(0.95);
  }
`

const ArrangementGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
  max-height: 400px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #1a1a1a;
  }

  &::-webkit-scrollbar-thumb {
    background: #4a9eff;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #5ab3ff;
  }
`

const ArrangementSlotItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #2a2a2a;
  padding: 8px;
  border-radius: 3px;
  border: 1px solid #444;
`

const SlotPosition = styled.div`
  width: 40px;
  text-align: center;
  font-size: 11px;
  color: #888;
  font-weight: bold;
`

const PatternSelect = styled.select`
  flex: 1;
  background: #1a1a1a;
  color: #4a9eff;
  border: 1px solid #444;
  border-radius: 3px;
  padding: 6px 8px;
  font-size: 11px;
  font-weight: bold;
  cursor: pointer;
  outline: none;

  &:hover {
    background: #222;
    border-color: #4a9eff;
  }

  &:focus {
    border-color: #4a9eff;
  }

  option {
    background: #1a1a1a;
    color: #4a9eff;
  }
`

const RemoveButton = styled.button`
  background: #c92a2a;
  color: #fff;
  border: none;
  border-radius: 3px;
  padding: 4px 8px;
  font-size: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.1s ease;

  &:hover {
    background: #e03131;
  }

  &:active {
    transform: scale(0.95);
  }
`

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #555;
  font-size: 12px;
  text-align: center;
  font-style: italic;
`

export const ArrangementView: React.FC<ArrangementViewProps> = ({ onArrangementChange }) => {
  const [arrangement, setArrangement] = useState<ArrangementSlot[]>([])

  const addSlot = () => {
    const newSlot: ArrangementSlot = {
      patternIndex: 0,
      position: arrangement.length,
    }
    const newArrangement = [...arrangement, newSlot]
    setArrangement(newArrangement)
    onArrangementChange?.(newArrangement)
  }

  const updateSlot = (index: number, patternIndex: number) => {
    const newArrangement = arrangement.map((slot, i) => (i === index ? { ...slot, patternIndex } : slot))
    setArrangement(newArrangement)
    onArrangementChange?.(newArrangement)
  }

  const removeSlot = (index: number) => {
    const newArrangement = arrangement.filter((_, i) => i !== index).map((slot, i) => ({ ...slot, position: i }))
    setArrangement(newArrangement)
    onArrangementChange?.(newArrangement)
  }

  return (
    <ArrangementContainer>
      <ArrangementHeader>
        <HeaderLabel>Arrangement (Click + to add patterns)</HeaderLabel>
        <AddButton onClick={addSlot}>+ Add Pattern</AddButton>
      </ArrangementHeader>

      {arrangement.length === 0 ? (
        <EmptyState>
          No patterns in arrangement.
          <br />
          Click "+ Add Pattern" to start building your track.
        </EmptyState>
      ) : (
        <ArrangementGrid>
          {arrangement.map((slot, index) => (
            <ArrangementSlotItem key={index}>
              <SlotPosition>{index + 1}</SlotPosition>
              <PatternSelect value={slot.patternIndex} onChange={(e) => updateSlot(index, Number(e.target.value))}>
                {Array.from({ length: 99 }, (_, i) => (
                  <option key={i} value={i}>
                    Pattern {String(i + 1).padStart(2, "0")}
                  </option>
                ))}
              </PatternSelect>
              <RemoveButton onClick={() => removeSlot(index)}>×</RemoveButton>
            </ArrangementSlotItem>
          ))}
        </ArrangementGrid>
      )}
    </ArrangementContainer>
  )
}
