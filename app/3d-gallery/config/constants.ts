/**
 * Configuration constants for the 3D gallery atlas generation
 */
export const ATLAS_CONFIG = {
  /** Size of each texture cell in the atlas (pixels) */
  TEXTURE_SIZE: 512,
  /** Ratio of cell height used for text area (0-1) */
  TEXT_AREA_HEIGHT_RATIO: 0.1,
  /** Maximum font size in pixels */
  MAX_FONT_SIZE: 20,
  /** Font size as ratio of text area height */
  FONT_SIZE_RATIO: 0.6,
  /** Background color for image atlas */
  BACKGROUND_COLOR: "#000000",
  /** Placeholder color for missing images */
  PLACEHOLDER_COLOR: "#222222",
  /** Error placeholder color */
  ERROR_COLOR: "#333333",
} as const;

/**
 * Configuration constants for drag/scroll interactions
 */
export const DRAG_CONFIG: {
  readonly SENSITIVITY: number;
  readonly VELOCITY_DAMPING: number;
  readonly ZOOM_NORMAL: number;
  readonly ZOOM_DRAGGING: number;
  readonly ZOOM_LERP_SPEED: number;
} = {
  /** Mouse movement to scroll offset multiplier */
  SENSITIVITY: 0.003,
  /** Velocity damping factor (0-1, lower = more friction) */
  VELOCITY_DAMPING: 0.92,
  /** Default zoom level */
  ZOOM_NORMAL: 1.0,
  /** Zoom level while dragging */
  ZOOM_DRAGGING: 1.3,
  /** Zoom interpolation speed (0-1) */
  ZOOM_LERP_SPEED: 0.1,
};

/**
 * Configuration constants for gallery rendering
 */
export const GALLERY_CONFIG = {
  /** Size of each gallery cell in world units */
  CELL_SIZE: 0.8,
} as const;

/**
 * Text rendering configuration
 */
export const TEXT_CONFIG = {
  /** Font family stack for text rendering */
  FONT_FAMILY: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
  /** Text fill color */
  TEXT_COLOR: "#ffffff",
  /** Text shadow color */
  SHADOW_COLOR: "#000000",
  /** Text shadow blur radius */
  SHADOW_BLUR: 10,
  /** Text shadow X offset */
  SHADOW_OFFSET_X: 2,
  /** Text shadow Y offset */
  SHADOW_OFFSET_Y: 2,
} as const;
