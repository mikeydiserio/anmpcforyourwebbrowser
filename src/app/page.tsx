'use client'
import ControlsPanel from '@/components/ControlsPanel';
import Modal from '@/components/Modal';
import PadGrid from '@/components/PadGrid';
import SamplerHeader from '@/components/SamplerHeader/SamplerHeader';
import Sequencer from '@/components/Sequencer';
import { Global, css } from '@emotion/react';
import styled from '@emotion/styled';
import React, { useEffect } from 'react';
import * as Tone from 'tone';
import { MPCContextProvider } from '../context/MPCContext';

const GlobalStyles = css`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

  :root {
    --neon-blue: #ffe0d3;
    --neon-pink: #ec4899;
    --dark-bg: #111827;
    --light-bg: #1f2937;
  }

  body {
    font-family: 'Inter', sans-serif;
    background-color: var(--dark-bg);
    color: white;
    user-select: none;
    margin: 0;
    padding: 0;
  }
`;

const MainContainer = styled.div`
  max-width: 1440px;
  margin: 0 auto;
  padding: 16px;
	background-color: rgba(255, 255, 255, 0.6);
	backdrop-filter: blur(10px);
	border-radius: 16px;
`;

const ContentWrapper = styled.div`
  display: flex;
  gap: 16px;
  flex-direction: row;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const LeftPane = styled.div`
  flex: 2;
`;

const RightPane = styled.div`
  flex: 1;
`;

const Home: React.FC = () => {
  useEffect(() => {
    // Tone.js must be started on user interaction in some browsers
    Tone.start();
  }, []);

  return (
    <MPCContextProvider>
      <Global styles={GlobalStyles} />
      <MainContainer>
        <SamplerHeader />
        <ContentWrapper>
          <LeftPane>
            <PadGrid />
            <Sequencer />
          </LeftPane>
          <RightPane>
            <ControlsPanel />
          </RightPane>
        </ContentWrapper>
        <Modal />
      </MainContainer>
    </MPCContextProvider>
  );
};

export default Home;
