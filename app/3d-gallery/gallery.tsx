"use client";

import { useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { ChromaticAberration, EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { BlendFunction } from "postprocessing";

// Config
import { SKILLS } from "./config/images";
import { DRAG_CONFIG, GALLERY_CONFIG } from "./config/constants";
import "./config/gridShaderMaterial";

// Hooks
import { useImagesLoaded } from "./hooks/useImagesLoaded";
import { useAtlas } from "./hooks/useAtlas";
import { useDragInteraction } from "./hooks/useDragInteraction";

/**
 * Main 3D Gallery component
 * Displays a scrollable grid of skill images with text labels
 */
const Gallery = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    const { viewport, size, gl } = useThree();

    // Load all skill textures
    const textures = useTexture(SKILLS.map((skill) => skill.url));

    // Check if images are loaded
    const imagesLoaded = useImagesLoaded(textures);

    // Create atlases from loaded textures
    const atlas = useAtlas(textures, SKILLS, imagesLoaded);

    // Handle drag/scroll interactions
    const {
        isDraggingState,
        mousePos,
        scrollOffsetRef,
        velocityRef,
        isDraggingRef,
        targetZoomRef,
        currentZoomRef,
    } = useDragInteraction(gl.domElement);

    // Animation loop - update shader uniforms every frame
    useFrame((state) => {
        if (!meshRef.current) return;

        // Apply inertial scrolling when not dragging
        if (!isDraggingRef.current) {
            scrollOffsetRef.current.x += velocityRef.current.x;
            scrollOffsetRef.current.y += velocityRef.current.y;
            velocityRef.current.multiplyScalar(DRAG_CONFIG.VELOCITY_DAMPING);
        }

        // Smoothly interpolate zoom
        currentZoomRef.current += (targetZoomRef.current - currentZoomRef.current) * DRAG_CONFIG.ZOOM_LERP_SPEED;

        // Update shader uniforms
        const material = meshRef.current.material;
        if (material && "uniforms" in material) {
            const shaderMaterial = material as THREE.ShaderMaterial;
            const uniforms = shaderMaterial.uniforms;

            // World offset for tiling
            uniforms.uOffset.value.copy(scrollOffsetRef.current);
            // Screen resolution
            uniforms.uResolution.value.set(size.width, size.height);
            // Pointer position in pixels
            uniforms.uMousePos.value.copy(mousePos);
            // Number of textures in atlas
            uniforms.uTextureCount.value = SKILLS.length;
            // Current zoom level
            uniforms.uZoom.value = currentZoomRef.current;
            // Size of each gallery cell
            uniforms.uCellSize.value = GALLERY_CONFIG.CELL_SIZE;
            // Loading state
            uniforms.uIsLoading.value = !atlas || !imagesLoaded ? 1.0 : 0.0;
            // Time for animations
            uniforms.uTime.value = state.clock.elapsedTime;
            // Atlas textures
            uniforms.uImageAtlas.value = atlas?.imageAtlas ?? null;
            uniforms.uTextAtlas.value = atlas?.textAtlas ?? null;
        }
    });

    return (
        <>
            <mesh ref={meshRef}>
                <planeGeometry args={[viewport.width, viewport.height]} />
                <gridShaderMaterial />
            </mesh>

            <EffectComposer>
                <Vignette
                    blendFunction={BlendFunction.OVERLAY}
                    offset={isDraggingState ? 0.4 : 0.8}
                    darkness={isDraggingState ? 0.8 : 0.4}
                />
                <ChromaticAberration
                    blendFunction={BlendFunction.NORMAL}
                    offset={isDraggingState ? [0.005, 0.001] : [0, 0]}
                />
            </EffectComposer>
        </>
    );
};

export default Gallery;
