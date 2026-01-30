import { useEffect, useState } from "react";
import * as THREE from "three";

/**
 * Hook to check if all textures in an array have fully loaded their images
 * @param textures - Array of THREE.Texture objects to check
 * @returns boolean indicating if all images are loaded and ready
 */
export function useImagesLoaded(textures: THREE.Texture[]): boolean {
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    if (!textures || textures.length === 0) return;

    const checkLoaded = () => {
      const allLoaded = textures.every((texture) => {
        if (!texture?.image) return false;

        const img = texture.image;

        if (img instanceof HTMLImageElement) {
          return img.complete && img.width > 0 && img.height > 0;
        }

        return true;
      });

      setImagesLoaded(allLoaded);
    };

    // Check immediately
    checkLoaded();

    // Also check after a short delay in case images are still loading
    const timeout = setTimeout(checkLoaded, 100);

    return () => clearTimeout(timeout);
  }, [textures]);

  return imagesLoaded;
}
