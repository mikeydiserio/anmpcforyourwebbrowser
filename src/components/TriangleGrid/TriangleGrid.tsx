/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import React from 'react';

// Global styles (body styling)




// Grid container for our shapes
const Container = styled.div`
  display: grid;
	width: 100vw;
	height: 100vh;
  grid-template-columns: repeat(10, 400px);
  grid-template-rows: repeat(6, 460px);
  position: absolute;
	top: 0;
	left: 0;
  z-index: -2;
`;

// Styled SVG shape (each grid cell)
interface ShapeProps {
  transformOffset: string;
}

const Shape = styled.svg<ShapeProps>`
  width: 400px;
  height: 460px;
  /* Create hexagon mask */
  clip-path: polygon(
    50% 0%,
    100% 25%,
    100% 75%,
    50% 100%,
    0% 75%,
    0% 25%
  );
  transform: ${(props) => props.transformOffset};
`;

// A Triangle component renders a polygon with an inner animate element.
const Triangle: React.FC<{ begin: number; color: string }> = ({
  begin,
  color,
}) => (
  <polygon points="" fill="none" stroke={color} strokeWidth="5">
    <animate
      attributeName="points"
      repeatCount="indefinite"
      dur="4s"
      begin={`${begin}s`}
      from="50 57.5, 50 57.5, 50 57.5"
      to="50 -75, 175 126, -75 126"
    />
  </polygon>
);

// Compute the transform offset based on index (mimics your Sass loop)
const getTransformOffset = (index: number): string => {
  if (index > 50) {
    return "translate(-50%, -125%)";
  } else if (index > 40) {
    return "translate(0%, -100%)";
  } else if (index > 30) {
    return "translate(-50%, -75%)";
  } else if (index > 20) {
    return "translate(0%, -50%)";
  } else if (index > 10) {
    return "translate(-50%, -25%)";
  }
  return "none";
}

const TriangleGrid: React.FC = () => {
  const totalCells = 10 * 6; // 60 cells

  // Create an array of cells (1-indexed to match the Sass logic)
  const shapes = Array.from({ length: totalCells }, (_, i) => {
    const index = i + 1;
    return (
      <Shape
        key={index}
        viewBox="0 0 100 115"
        preserveAspectRatio="xMidYMin slice"
        transformOffset={getTransformOffset(index)}
      >
        <Triangle begin={0} color="hsl(320,100%,70%)" />
        <Triangle begin={1} color="hsl(240,100%,70%)" />
        <Triangle begin={2} color="hsl(160,100%,70%)" />
        <Triangle begin={3} color="hsl(80,100%,70%)" />
      </Shape>
    );
  });

  return (
     <Container>{shapes}</Container>
  );
};

export default TriangleGrid;
