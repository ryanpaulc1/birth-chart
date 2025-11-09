"use client";

import { useState, useRef, useEffect } from "react";

interface AstrologyWheelProps {
  sunSign: string;
  moonSign: string;
  risingSign: string;
  planets?: any;
  onSignClick?: (sign: string) => void;
  drawerOpen?: boolean;
}

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const HOUSE_NUMBERS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

// Zodiac symbol images
const ZODIAC_IMAGES: { [key: string]: string } = {
  "Aries": "/zodiac/Aries.png",
  "Taurus": "/zodiac/Taurus.png",
  "Gemini": "/zodiac/Gemini.png",
  "Cancer": "/zodiac/Cancer.png",
  "Leo": "/zodiac/Leo.png",
  "Virgo": "/zodiac/Virgo.png",
  "Libra": "/zodiac/Libra.png",
  "Scorpio": "/zodiac/Scorpio.png",
  "Sagittarius": "/zodiac/Sagittarius.png",
  "Capricorn": "/zodiac/Capricorn.png",
  "Aquarius": "/zodiac/Aquarius.png",
  "Pisces": "/zodiac/Pisces.png"
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

export default function AstrologyWheel({ sunSign, moonSign, risingSign, planets: planetsData, onSignClick, drawerOpen }: AstrologyWheelProps) {
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
  const touchStartY = useRef<number | null>(null);
  const lastTouchY = useRef<number | null>(null);
  const accumulatedRotation = useRef(0);
  const isMobileRef = useRef(false);
  const touchAnimationFrame = useRef<number | undefined>(undefined);
  const velocityTracker = useRef<Array<{ time: number; y: number }>>([]);
  const momentumAnimationFrame = useRef<number | undefined>(undefined);
  const velocity = useRef(0);

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

  // Detect mobile device
  useEffect(() => {
    isMobileRef.current = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobileRef.current) {
      // Initialize accumulated rotation on mobile
      accumulatedRotation.current = 0;
    }
  }, []);

  // Scroll handler to rotate wheel (only when not animating from click, desktop only)
  useEffect(() => {
    const handleScroll = () => {
      // Don't update rotation from scroll if we're animating from a click or on mobile
      if (isAnimatingRef.current || isMobileRef.current) return;

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

  // Touch handlers for mobile
  useEffect(() => {
    if (!isMobileRef.current) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Don't handle touches when drawer is open on mobile
      if (isAnimatingRef.current || drawerOpen) return;

      // Stop any ongoing momentum animation
      if (momentumAnimationFrame.current !== undefined) {
        cancelAnimationFrame(momentumAnimationFrame.current);
        momentumAnimationFrame.current = undefined;
      }

      touchStartY.current = e.touches[0].clientY;
      lastTouchY.current = e.touches[0].clientY;
      velocityTracker.current = [{ time: Date.now(), y: e.touches[0].clientY }];
      velocity.current = 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Don't handle touches when drawer is open on mobile
      if (isAnimatingRef.current || drawerOpen || touchStartY.current === null || lastTouchY.current === null) return;

      // Prevent pull-to-refresh and other default behaviors
      e.preventDefault();

      const currentY = e.touches[0].clientY;
      const currentTime = Date.now();
      const deltaY = lastTouchY.current - currentY; // Inverted: swipe down = negative, swipe up = positive

      // Track velocity - keep last 5 positions for smoothing
      velocityTracker.current.push({ time: currentTime, y: currentY });
      if (velocityTracker.current.length > 5) {
        velocityTracker.current.shift();
      }

      // Each 100px of touch movement = 30 degrees of rotation
      const rotationDelta = (deltaY / 100) * 30;
      accumulatedRotation.current += rotationDelta;

      lastTouchY.current = currentY;

      // Use requestAnimationFrame for smooth updates
      if (touchAnimationFrame.current === undefined) {
        touchAnimationFrame.current = requestAnimationFrame(() => {
          setRotation(accumulatedRotation.current);
          touchAnimationFrame.current = undefined;
        });
      }
    };

    const handleTouchEnd = () => {
      touchStartY.current = null;
      lastTouchY.current = null;

      // Cancel any pending animation frame
      if (touchAnimationFrame.current !== undefined) {
        cancelAnimationFrame(touchAnimationFrame.current);
        touchAnimationFrame.current = undefined;
      }

      // Calculate velocity from recent touch movements
      if (velocityTracker.current.length >= 2) {
        const first = velocityTracker.current[0];
        const last = velocityTracker.current[velocityTracker.current.length - 1];
        const timeDiff = last.time - first.time;
        const yDiff = first.y - last.y; // Inverted for correct direction

        if (timeDiff > 0) {
          // Calculate velocity in degrees per millisecond
          const pixelsPerMs = yDiff / timeDiff;
          velocity.current = (pixelsPerMs / 100) * 30; // Convert to degrees per ms

          // Only apply momentum if velocity is significant
          if (Math.abs(velocity.current) > 0.01) {
            startMomentumAnimation();
          }
        }
      }

      velocityTracker.current = [];
    };

    const startMomentumAnimation = () => {
      const deceleration = 0.95; // Friction factor (0-1, lower = more friction)
      const minVelocity = 0.01; // Stop when velocity is very low

      const animate = () => {
        // Apply deceleration
        velocity.current *= deceleration;

        // Update rotation
        accumulatedRotation.current += velocity.current * 16; // Approximate ms per frame
        setRotation(accumulatedRotation.current);

        // Continue animation if velocity is still significant
        if (Math.abs(velocity.current) > minVelocity) {
          momentumAnimationFrame.current = requestAnimationFrame(animate);
        } else {
          momentumAnimationFrame.current = undefined;
        }
      };

      momentumAnimationFrame.current = requestAnimationFrame(animate);
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      if (touchAnimationFrame.current !== undefined) {
        cancelAnimationFrame(touchAnimationFrame.current);
      }
      if (momentumAnimationFrame.current !== undefined) {
        cancelAnimationFrame(momentumAnimationFrame.current);
      }
    };
  }, [drawerOpen]);

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
        // Animation complete
        isAnimatingRef.current = false;

        if (isMobileRef.current) {
          // On mobile: update accumulated rotation to match target
          accumulatedRotation.current = targetRotation;
          console.log(`Animation complete. Updated accumulated rotation to ${targetRotation}°`);
        } else {
          // On desktop: sync scroll position to match rotation
          const targetScroll = (targetRotation * 100) / 30;
          window.scrollTo({ top: Math.max(0, targetScroll), behavior: 'auto' });
          console.log(`Animation complete. Synced scroll to ${targetScroll}px`);
        }
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
