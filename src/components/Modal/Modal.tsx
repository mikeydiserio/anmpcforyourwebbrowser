'use client';
import { MPCContext } from '@/context/MPCContext';
import styled from '@emotion/styled';
import React, { useContext, useEffect, useState } from 'react';

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContainer = styled.div`
  background-color: #2d2d2d;
  border: 1px solid var(--neon-blue);
  border-radius: 8px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
`;

const ModalTitle = styled.h3`
  font-size: 1.125rem;
  color: var(--neon-blue);
  margin-bottom: 16px;
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 8px;
  background-color: #2d2d2d;
  border: 1px solid #444;
  border-radius: 4px;
  margin-bottom: 16px;
  color: white;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const ModalButton = styled.button`
  background-color: #2d2d2d;
  border: 1px solid;
  border-radius: 9999px;
  padding: 8px 16px;
  cursor: pointer;
`;

const CancelButton = styled(ModalButton)`
  border-color: var(--neon-blue);
  color: var(--neon-blue);
`;

const LoadButton = styled(ModalButton)`
  border-color: var(--neon-pink);
  color: var(--neon-pink);
`;

const Modal: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const context = useContext(MPCContext);
  if (!context) throw new Error('AppContext is not defined');
  const { activePadIndex, players, setPadSamples, padSamples } = context;

  const handleCancel = () => {
    setVisible(false);
    setSelectedFile(null);
  };

  const handleConfirm = () => {
		const reader = new FileReader();
		reader.onload = function (e) {
			const dataUrl = e?.target?.result;
			// Load sample into Tone.Player
			if (typeof dataUrl === 'string') {
				players[activePadIndex]?.load(dataUrl).then(() => {
					// Update padSamples state so that the file name and dataUrl persist
					const newPadSamples = [...(padSamples || [])];
					newPadSamples[activePadIndex] = {
						fileName: selectedFile?.name || 'failed to get sample name',
						dataUrl: dataUrl,
					};
					setPadSamples(newPadSamples);
					setVisible(false);
				});
			}
		};

		if (selectedFile) {
			reader.readAsDataURL(selectedFile);
		}
	};


  useEffect(() => {
    const openModal = () => setVisible(true);
    window.addEventListener('openSampleModal', openModal);
    return () => window.removeEventListener('openSampleModal', openModal);
  }, []);

  if (!visible) return null;

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalTitle>Load Sample</ModalTitle>
        <ModalInput
          type="file"
          accept="audio/*"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              if (e.target.files && e.target.files[0]) {
                setSelectedFile(e.target.files[0]);
              }
            }
          }}
        />
        <ButtonContainer>
          <CancelButton onClick={handleCancel}>Cancel</CancelButton>
          <LoadButton onClick={handleConfirm}>Load</LoadButton>
        </ButtonContainer>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default Modal;
