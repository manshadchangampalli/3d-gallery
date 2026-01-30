import "@react-three/fiber";
import { ReactThreeFiber } from "@react-three/fiber";
import * as THREE from "three";

declare module "@react-three/fiber" {
  interface ThreeElements {
    gridShaderMaterial: ReactThreeFiber.Object3DNode<THREE.ShaderMaterial, typeof THREE.ShaderMaterial>;
  }
}
