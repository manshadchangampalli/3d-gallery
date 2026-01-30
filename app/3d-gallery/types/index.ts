import * as THREE from "three";

export interface AtlasTextures {
  imageAtlas: THREE.CanvasTexture;
  textAtlas: THREE.CanvasTexture;
}

export type PointerOrTouchEvent = PointerEvent | TouchEvent;

export interface DragStart {
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
}

export interface Skill {
  url: string;
  name: string;
}

export interface DragInteractionState {
  isDraggingState: boolean;
  mousePos: THREE.Vector2;
  scrollOffsetRef: React.MutableRefObject<THREE.Vector2>;
  velocityRef: React.MutableRefObject<THREE.Vector2>;
  isDraggingRef: React.MutableRefObject<boolean>;
  targetZoomRef: React.MutableRefObject<number>;
  currentZoomRef: React.MutableRefObject<number>;
}
