import { useMemo } from "react";
import * as THREE from "three";
import { createImageAtlas } from "../utils/createImageAtlas";
import { createTextAtlas } from "../utils/createTextAtlas";
import type { AtlasTextures, Skill } from "../types";

/**
 * Hook to create image and text atlases from loaded textures
 * @param textures - Array of loaded THREE.Texture objects
 * @param skills - Array of skill data with names for text labels
 * @param imagesLoaded - Boolean indicating if all images are loaded
 * @returns AtlasTextures object with imageAtlas and textAtlas, or null if not ready
 */
export function useAtlas(
  textures: THREE.Texture[],
  skills: Skill[],
  imagesLoaded: boolean
): AtlasTextures | null {
  return useMemo(() => {
    // Only create atlas when images are actually loaded
    if (!imagesLoaded || !textures || textures.length === 0 || textures.length !== skills.length) {
      return null;
    }

    const imageAtlas = createImageAtlas(textures, skills.length);
    const textAtlas = createTextAtlas(skills);

    if (!imageAtlas || !textAtlas) {
      return null;
    }

    console.log(`Atlas created successfully with ${skills.length} images`);

    return { imageAtlas, textAtlas };
  }, [textures, skills, imagesLoaded]);
}
