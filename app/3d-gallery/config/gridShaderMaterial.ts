import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import * as THREE from "three";
import { vertexShader } from "./shader.vertex.glsl";
import { fragmentShader } from "./shader.fragment.glsl";

export const GridShaderMaterial = shaderMaterial(
  {
    uOffset: new THREE.Vector2(0, 0),
    uResolution: new THREE.Vector2(1, 1),
    uBorderColor: new THREE.Color(0.08, 0.08, 0.08),
    uHoverColor: new THREE.Color(0.25, 0.25, 0.3),
    uBackgroundColor: new THREE.Color(0.03, 0.03, 0.03),
    uMousePos: new THREE.Vector2(-1, -1),
    uZoom: 1.0,
    uCellSize: 0.8, // Match this with the value in Gallery.tsx
    uTextureCount: 20,
    uImageAtlas: null,
    uTextAtlas: null,
    uIsLoading: 1.0,
    uTime: 0.0,
  },
  vertexShader,
  fragmentShader
);

extend({ GridShaderMaterial });
