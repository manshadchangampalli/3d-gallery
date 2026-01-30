import * as THREE from "three";
import { ATLAS_CONFIG, TEXT_CONFIG } from "../config/constants";
import type { Skill } from "../types";

/**
 * Draws text for a single skill onto the atlas canvas
 */
function drawTextToAtlas(
  ctx: CanvasRenderingContext2D,
  skill: Skill,
  x: number,
  y: number,
  textureSize: number
): void {
  const { TEXT_AREA_HEIGHT_RATIO, FONT_SIZE_RATIO, MAX_FONT_SIZE } = ATLAS_CONFIG;
  const { FONT_FAMILY, TEXT_COLOR, SHADOW_COLOR, SHADOW_BLUR, SHADOW_OFFSET_X, SHADOW_OFFSET_Y } = TEXT_CONFIG;

  // Calculate text area dimensions
  const textAreaHeight = textureSize * TEXT_AREA_HEIGHT_RATIO;
  const textAreaY = y + textureSize - textAreaHeight;

  // Configure text rendering
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Calculate font size
  const fontSize = Math.min(textAreaHeight * FONT_SIZE_RATIO, MAX_FONT_SIZE);
  ctx.font = `bold ${fontSize}px ${FONT_FAMILY}`;

  // Configure text style with shadow for visibility
  ctx.fillStyle = TEXT_COLOR;
  ctx.shadowColor = SHADOW_COLOR;
  ctx.shadowBlur = SHADOW_BLUR;
  ctx.shadowOffsetX = SHADOW_OFFSET_X;
  ctx.shadowOffsetY = SHADOW_OFFSET_Y;

  // Draw text centered in the text area
  const textCenterX = x + textureSize / 2;
  const textCenterY = textAreaY + textAreaHeight / 2;
  ctx.fillText(skill.name, textCenterX, textCenterY);

  // Reset shadow
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

/**
 * Creates a text atlas from an array of skills
 * The text atlas has a transparent background with white text and shadows
 * @param skills - Array of skills with names to render
 * @returns A THREE.CanvasTexture containing all text labels, or null if creation fails
 */
export function createTextAtlas(skills: Skill[]): THREE.CanvasTexture | null {
  const atlasSize = Math.ceil(Math.sqrt(skills.length));
  const { TEXTURE_SIZE } = ATLAS_CONFIG;

  // Create canvas for the text atlas
  const canvas = document.createElement("canvas");
  canvas.width = atlasSize * TEXTURE_SIZE;
  canvas.height = atlasSize * TEXTURE_SIZE;
  const ctx = canvas.getContext("2d");

  if (!ctx) return null;

  // Keep transparent background - don't fill with any color

  // Draw text for each skill
  skills.forEach((skill, i) => {
    const col = i % atlasSize;
    const row = Math.floor(i / atlasSize);
    const x = col * TEXTURE_SIZE;
    const y = row * TEXTURE_SIZE;

    drawTextToAtlas(ctx, skill, x, y, TEXTURE_SIZE);
  });

  // Create and configure the texture
  const textAtlasTexture = new THREE.CanvasTexture(canvas);
  textAtlasTexture.needsUpdate = true;
  textAtlasTexture.flipY = false;
  textAtlasTexture.generateMipmaps = false;
  textAtlasTexture.minFilter = THREE.LinearFilter;
  textAtlasTexture.magFilter = THREE.LinearFilter;
  textAtlasTexture.wrapS = THREE.ClampToEdgeWrapping;
  textAtlasTexture.wrapT = THREE.ClampToEdgeWrapping;

  return textAtlasTexture;
}
