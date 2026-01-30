import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { DRAG_CONFIG } from "../config/constants";
import type { DragStart, PointerOrTouchEvent, DragInteractionState } from "../types";

/**
 * Extracts client coordinates from pointer or touch events
 */
function getClientCoordinates(e: PointerOrTouchEvent): { x: number; y: number } {
  if ("touches" in e && e.touches.length > 0) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  if ("clientX" in e) {
    return { x: e.clientX, y: e.clientY };
  }
  return { x: 0, y: 0 };
}

/**
 * Hook to handle drag, scroll, and zoom interactions on a canvas element
 * @param canvas - The HTML canvas element to attach event listeners to
 * @returns Object containing all interaction state and refs
 */
export function useDragInteraction(canvas: HTMLCanvasElement | null): DragInteractionState {
  const [isDraggingState, setIsDraggingState] = useState(false);
  const [mousePos, setMousePos] = useState(new THREE.Vector2(-1, -1));

  const scrollOffset = useRef(new THREE.Vector2(0, 0));
  const velocity = useRef(new THREE.Vector2(0, 0));
  const isDragging = useRef(false);
  const dragStart = useRef<DragStart>({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
  const targetZoom = useRef(DRAG_CONFIG.ZOOM_NORMAL);
  const currentZoom = useRef(DRAG_CONFIG.ZOOM_NORMAL);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePos(new THREE.Vector2(e.clientX, e.clientY));
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePos(new THREE.Vector2(-1, -1));
  }, []);

  const handlePointerDown = useCallback(
    (e: PointerOrTouchEvent) => {
      e.preventDefault();
      isDragging.current = true;
      targetZoom.current = DRAG_CONFIG.ZOOM_DRAGGING;

      if (canvas) {
        canvas.style.cursor = "grabbing";
      }

      setIsDraggingState(true);

      const { x: clientX, y: clientY } = getClientCoordinates(e);

      dragStart.current = {
        x: clientX,
        y: clientY,
        offsetX: scrollOffset.current.x,
        offsetY: scrollOffset.current.y,
      };
    },
    [canvas]
  );

  const handlePointerMove = useCallback(
    (e: PointerOrTouchEvent) => {
      if (!isDragging.current) {
        if (canvas) {
          canvas.style.cursor = "grab";
        }
        return;
      }

      const { x: clientX, y: clientY } = getClientCoordinates(e);

      const dx = (clientX - dragStart.current.x) * DRAG_CONFIG.SENSITIVITY;
      const dy = (clientY - dragStart.current.y) * DRAG_CONFIG.SENSITIVITY;

      scrollOffset.current.x = dragStart.current.offsetX - dx;
      scrollOffset.current.y = dragStart.current.offsetY + dy;
    },
    [canvas]
  );

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
    targetZoom.current = DRAG_CONFIG.ZOOM_NORMAL;

    if (canvas) {
      canvas.style.cursor = "grab";
    }

    setIsDraggingState(false);
  }, [canvas]);

  useEffect(() => {
    if (!canvas) return;

    canvas.style.cursor = "grab";

    // Mouse events
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    // Pointer events
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointerleave", handlePointerUp);

    // Touch events
    canvas.addEventListener("touchstart", handlePointerDown);
    canvas.addEventListener("touchmove", handlePointerMove);
    canvas.addEventListener("touchend", handlePointerUp);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointerleave", handlePointerUp);
      canvas.removeEventListener("touchstart", handlePointerDown);
      canvas.removeEventListener("touchmove", handlePointerMove);
      canvas.removeEventListener("touchend", handlePointerUp);
    };
  }, [canvas, handleMouseMove, handleMouseLeave, handlePointerDown, handlePointerMove, handlePointerUp]);

  return {
    isDraggingState,
    mousePos,
    scrollOffsetRef: scrollOffset,
    velocityRef: velocity,
    isDraggingRef: isDragging,
    targetZoomRef: targetZoom,
    currentZoomRef: currentZoom,
  };
}
