// components/SamplerHeader.tsx
import { MPCContext, MPCContextProps } from '@/context/MPCContext';
import styled from '@emotion/styled';
import React, { useContext } from 'react';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 500;
  color: var(--neon-blue);
`;

const TitleAccent = styled.span`
  color: var(--neon-pink);
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BPMContainer = styled.div`
  background-color: #2d2d2d;
  border: 1px solid #444;
  border-radius: 9999px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
`;

const BPMValue = styled.span`
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--neon-blue);
`;

const BPMLabel = styled.span`
  margin-left: 4px;
  color: #ccc;
`;

const PlayButton = styled.button`
  background-color: #2d2d2d;
  border: 1px solid var(--neon-blue);
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background-color: var(--neon-blue);
    color: #111827;
  }
`;

const SamplerHeader: React.FC = () => {
  const context: MPCContextProps = useContext(MPCContext as React.Context<MPCContextProps>);
  if (!context) throw new Error('AppContext is not defined');
  const { bpm, isPlaying, setIsPlaying } = context;

  const handlePlayClick = () => {
		setIsPlaying(!isPlaying);

	}

  return (
    <HeaderContainer>
      <Title>
        NEON<TitleAccent>BEAT</TitleAccent>
      </Title>
      <RightSection>
        <BPMContainer>
          <BPMValue id="bpm-value">{bpm}</BPMValue>
          <BPMLabel>BPM</BPMLabel>
        </BPMContainer>
        <PlayButton id="play-btn" onClick={handlePlayClick}>
          {isPlaying ? <i>pause</i> : <i>play</i>}
        </PlayButton>
      </RightSection>
    </HeaderContainer>
  );
};

export default SamplerHeader;
