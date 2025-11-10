"use client"

import type React from "react"
import { useState, useRef } from "react"
import styled from "styled-components"

interface MPCPadProps {
  id: number
  label: string
  keyBinding: string
  isActive: boolean
  onTrigger: () => void
  onSampleDrop: (file: File) => void
  onEditClick?: (padId: number) => void
  sample?: string
}

const PadButton = styled.button<{ $isActive: boolean; $isDragOver: boolean }>`
  width: 100%;
  aspect-ratio: 1;
  background: ${(props) =>
    props.$isActive
      ? `radial-gradient(circle at 30% 30%, #ff7a7a, #ff5555 40%, #cc3333 70%, #991111)`
      : `radial-gradient(circle at 30% 30%, #787878, #5a5a5a 40%, #3a3a3a 70%, #2a2a2a)`};
  border: ${(props) => (props.$isDragOver ? "3px dashed #4ade80" : "2px solid #1a1a1a")};
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  transition: all 0.05s ease;
  box-shadow: ${(props) =>
    props.$isActive
      ? `
        inset 0 4px 12px rgba(0,0,0,0.8),
        inset 0 -2px 6px rgba(255,100,100,0.3),
        0 1px 3px rgba(255,107,107,0.5)
      `
      : `
        0 6px 12px rgba(0,0,0,0.5),
        0 2px 4px rgba(0,0,0,0.3),
        inset 0 1px 0 rgba(255,255,255,0.1),
        inset 0 -1px 2px rgba(0,0,0,0.3)
      `};

  /* Rubber texture */
  &::before {
    content: "";
    position: absolute;
    inset: 6px;
    border-radius: 4px;
    background-image: 
      repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px),
      repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px);
    background-size: 3px 3px;
    opacity: 0.6;
    pointer-events: none;
  }
  
  /* Wear marks and scratches */
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 6px;
    background-image: 
      linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.03) 45%, transparent 50%),
      radial-gradient(circle at 70% 20%, rgba(0,0,0,0.15) 0%, transparent 30%),
      radial-gradient(circle at 30% 80%, rgba(0,0,0,0.1) 0%, transparent 25%);
    pointer-events: none;
  }

  &:hover {
    background: ${(props) =>
      props.$isActive
        ? `radial-gradient(circle at 30% 30%, #ff9090, #ff6b6b 40%, #dd4444 70%, #aa2222)`
        : `radial-gradient(circle at 30% 30%, #888888, #6a6a6a 40%, #4a4a4a 70%, #3a3a3a)`};
  }

  &:active {
    transform: translateY(2px);
    box-shadow: 
      inset 0 4px 12px rgba(0,0,0,0.9),
      0 1px 2px rgba(0, 0, 0, 0.3);
  }
`

const PadLabel = styled.div`
  position: absolute;
  bottom: 4px;
  left: 5px;
  font-size: 9px;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.9),
    0 0 8px rgba(0, 0, 0, 0.6);
  letter-spacing: 0.5px;
`

const KeyLabel = styled.div`
  position: absolute;
  top: 4px;
  right: 5px;
  font-size: 8px;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.5);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
`

const DropIndicator = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  pointer-events: none;
`

const EditIcon = styled.button<{ $isVisible: boolean }>`
  position: absolute;
  top: 4px;
  right: 4px;
  background: 
    radial-gradient(circle at 30% 30%, #a0c8ed, #7eb3e8 50%, #5a9fd6);
  border: 2px solid #4a8fc4;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: ${(props) => (props.$isVisible ? 1 : 0)};
  transition: opacity 0.2s ease, transform 0.1s ease;
  z-index: 10;
  box-shadow: 
    0 2px 6px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  
  &:hover {
    background: radial-gradient(circle at 30% 30%, #b8d8f8, #90c3f0 50%, #6aa8e0);
    border-color: #5a9fd6;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
    box-shadow: 
      inset 0 2px 4px rgba(0, 0, 0, 0.4),
      0 1px 2px rgba(0, 0, 0, 0.3);
  }

  svg {
    width: 11px;
    height: 11px;
    fill: #ffffff;
    filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3));
  }
`

const HiddenFileInput = styled.input`
  display: none;
`

export const MPCPad: React.FC<MPCPadProps> = ({ id, label, keyBinding, isActive, onTrigger, onSampleDrop, onEditClick, sample }) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const audioFile = files.find((file) => file.type.startsWith("audio/"))

    if (audioFile) {
      onSampleDrop(audioFile)
    }
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEditClick) {
      onEditClick(id)
    } else {
      // Fallback to file picker if no edit handler provided
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("audio/")) {
      onSampleDrop(file)
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }


  return (
    <PadButton
      $isActive={isActive}
      $isDragOver={isDragOver}
      onMouseDown={onTrigger}
      onTouchStart={(e) => {
        e.preventDefault()
        onTrigger()
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <KeyLabel>{keyBinding}</KeyLabel>
      <PadLabel>{label}</PadLabel>
      {isDragOver && <DropIndicator>↓</DropIndicator>}
      <EditIcon
        $isVisible={isHovered && !isDragOver && !isActive}
        onClick={handleEditClick}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <svg viewBox="0 0 24 24">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
        </svg>
      </EditIcon>
      <HiddenFileInput ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileChange} />
    </PadButton>
  )
}
