import * as THREE from "three";
import { ATLAS_CONFIG } from "../config/constants";

/**
 * Draws a single image onto the atlas canvas with object-cover behavior
 */
function drawImageToAtlas(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  x: number,
  y: number,
  textureSize: number
): void {
  // Save canvas state and clip to cell boundaries to prevent overflow
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, textureSize, textureSize);
  ctx.clip();

  // Get image dimensions
  let imgWidth = textureSize;
  let imgHeight = textureSize;

  if (img instanceof HTMLImageElement) {
    imgWidth = img.naturalWidth || img.width || textureSize;
    imgHeight = img.naturalHeight || img.height || textureSize;
  } else if (img instanceof HTMLVideoElement) {
    imgWidth = img.videoWidth || textureSize;
    imgHeight = img.videoHeight || textureSize;
  } else if (img instanceof HTMLCanvasElement) {
    imgWidth = img.width || textureSize;
    imgHeight = img.height || textureSize;
  }

  // Object-cover behavior: scale image to cover cell while maintaining aspect ratio
  const imgAspect = imgWidth / imgHeight;
  const cellAspect = 1.0; // Cell is square

  let drawWidth = textureSize;
  let drawHeight = textureSize;
  let drawX = x;
  let drawY = y;

  if (imgAspect > cellAspect) {
    // Image is wider - fit to height, crop width
    drawHeight = textureSize;
    drawWidth = textureSize * imgAspect;
    drawX = x - (drawWidth - textureSize) / 2;
  } else {
    // Image is taller - fit to width, crop height
    drawWidth = textureSize;
    drawHeight = textureSize / imgAspect;
    drawY = y - (drawHeight - textureSize) / 2;
  }

  // Draw image with object-cover behavior
  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

  // Restore canvas state
  ctx.restore();
}

/**
 * Extracts a drawable image source from a THREE.Texture
 */
function getImageFromTexture(texture: THREE.Texture): CanvasImageSource | null {
  if (!texture?.image) return null;

  const image = texture.image;

  if (image instanceof HTMLImageElement) {
    if (image.width > 0 && image.height > 0 && image.complete) {
      return image;
    }
    return null;
  }

  return image as CanvasImageSource;
}

/**
 * Creates a texture atlas from an array of THREE.Texture objects
 * @param textures - Array of loaded textures to combine into an atlas
 * @param count - Number of textures (used to calculate grid size)
 * @returns A THREE.CanvasTexture containing all images, or null if creation fails
 */
export function createImageAtlas(
  textures: THREE.Texture[],
  count: number
): THREE.CanvasTexture | null {
  const atlasSize = Math.ceil(Math.sqrt(count));
  const { TEXTURE_SIZE, BACKGROUND_COLOR, PLACEHOLDER_COLOR, ERROR_COLOR } = ATLAS_CONFIG;

  // Create canvas for the atlas
  const canvas = document.createElement("canvas");
  canvas.width = atlasSize * TEXTURE_SIZE;
  canvas.height = atlasSize * TEXTURE_SIZE;
  const ctx = canvas.getContext("2d");

  if (!ctx) return null;

  // Fill with background color
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw each texture to its grid position
  textures.forEach((texture, i) => {
    const col = i % atlasSize;
    const row = Math.floor(i / atlasSize);
    const x = col * TEXTURE_SIZE;
    const y = row * TEXTURE_SIZE;

    const img = getImageFromTexture(texture);

    if (img) {
      try {
        drawImageToAtlas(ctx, img, x, y, TEXTURE_SIZE);
      } catch (e) {
        console.warn(`Failed to draw texture ${i}:`, e);
        ctx.fillStyle = ERROR_COLOR;
        ctx.fillRect(x, y, TEXTURE_SIZE, TEXTURE_SIZE);
      }
    } else {
      console.warn(`Missing image for texture ${i}`);
      ctx.fillStyle = PLACEHOLDER_COLOR;
      ctx.fillRect(x, y, TEXTURE_SIZE, TEXTURE_SIZE);
    }
  });

  // Create and configure the texture
  const atlasTexture = new THREE.CanvasTexture(canvas);
  atlasTexture.needsUpdate = true;
  atlasTexture.flipY = false;
  atlasTexture.generateMipmaps = false;
  atlasTexture.minFilter = THREE.LinearFilter;
  atlasTexture.magFilter = THREE.LinearFilter;
  atlasTexture.wrapS = THREE.ClampToEdgeWrapping;
  atlasTexture.wrapT = THREE.ClampToEdgeWrapping;

  return atlasTexture;
}
