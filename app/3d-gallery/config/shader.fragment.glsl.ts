export const fragmentShader = `
  uniform vec2 uOffset;
  uniform vec2 uResolution;
  uniform vec3 uBorderColor;
  uniform vec3 uHoverColor;
  uniform vec3 uBackgroundColor;
  uniform vec2 uMousePos;
  uniform float uZoom;
  uniform float uCellSize;
  uniform float uTextureCount;
  uniform sampler2D uImageAtlas;
  uniform sampler2D uTextAtlas;
  uniform float uIsLoading;
  uniform float uTime;
  
  varying vec2 vUv;
  
  void main() {
    vec2 screenUV = (vUv - 0.5) * 2.0;
    
    // Barrel distortion for a subtle lens effect
    float radius = length(screenUV);
    float distortion = 1.0 - 0.08 * radius * radius;
    vec2 distortedUV = screenUV * distortion;
    
    // Fade out at extreme edges
    float fade = 1.0 - smoothstep(1.2, 1.8, radius);
    
    // Convert to world coordinates and apply aspect correction
    float aspectRatio = uResolution.x / uResolution.y;
    vec2 worldCoord = distortedUV;
    worldCoord.x *= aspectRatio;
    
    worldCoord *= uZoom;
    worldCoord += uOffset;
    
    // Determine cell position and UVs within the cell
    vec2 cellPos = worldCoord / uCellSize;
    vec2 cellId = floor(cellPos);
    vec2 cellUV = fract(cellPos);
    
    // Distort mouse coordinates for interaction
    vec2 mouseScreenUV = (uMousePos / uResolution) * 2.0 - 1.0;
    mouseScreenUV.y = -mouseScreenUV.y;
    float mouseRadius = length(mouseScreenUV);
    float mouseDistortion = 1.0 - 0.08 * mouseRadius * mouseRadius;
    vec2 mouseDistortedUV = mouseScreenUV * mouseDistortion;
    
    vec2 mouseWorldCoord = mouseDistortedUV;
    mouseWorldCoord.x *= aspectRatio;
    mouseWorldCoord *= uZoom;
    mouseWorldCoord += uOffset;
  
    vec2 mouseCellPos = mouseWorldCoord / uCellSize;
    vec2 mouseCellId = floor(mouseCellPos);
    
    // Calculate hover effect based on mouse proximity to cells
    vec2 cellCenter = cellId + 0.5;
    vec2 mouseCellCenter = mouseCellId + 0.5;
    float cellDistance = length(cellCenter - mouseCellCenter);
    float hoverIntensity = 1.0 - smoothstep(0.0, 1.5, cellDistance);
    bool isHovered = hoverIntensity > 0.0 && uMousePos.x > 0.0;
    
    // Background color with optional hover effect
    vec3 backgroundColor = uBackgroundColor;
    if (isHovered) {
      backgroundColor = mix(uBackgroundColor, uHoverColor, hoverIntensity * 0.3);
    }
    
    // Image sampling from the atlas (top 90% of cell, leaving bottom 10% for text)
    float imageBorder = 0.02;
    float imageAreaHeight = 0.9; // Top 90% for images (bottom 10% reserved for text)
    
    // Check if we're in the image area (top 90%, excluding bottom 10% where text is)
    // In WebGL, Y=0 is typically at bottom, so top 90% is [0.1, 1.0]
    bool inImageArea = cellUV.y >= 0.1 && cellUV.y <= 1.0;
    
    vec3 color = backgroundColor;
    
    // Show loading animation if textures are not ready
    if (uIsLoading > 0.5) {
      if (inImageArea) {
        // Create animated loading pattern
        float loadingPattern = sin(cellId.x * 2.0 + cellId.y * 3.0 + uTime * 2.0) * 0.5 + 0.5;
        float pulse = sin(uTime * 3.0) * 0.3 + 0.7;
        
        // Create a grid-based loading indicator
        vec2 loadingUV = cellUV;
        float loadingGrid = mod(loadingUV.x * 4.0 + uTime, 1.0) + mod(loadingUV.y * 4.0 + uTime * 0.7, 1.0);
        loadingGrid = step(0.5, loadingGrid);
        
        // Animated gradient
        vec3 loadingColor1 = vec3(0.15, 0.15, 0.2);
        vec3 loadingColor2 = vec3(0.25, 0.25, 0.35);
        vec3 loadingColor = mix(loadingColor1, loadingColor2, loadingPattern * pulse);
        
        // Add subtle shimmer effect
        float shimmer = sin((cellId.x + cellId.y) * 0.5 + uTime * 4.0) * 0.1 + 0.9;
        loadingColor *= shimmer;
        
        color = mix(backgroundColor, loadingColor, 0.6);
        
        // Add animated dots/spinner effect in center
        vec2 center = cellUV - 0.5;
        float dist = length(center);
        float angle = atan(center.y, center.x) + uTime * 2.0;
        float spinner = sin(angle * 6.0) * 0.5 + 0.5;
        spinner *= smoothstep(0.3, 0.1, dist);
        spinner *= smoothstep(0.0, 0.1, dist);
        
        vec3 spinnerColor = vec3(0.4, 0.5, 0.6) * spinner * 0.5;
        color += spinnerColor;
      }
    } else if (inImageArea) {
      // Create unique pattern for each cell - no repetition in adjacent cells
      // Use a simple grid-based assignment instead of random hash
      float x = cellId.x;
      float y = cellId.y;
      
      // Calculate atlas grid size dynamically based on texture count
      float atlasSize = ceil(sqrt(uTextureCount));
      
      // Map each cell position to a unique texture index using the actual atlas size
      // This ensures we use all available textures
      float gridX = mod(x, atlasSize);
      float gridY = mod(y, atlasSize);
      
      // Calculate texture index: 0 to (uTextureCount-1) based on position in grid
      float textureIndex = gridY * atlasSize + gridX;
      
      // Clamp to valid texture range
      textureIndex = mod(textureIndex, uTextureCount);
      
      // Calculate atlas coordinates
      float atlasCol = mod(textureIndex, atlasSize);
      float atlasRow = floor(textureIndex / atlasSize);
      
      // Calculate the base position in the atlas (top-left corner of this image)
      vec2 atlasCoord = vec2(atlasCol, atlasRow) / atlasSize;
      
      // Map cellUV to image UV space (with border, and only top 90% vertically)
      // cellUV.y is now in [0.1, 1.0] for images, map to [0, 1] for texture sampling
      // Flip Y coordinate because canvas textures have origin at top-left, but WebGL expects bottom-left
      float normalizedY = (cellUV.y - 0.1) / imageAreaHeight; // Maps [0.1, 1.0] to [0, 1]
      vec2 imageUV = vec2(
        (cellUV.x - imageBorder) / (1.0 - imageBorder * 2.0),
        1.0 - normalizedY // Flip Y: canvas top (high Y) = WebGL UV bottom (low UV.y)
      );
      
      // Clamp imageUV to valid range
      imageUV = clamp(imageUV, 0.0, 1.0);
      
      // Calculate the sample position within this atlas cell
      // Add a small epsilon to prevent sampling from adjacent cells
      float epsilon = 0.0001;
      vec2 sampleUV = atlasCoord + (imageUV * (1.0 / atlasSize - epsilon * 2.0)) + epsilon;
      
      // Smooth image edges
      float smoothAmount = 0.01;
      vec2 imageMask = smoothstep(0.0, smoothAmount, imageUV) *
                       smoothstep(0.0, smoothAmount, 1.0 - imageUV);
      
      // Sample the texture
      vec4 texColor = texture2D(uImageAtlas, sampleUV);
      
      // Check if there's actual image content
      float colorIntensity = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
      float alpha = texColor.a;
      
      // Consider pixel valid if it has color or alpha
      bool hasContent = (colorIntensity > 0.02 || alpha > 0.1);
      
      if (hasContent) {
        // Use alpha channel if available, otherwise use full opacity
        float finalAlpha = (alpha > 0.01) ? alpha : 1.0;
        
        // Apply the image mask for smooth edges
        finalAlpha *= imageMask.x * imageMask.y;
        
        // Blend the texture with background
        color = mix(backgroundColor, texColor.rgb, finalAlpha);
      }
    }
    
    // Text area (bottom 10% of the cell - smaller text, no background)
    // In WebGL, Y=0 is at bottom, so bottom 10% is [0, 0.1]
    bool inTextArea = cellUV.x >= 0.05 && cellUV.x <= 0.95 && 
                      cellUV.y >= 0.0 && cellUV.y <= 0.1;
    
    if (inTextArea) {
      // Use same grid-based assignment as images to match text with image above
      float x = cellId.x;
      float y = cellId.y;
      
      // Calculate atlas grid size dynamically based on texture count
      float atlasSize = ceil(sqrt(uTextureCount));
      
      // Map each cell position to a unique texture index using the actual atlas size
      // This ensures text matches the image above it
      float gridX = mod(x, atlasSize);
      float gridY = mod(y, atlasSize);
      
      // Calculate texture index: 0 to (uTextureCount-1) based on position in grid
      float textureIndex = gridY * atlasSize + gridX;
      
      // Clamp to valid texture range
      textureIndex = mod(textureIndex, uTextureCount);
      
      float atlasCol = mod(textureIndex, atlasSize);
      float atlasRow = floor(textureIndex / atlasSize);
      
      vec2 atlasCoord = vec2(atlasCol, atlasRow) / atlasSize;
      
      // Map text area (0.05-0.95 x, 0.0-0.1 y) to atlas UV space
      // Text is drawn in the bottom 10% of a square cell in the atlas
      // With flipY=false: canvas bottom (high Y) = WebGL UV top (high UV.y)
      
      // Map X: from cell space [0.05, 0.95] to atlas cell space [0, 1]
      // The text uses the full width of the atlas cell, so we map the 0.9 width to full width
      float textX = (cellUV.x - 0.05) / 0.9; // Maps [0.05, 0.95] to [0, 1]
      textX = clamp(textX, 0.0, 1.0);
      
      // Map Y: from cell space [0, 0.1] to atlas cell space [0.9, 1.0]
      // Text is in bottom 10% of atlas cell (which is at [0.9, 1.0] in atlas UV)
      // cellUV.y [0, 0.1] maps to text area [0, 1], then to atlas [0.9, 1.0]
      float textY = cellUV.y / 0.1; // Maps [0, 0.1] to [0, 1] in text area
      textY = 1.0 - textY; // Invert: bottom of cell (y=0) maps to top of text area in atlas
      // Now map to full atlas cell: text area is at [0.9, 1.0] in atlas cell
      textY = 0.9 + textY * 0.1; // Maps [0, 1] to [0.9, 1.0]
      textY = clamp(textY, 0.0, 1.0);
      
      vec2 textUV = vec2(textX, textY);
      
      // Add epsilon to prevent bleeding
      float epsilon = 0.0001;
      vec2 sampleUV = atlasCoord + (textUV * (1.0 / atlasSize - epsilon * 2.0)) + epsilon;
      vec4 textColor = texture2D(uTextAtlas, sampleUV);
      
      // Improve text rendering - text has transparent background, so use alpha channel
      // Use luminance to determine if pixel is part of text
      float textLuminance = dot(textColor.rgb, vec3(0.299, 0.587, 0.114));
      float textAlpha = textColor.a;
      
      // Consider pixel as text if it has sufficient brightness or alpha
      // Since background is transparent, alpha channel should be the primary indicator
      if (textLuminance > 0.1 || textAlpha > 0.1) {
        // Use alpha as the primary indicator for text pixels
        float textIntensity = max(textLuminance, textAlpha);
        // Make text more opaque and visible
        textIntensity = smoothstep(0.0, 0.3, textIntensity);
        
        // Use stronger mixing for better readability - make text brighter and more visible
        vec3 textColorFinal = textColor.rgb;
        // Boost text brightness for visibility against images
        textColorFinal = mix(textColorFinal, vec3(1.0), 0.15);
        // Blend text over the background (which may be image or background color)
        color = mix(color, textColorFinal, textIntensity);
      }
    }
    
    // Grid effect (thinner lines)
    float gridThickness = 0.006;
    float gridMask = smoothstep(gridThickness, gridThickness + 0.005, cellUV.x) *
                     smoothstep(gridThickness, gridThickness + 0.005, cellUV.y) *
                     smoothstep(gridThickness, gridThickness + 0.005, 1.0 - cellUV.x) *
                     smoothstep(gridThickness, gridThickness + 0.005, 1.0 - cellUV.y);
    
    color = mix(uBorderColor, color, gridMask);
    
    gl_FragColor = vec4(color * fade, 1.0);
  }
`;
