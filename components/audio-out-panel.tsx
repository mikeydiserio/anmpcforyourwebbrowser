"use client"

import styled from "styled-components"
import { VUMeter } from "./vu-meter"
import type * as Tone from "tone"

const Panel = styled.div`
  background: #2a2a2a;
  padding: 16px;
  border-radius: 8px;
  border: 2px solid #444;
  margin-top: 20px;
`

const PanelTitle = styled.h2`
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 1px;
`

const MetersLayout = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`

const MetersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  flex: 1;
`

const MasterMeter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding-left: 20px;
  border-left: 2px solid #555;
`

const MasterMeterBar = styled.div`
  width: 16px;
  height: 120px;
  background: #1a1a1a;
  border: 2px solid #666;
  border-radius: 3px;
  position: relative;
  overflow: hidden;
`

const MasterMeterFill = styled.div<{ level: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${(props) => props.level}%;
  background: ${(props) => {
    if (props.level > 85) return "#ff3333"
    if (props.level > 70) return "#ffaa33"
    return "#33ff66"
  }};
  transition: height 0.05s ease-out;
`

const MasterLabel = styled.div`
  font-size: 12px;
  font-weight: bold;
  color: #ddd;
  text-transform: uppercase;
`

interface AudioOutPanelProps {
  padLabels: string[]
  getPlayer: (padId: number) => Tone.Player | undefined
  getEnvelope?: (padId: number) => Tone.AmplitudeEnvelope | undefined
  getMeterBus?: (padId: number) => Tone.Volume | undefined
}

export function AudioOutPanel({ padLabels, getPlayer, getEnvelope, getMeterBus }: AudioOutPanelProps) {
  return (
    <Panel>
      <PanelTitle>Audio Out</PanelTitle>
      <MetersLayout>
        <MetersGrid>
          {padLabels.map((label, idx) => (
            <VUMeter 
              key={idx} 
              label={label} 
              player={getPlayer(idx)} 
              envelope={getEnvelope ? getEnvelope(idx) : undefined}
              meterBus={getMeterBus ? getMeterBus(idx) : undefined}
            />
          ))}
        </MetersGrid>
        <MasterMeter>
          <MasterMeterBar>
            <MasterMeterFill level={0} />
          </MasterMeterBar>
          <MasterLabel>Master</MasterLabel>
        </MasterMeter>
      </MetersLayout>
    </Panel>
  )
}
