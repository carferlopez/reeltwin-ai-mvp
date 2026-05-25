"use client";

import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent
} from "react";
import { ChevronsLeftRight } from "lucide-react";

export function BeforeAfterSlider() {
  const [position, setPosition] = useState(50);
  const comparisonRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef<HTMLInputElement>(null);
  const sliderStyle = {
    "--reveal": `${position}%`
  } as CSSProperties;

  function updatePosition(clientX: number) {
    const bounds = comparisonRef.current?.getBoundingClientRect();
    if (!bounds) return;

    const nextPosition = Math.round(((clientX - bounds.left) / bounds.width) * 100);
    setPosition(Math.min(100, Math.max(0, nextPosition)));
  }

  function beginDrag(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    rangeRef.current?.focus();
    updatePosition(event.clientX);
  }

  function continueDrag(event: PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      updatePosition(event.clientX);
    }
  }

  function useKeyboard(event: KeyboardEvent<HTMLInputElement>) {
    const increment = event.shiftKey ? 10 : 2;
    const moves: Record<string, number> = {
      ArrowLeft: position - increment,
      ArrowDown: position - increment,
      ArrowRight: position + increment,
      ArrowUp: position + increment,
      Home: 0,
      End: 100
    };

    if (event.key in moves) {
      event.preventDefault();
      setPosition(Math.min(100, Math.max(0, moves[event.key])));
    }
  }

  return (
    <div
      className="comparison"
      onPointerDown={beginDrag}
      onPointerMove={continueDrag}
      ref={comparisonRef}
      style={sliderStyle}
    >
      <div
        aria-label="Vídeo original grabado por el intérprete"
        className="comparison-layer comparison-original"
        role="img"
      />
      <div
        aria-label="Resultado cinematográfico generado por ReelTwin"
        className="comparison-layer comparison-result"
        role="img"
      />
      <span className="comparison-label original">Original</span>
      <span className="comparison-label result">ReelTwin</span>
      <span className="comparison-line" aria-hidden="true">
        <ChevronsLeftRight />
      </span>
      <label className="sr-only" htmlFor="transformation-slider">
        Mueve el control para comparar el vídeo original y el resultado ReelTwin
      </label>
      <input
        aria-valuetext={`${100 - position}% resultado ReelTwin visible`}
        className="comparison-input sr-only"
        id="transformation-slider"
        max={100}
        min={0}
        onKeyDown={useKeyboard}
        onChange={(event) => setPosition(Number(event.target.value))}
        ref={rangeRef}
        type="range"
        value={position}
      />
    </div>
  );
}
