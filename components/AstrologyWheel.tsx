"use client";

import { useState, useRef, useEffect } from "react";

interface AstrologyWheelProps {
  sunSign: string;
  moonSign: string;
  risingSign: string;
  planets?: any;
  onSignClick?: (sign: string) => void;
}

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const HOUSE_NUMBERS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

// Zodiac symbol images from Figma
const ZODIAC_IMAGES: { [key: string]: string } = {
  "Aries": "http://localhost:3845/assets/c0b0debcdad632e643497ec033be3051539e5f1d.png",
  "Taurus": "http://localhost:3845/assets/a88263177568354a300de33fae44af7891ba015b.png",
  "Gemini": "http://localhost:3845/assets/e7381df59de666db7ce67e549ea56c3687f8d52a.png",
  "Cancer": "http://localhost:3845/assets/766f65eb9a29c0c067fa45abc1cf751b8f9cdc9e.png",
  "Leo": "http://localhost:3845/assets/0997d6c5fd312e5e5d9bb66d6d3ae87c2cdd7f6f.png",
  "Virgo": "http://localhost:3845/assets/22b57b95e392a6210492dbf76e32207d01f8c7fc.png",
  "Libra": "http://localhost:3845/assets/df47b7e620fe285432c098ff1135531644898513.png",
  "Scorpio": "http://localhost:3845/assets/b2d7d1d1627e962bca4686689942f0f2ab9f9e71.png",
  "Sagittarius": "http://localhost:3845/assets/2092b31603961024063ca519a81f6c8743d2a438.png",
  "Capricorn": "http://localhost:3845/assets/edd9a1a682b601f919f6b19df4095b0a2bddb787.png",
  "Aquarius": "http://localhost:3845/assets/dfb0546a30bef054a7adff34e55df2bee8602ffb.png",
  "Pisces": "http://localhost:3845/assets/e1890d8c09b025743bc8bf48064d24f823b4f982.png"
};

// Planet symbol images (PNG exports from Figma)
const PLANET_IMAGES: { [key: string]: string } = {
  "Sun": "/planets/Sun.png",
  "Moon": "/planets/Moon.png",
  "Mercury": "/planets/Mercury.png",
  "Venus": "/planets/Venus.png",
  "Mars": "/planets/Mars.png",
  "Jupiter": "/planets/Jupiter.png",
  "Saturn": "/planets/Saturn.png",
  "Uranus": "/planets/Uranus.png",
  "Neptune": "/planets/Neptune.png",
  "Pluto": "/planets/Pluto.png",
  "NorthNode": "/planets/NorthNode.png",
  "SouthNode": "/planets/SouthNode.png",
  "Asc": "/planets/Asc.png"
};

export default function AstrologyWheel({ sunSign, moonSign, risingSign, planets: planetsData, onSignClick }: AstrologyWheelProps) {
  const size = 600;
  const center = size / 2;
  const outerRadius = 280;
  const midRadius = 200;
  const innerRadius = 130;
  const houseRadius = 160;
  const planetRadius = 100;

  // Rotation state
  const [rotation, setRotation] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const wheelContainerRef = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef(false);
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Extract planetary positions from API response
  const planetsList = planetsData?.data?.planet_position || [];
  console.log("AstrologyWheel - planets list:", planetsList);

  // Map planet names to our image keys
  const planetNameMap: { [key: string]: string } = {
    "Sun": "Sun",
    "Moon": "Moon",
    "Mercury": "Mercury",
    "Venus": "Venus",
    "Mars": "Mars",
    "Jupiter": "Jupiter",
    "Saturn": "Saturn",
    "Rahu": "NorthNode",
    "Ketu": "SouthNode",
    "Ascendant": "Asc"
  };

  // Scroll handler to rotate wheel (only when not animating from click)
  useEffect(() => {
    const handleScroll = () => {
      // Don't update rotation from scroll if we're animating from a click
      if (isAnimatingRef.current) return;

      // Rotate based on scroll position
      // Each 100px of scroll = 30 degrees of rotation
      const scrollY = window.scrollY;
      const rotationDegrees = (scrollY / 100) * 30;
      setRotation(rotationDegrees);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Click handler for zodiac signs - directly animate rotation
  const handleZodiacClick = (signIndex: number, signName: string) => {
    console.log(`\n=== CLICKED ${signName} (index ${signIndex}) ===`);
    console.log(`Current rotation: ${rotation}°`);

    // Call the onSignClick callback if provided
    if (onSignClick) {
      onSignClick(signName);
    }

    // Calculate target rotation: sign should be at -90° (top position)
    // Sign is currently at: signIndex * 30 + 15 - 90 (base angle)
    // After rotation, it's at: (signIndex * 30 + 15 - 90) + (targetRotation + 15)
    // We want: (signIndex * 30 + 15 - 90) + (targetRotation + 15) = -90
    // So: targetRotation = -30 - signIndex * 30
    const baseTargetRotation = -30 - signIndex * 30;

    // Find the closest equivalent rotation (accounting for 360° cycles)
    let targetRotation = baseTargetRotation;
    let minDistance = Math.abs(baseTargetRotation - rotation);

    for (let offset = -1080; offset <= 1080; offset += 360) {
      const candidate = baseTargetRotation + offset;
      const distance = Math.abs(candidate - rotation);
      if (distance < minDistance) {
        minDistance = distance;
        targetRotation = candidate;
      }
    }

    console.log(`Target rotation: ${targetRotation}° (base: ${baseTargetRotation}°)`);
    console.log(`Rotation distance: ${Math.abs(targetRotation - rotation)}°`);

    // Animate rotation using requestAnimationFrame
    const startRotation = rotation;
    const rotationDelta = targetRotation - startRotation;
    const duration = 800; // ms
    const startTime = performance.now();

    isAnimatingRef.current = true;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-in-out)
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const newRotation = startRotation + rotationDelta * eased;
      setRotation(newRotation);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete - sync scroll position to match rotation
        isAnimatingRef.current = false;
        const targetScroll = (targetRotation * 100) / 30;
        window.scrollTo({ top: Math.max(0, targetScroll), behavior: 'auto' });
        console.log(`Animation complete. Synced scroll to ${targetScroll}px`);
      }
    };

    // Cancel any existing animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  return (
    <div ref={wheelContainerRef} className="relative w-full max-w-2xl mx-auto">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-auto"
        style={{ pointerEvents: "auto" }}
      >
        {/* Rotating group - everything inside rotates together */}
        <g
          transform={`rotate(${rotation + 15} ${center} ${center})`}
        >
        {/* Outer circle */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="none"
          stroke="#4e5e89"
          strokeWidth="1"
        />

        {/* Mid circle */}
        <circle
          cx={center}
          cy={center}
          r={midRadius}
          fill="none"
          stroke="#4e5e89"
          strokeWidth="1"
        />

        {/* Inner circle */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="none"
          stroke="#4e5e89"
          strokeWidth="1"
        />

        {/* Radial lines for 12 houses */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const x1 = center + innerRadius * Math.cos(angle);
          const y1 = center + innerRadius * Math.sin(angle);
          const x2 = center + outerRadius * Math.cos(angle);
          const y2 = center + outerRadius * Math.sin(angle);

          return (
            <line
              key={`line-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#4e5e89"
              strokeWidth="1"
            />
          );
        })}

        {/* House numbers */}
        {HOUSE_NUMBERS.map((house, i) => {
          const angle = (i * 30 + 15 - 90) * (Math.PI / 180);
          const x = center + houseRadius * Math.cos(angle);
          const y = center + houseRadius * Math.sin(angle);

          return (
            <text
              key={`house-${i}`}
              x={x}
              y={y}
              fill="#D0D1C9"
              fontSize="22.411"
              fontFamily="Romie"
              fontWeight="400"
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${i * 30 + 15}, ${x}, ${y})`}
            >
              {house}
            </text>
          );
        })}

        {/* Zodiac sign images */}
        {ZODIAC_SIGNS.map((sign, i) => {
          const angle = (i * 30 + 15 - 90) * (Math.PI / 180);
          const x = center + (outerRadius + midRadius) / 2 * Math.cos(angle);
          const y = center + (outerRadius + midRadius) / 2 * Math.sin(angle);

          const isHighlighted =
            sign === sunSign ||
            sign === moonSign ||
            sign === risingSign;

          const imageSize = 60;
          const imageUrl = ZODIAC_IMAGES[sign];

          return (
            <g
              key={`sign-${i}`}
              data-zodiac-sign={sign}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleZodiacClick(i, sign);
              }}
              style={{ cursor: "pointer", pointerEvents: "all" }}
            >
              <image
                href={imageUrl}
                x={x - imageSize / 2}
                y={y - imageSize / 2}
                width={imageSize}
                height={imageSize}
                opacity={isHighlighted ? 1 : 0.5}
                style={{
                  filter: isHighlighted ? "brightness(1.2)" : "brightness(0.8)",
                  transition: "opacity 0.3s, filter 0.3s",
                  cursor: "pointer"
                }}
              />
            </g>
          );
        })}

        {/* Planet symbols */}
        {planetsList.map((planet: any, index: number) => {
          const planetName = planetNameMap[planet.name];
          if (!planetName || !PLANET_IMAGES[planetName]) {
            console.log(`Skipping planet: ${planet.name} (mapped to: ${planetName})`);
            return null;
          }

          // Get the planet's longitude position (0-360 degrees)
          const longitude = planet.longitude || 0;

          // Convert longitude to angle (accounting for 15deg rotation and 0 at top)
          // Subtract 90 to start from top, add 15 for the wheel rotation
          const angle = (longitude - 90 + 15) * (Math.PI / 180);

          // Position planet between inner circle and mid radius
          const x = center + planetRadius * Math.cos(angle);
          const y = center + planetRadius * Math.sin(angle);

          const planetSize = 20;

          console.log(`Rendering ${planet.name} at longitude ${longitude}°, position (${x.toFixed(1)}, ${y.toFixed(1)})`);

          return (
            <g key={`planet-${index}`}>
              <image
                href={PLANET_IMAGES[planetName]}
                x={x - planetSize / 2}
                y={y - planetSize / 2}
                width={planetSize}
                height={planetSize}
                preserveAspectRatio="xMidYMid meet"
              />
            </g>
          );
        })}
        </g>
      </svg>
    </div>
  );
}
