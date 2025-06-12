"use client";
import IconChevron from '@/icons/IconChevron';
import { useWavesurfer } from '@wavesurfer/react';
import { useMemo, useRef } from "react";
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';
import Timeline from 'wavesurfer.js/dist/plugins/timeline.esm.js';
import { useSampleContext } from "../../context/SampleContext";
import Waveform from "../Waveform/Waveform";
import * as S from './SampleDetail.styles';


export const wavesurferConfig = {
  autoCenter: true,
  minPxPerSec: 100,
  fillParent: true,
  hideScrollbar: true,
  normalize: true,
  interact: true,
  dragToSeek: false,
  audioRate: 1,
  width: 420,
  height: 120,
  waveColor: 'rgb(200, 0, 200)',
  progressColor: '#fa8072',
  cursorColor: '#ddd5e9',
  cursorWidth: 1.5,
}

export const SampleDetail = () => {
	const { selectedSample } = useSampleContext();
	if(!selectedSample) return null

			const containerRef = useRef(null as unknown as HTMLDivElement)
			const { wavesurfer, isPlaying, currentTime } = useWavesurfer({
				...wavesurferConfig,
				container: containerRef,
				url: selectedSample?.sample,
				plugins: useMemo(() => [Timeline.create(), RegionsPlugin.create()], []),
			})

			const onPlayPause = () => {
				wavesurfer && wavesurfer.playPause()
			}
    return (
      <S.PlayerPanel>
        <div className="metadata">
          <p>Year: {selectedSample.year}</p>
          <p>Drummer: {selectedSample.drummer}</p>
          <p>Description: {selectedSample.description}</p>
        </div>



        <S.ArrowContainer href="#collection">
          <span>more breaks</span>
          <S.Arrow>
            <IconChevron className={'arrow'} />
          </S.Arrow>
        </S.ArrowContainer>
      <S.PlayerControls>
        <Waveform
          containerRef={containerRef}
          isPlaying={isPlaying}
          currenTime={currentTime}
          wavesurfer={wavesurfer || undefined}
          src={selectedSample?.sample}
          onPlayPause={() => onPlayPause()}
        />
      </S.PlayerControls>
      </S.PlayerPanel>
    );
}

export default SampleDetail
