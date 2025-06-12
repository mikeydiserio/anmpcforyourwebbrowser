import { css } from '@emotion/css'
import styled from '@emotion/styled'

export const Turntable = styled.div`
			position: relative;
      width: 300px;
      height: 180px;
      background: #f0f0f0;
      box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5);
`

export const Record = styled.div`
		position: absolute;
		top: 15px;
		left: 15px;
		right: 15px;
		bottom: 15px;
		border-radius: 50%;
		width: 100px;
		height: 100px;
		background: radial-gradient(circle, #000 20%, #555 80%);
		animation: spin 5s linear infinite;

		&:before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #222;
      box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
		}
`

export const Tonearm = styled.div`
			position: absolute;
      width: 150px;
      height: 10px;
      background: #999;
      top: 50px;
      right: -70px;
      transform-origin: left center;
      transform: rotate(30deg);
      border-radius: 5px;
	`

	export const spin = css`
		@keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
	`

export const rotate = css`
  .speed025 {
    animation: spin 15s linear infinite;
  }
  .speed05 {
    animation: spin 9s linear infinite;
  }
  .speed075 {
    animation: spin 5s linear infinite;
  }
  .speed1 {
    animation: spin 4s linear infinite;
  }
  .speed125 {
    animation: spin 4.5s linear infinite;
  }
  .speed150 {
    animation: spin 3s linear infinite;
  }
  .speed175 {
    animation: spin 3.5s linear infinite;
  }
  .speed2 {
    animation: spin 2s linear infinite;
  }

  @keyframes rotate {
    from {
      transform: rotate(360deg);
    }
    to {
      transform: rotate(0deg);
    }
  }

  @keyframes spin {
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }

  @keyframes nospin {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
  }

  @keyframes flickerAnimation {
    0% {
      top: 0;
      opacity: 1;
    }
    100% {
      top: 24px;
      opacity: 0;
    }
  }

  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
`

export const BreakContainer = styled.div`
  position: relative;
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  text-align: left;
  max-height: 880px;
`
export const PlayerPanel = styled.div<{ active?: boolean }>`
  width: 100%;
  /* height: ${active => (active ? `420px` : `0`)}; */
  padding: 12px;
  margin: 24px;
  display: grid;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
`

export const InfoPanel = styled.div`
  font-size: 0.85rem;
  width: 320px;
`

export const RecordPlayer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  position: relative;
  display: block;
  width: 320px;
  height: 320px;
`

export const AlbumArtAnimated = styled.img<{ isPlaying?: boolean }>`
  display: flex;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  z-index: 1;
  border-radius: 50%;
  padding: 12px;
  object-fit: contain;
  animation: ${isPlaying =>
    isPlaying
      ? `spin 2s linear infinite; transition: all 0.2s ease-in-out;`
      : `nospin 2s linear infinite; transition: all 0.2s ease-in-out`};
`

export const AlbumArt = styled.img<{ isPlaying?: boolean }>`
  display: flex;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  z-index: 1;
  border-radius: 50%;
  padding: 12px;
  object-fit: contain;
`

export const PlayerControls = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  position: relative;
  display: block;
`

export const ArrowContainer = styled.a`
  position: relative;
  width: 100%;
  height: 84px;
  margin: 0 auto;

  &:hover {
    cursor: pointer;
  }
`

export const Arrow = styled.div`
  position: relative;
  width: 60px;
  height: 60px;
  animation: flickerAnimation infinite 2s;
  transform: rotate(90deg);
  z-index: 1000;
`
