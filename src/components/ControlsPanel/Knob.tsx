// components/Knob.tsx
import styled from '@emotion/styled';
import React, { useEffect, useRef, useState } from 'react';

const KnobContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

interface KnobCircleProps {
  rotation: number;
}

const KnobCircle = styled.div<KnobCircleProps>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  position: relative;
  cursor: pointer;
  background: conic-gradient(
    from 0deg,
    var(--neon-blue) 0%,
    #8b5cf6 50%,
    var(--neon-pink) 100%
  );
  transform: rotate(${(props) => props.rotation}deg);
`;

const KnobLabel = styled.span`
  font-size: 0.75rem;
  color: var(--neon-blue);
  margin-top: 4px;
`;

interface KnobProps {
  knobId: string;
  label: string;
}

const Knob: React.FC<KnobProps> = ({ knobId, label }) => {
  const [rotation, setRotation] = useState<number>(45);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const startYRef = useRef<number>(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    startYRef.current = e.clientY;
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const deltaY = startYRef.current - e.clientY;
      let newRotation = rotation + deltaY;
      newRotation = Math.min(Math.max(newRotation, 0), 180);
      setRotation(newRotation);
      startYRef.current = e.clientY;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, rotation]);

  return (
    <KnobContainer>
      <KnobCircle rotation={rotation} onMouseDown={handleMouseDown} />
      <KnobLabel>{label}</KnobLabel>
    </KnobContainer>
  );
};

export default Knob;
