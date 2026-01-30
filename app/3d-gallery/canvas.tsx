'use client';

import { Canvas } from "@react-three/fiber";
import Gallery from "./gallery";

export default function CanvasComponent() {
    return (
        <Canvas>
            <Gallery />
        </Canvas>
    );
}