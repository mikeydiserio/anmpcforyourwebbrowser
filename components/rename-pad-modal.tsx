"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import styled from "styled-components"

interface RenamePadModalProps {
  isOpen: boolean
  padId: number | null
  currentName: string
  currentSampleFileName?: string | null
  onClose: () => void
  onSave: (padId: number, newName: string) => void
  onSampleUpload: (padId: number, file: File) => void
}

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: ${(props) => (props.$isOpen ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
`

const ModalContent = styled.div`
  background: 
    linear-gradient(145deg, #2f2f2f, #252525);
  border: 3px solid #1a1a1a;
  border-radius: 8px;
  padding: 24px;
  min-width: 320px;
  max-width: 90vw;
  box-shadow: 
    inset 0 3px 8px rgba(0, 0, 0, 0.6),
    0 8px 24px rgba(0, 0, 0, 0.8),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  position: relative;
  
  @media (max-width: 768px) {
    min-width: 280px;
    padding: 20px;
  }
  
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 6px;
    background: linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 50%, rgba(0,0,0,0.1) 100%);
    pointer-events: none;
  }
`

const ModalTitle = styled.h2`
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  text-align: center;
`

const InputContainer = styled.div`
  margin-bottom: 20px;
`

const InputLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
`

const Input = styled.input`
  width: 100%;
  padding: 12px;
  background: 
    linear-gradient(145deg, #1a1a1a, #0f0f0f);
  border: 2px solid #333;
  border-radius: 4px;
  color: #fff;
  font-size: 14px;
  font-family: inherit;
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.8),
    0 1px 0 rgba(255, 255, 255, 0.05);
  
  &:focus {
    outline: none;
    border-color: #5a9fd6;
    box-shadow: 
      inset 0 2px 4px rgba(0, 0, 0, 0.8),
      0 0 8px rgba(90, 159, 214, 0.3);
  }
  
  &::placeholder {
    color: #555;
  }
  
  &[type="file"] {
    cursor: pointer;
    
    &::file-selector-button {
      padding: 8px 16px;
      background: linear-gradient(145deg, #4a8fc4, #3a7fb4);
      border: 2px solid #5a9fd6;
      border-radius: 4px;
      color: #fff;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      cursor: pointer;
      margin-right: 12px;
      transition: all 0.2s;
      
      &:hover {
        background: linear-gradient(145deg, #5a9fd6, #4a8fc4);
      }
    }
  }
`

const SampleInfo = styled.div`
  padding: 12px;
  background: 
    linear-gradient(145deg, #1a1a1a, #0f0f0f);
  border: 2px solid #333;
  border-radius: 4px;
  color: #888;
  font-size: 12px;
  font-style: italic;
  margin-bottom: 20px;
  word-break: break-all;
`

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`

const Button = styled.button<{ $primary?: boolean }>`
  padding: 10px 20px;
  background: ${(props) =>
    props.$primary
      ? "linear-gradient(145deg, #4a8fc4, #3a7fb4)"
      : "linear-gradient(145deg, #3a3a3a, #2a2a2a)"};
  border: 2px solid ${(props) => (props.$primary ? "#5a9fd6" : "#222")};
  border-radius: 4px;
  color: ${(props) => (props.$primary ? "#fff" : "#aaa")};
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 
    ${(props) =>
      props.$primary
        ? "0 2px 4px rgba(0, 0, 0, 0.4)"
        : "inset 0 2px 4px rgba(0, 0, 0, 0.6)"};
  
  &:hover {
    background: ${(props) =>
      props.$primary
        ? "linear-gradient(145deg, #5a9fd6, #4a8fc4)"
        : "linear-gradient(145deg, #4a4a4a, #3a3a3a)"};
    transform: translateY(-1px);
    box-shadow: 
      ${(props) =>
        props.$primary
          ? "0 4px 8px rgba(0, 0, 0, 0.5)"
          : "0 2px 4px rgba(0, 0, 0, 0.4)"};
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 
      inset 0 2px 4px rgba(0, 0, 0, 0.6),
      0 1px 2px rgba(0, 0, 0, 0.3);
  }
`

export const RenamePadModal: React.FC<RenamePadModalProps> = ({
  isOpen,
  padId,
  currentName,
  currentSampleFileName,
  onClose,
  onSave,
  onSampleUpload,
}) => {
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setInputValue(currentName)
      // Focus input after modal opens
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 100)
    }
  }, [isOpen, currentName])

  const handleSave = () => {
    if (padId !== null && inputValue.trim()) {
      onSave(padId, inputValue.trim())
      onClose()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("audio/") && padId !== null) {
      onSampleUpload(padId, file)
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      onClose()
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <ModalOverlay $isOpen={isOpen} onClick={handleOverlayClick}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>Edit Pad {padId !== null ? padId + 1 : ""}</ModalTitle>
        
        <InputContainer>
          <InputLabel>Current Sample</InputLabel>
          <SampleInfo>
            {currentSampleFileName || "No sample loaded"}
          </SampleInfo>
        </InputContainer>

        <InputContainer>
          <InputLabel>Upload New Sample</InputLabel>
          <Input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
          />
        </InputContainer>

        <InputContainer>
          <InputLabel>Pad Name</InputLabel>
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter pad name..."
            maxLength={16}
          />
        </InputContainer>
        
        <ButtonContainer>
          <Button onClick={onClose}>Close</Button>
          <Button $primary onClick={handleSave} disabled={!inputValue.trim()}>
            Save Name
          </Button>
        </ButtonContainer>
      </ModalContent>
    </ModalOverlay>
  )
}

