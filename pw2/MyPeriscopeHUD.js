import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

/**
 * MyPeriscopeHUD
 * Creates a heads-up display (HUD) effect simulating a submarine periscope view.
 * Includes visual effects like scratches, chromatic aberration, vignette, and data overlays.
 * Uses post-processing shaders and canvas-based text rendering.
 */
class MyPeriscopeHUD {
    /**
     * Constructs a new MyPeriscopeHUD instance.
     * @param {THREE.WebGLRenderer} renderer - The WebGL renderer.
     * @param {THREE.Scene} scene - The main 3D scene.
     * @param {THREE.Camera} camera - The camera to use for the periscope view.
     * @param {Object} submarine - The submarine object containing position and speed data.
     */
    constructor(renderer, scene, camera, submarine) {
        /**
         * The WebGL renderer.
         * @type {THREE.WebGLRenderer}
         */
        this.renderer = renderer;
        
        /**
         * The main 3D scene.
         * @type {THREE.Scene}
         */
        this.scene = scene;
        
        /**
         * The camera for the periscope view.
         * @type {THREE.Camera}
         */
        this.camera = camera;
        
        /**
         * The submarine object containing position and speed data.
         * @type {Object}
         */
        this.submarine = submarine;
        
        /**
         * Effect composer for post-processing.
         * @type {EffectComposer|null}
         */
        this.composer = null;
        
        /**
         * Shader pass implementing the HUD effects.
         * @type {ShaderPass|null}
         */
        this.hudPass = null;
        
        /**
         * Whether the HUD effect is currently enabled.
         * @type {boolean}
         */
        this.enabled = false;
        
        /**
         * Texture loader for loading external images.
         * @type {THREE.TextureLoader}
         */
        this.textureLoader = new THREE.TextureLoader();
        
        /**
         * Procedurally generated scratches texture.
         * @type {THREE.Texture|null}
         */
        this.scratchesTexture = null;
        
        /**
         * Crosshair/overlay texture for the HUD.
         * @type {THREE.Texture|null}
         */
        this.crosshairTexture = null;

        /**
         * Canvas element for rendering dynamic text.
         * @type {HTMLCanvasElement|null}
         */
        this.textCanvas = null;
        
        /**
         * 2D rendering context for the text canvas.
         * @type {CanvasRenderingContext2D|null}
         */
        this.textContext = null;
        
        /**
         * Material for the text sprite (currently unused).
         * @type {THREE.SpriteMaterial|null}
         */
        this.textMaterial = null;

        /**
         * Bitmap font image for drawing coordinates (sprite sheet)
         * @type {HTMLImageElement|null}
         */
        this.fontImage = null;

        /**
         * Font sprite character cell width/height (set after image loads)
         */
        this.fontCharW = 0;
        this.fontCharH = 0;
        
        /** 
         * Row 0: A B C D E F G H I J K L M (13 characters)
         * Row 1: N O P Q R S T U V W X Y Z (13 characters) 
         * Row 2: 0 1 2 3 4 5 6 7 8 9 (10 characters)
         * Row 3: . : ; , / \ + - * (9 characters)
         * Row 4-5: Not important
         */
        this.charMap = {
            // Row 0: A-M (columns 0-12)
            'A': {row: 0, col: 0},
            'B': {row: 0, col: 1},
            'C': {row: 0, col: 2},
            'D': {row: 0, col: 3},
            'E': {row: 0, col: 4},
            'F': {row: 0, col: 5},
            'G': {row: 0, col: 6},
            'H': {row: 0, col: 7},
            'I': {row: 0, col: 8},
            'J': {row: 0, col: 9},
            'K': {row: 0, col: 10},
            'L': {row: 0, col: 11},
            'M': {row: 0, col: 12},
            
            // Row 1: N-Z (columns 0-12)
            'N': {row: 1, col: 0},
            'O': {row: 1, col: 1},
            'P': {row: 1, col: 2},
            'Q': {row: 1, col: 3},
            'R': {row: 1, col: 4},
            'S': {row: 1, col: 5},
            'T': {row: 1, col: 6},
            'U': {row: 1, col: 7},
            'V': {row: 1, col: 8},
            'W': {row: 1, col: 9},
            'X': {row: 1, col: 10},
            'Y': {row: 1, col: 11},
            'Z': {row: 1, col: 12},
            
            // Row 2: 0-9 (columns 0-9)
            '0': {row: 2, col: 0},
            '1': {row: 2, col: 1},
            '2': {row: 2, col: 2},
            '3': {row: 2, col: 3},
            '4': {row: 2, col: 4},
            '5': {row: 2, col: 5},
            '6': {row: 2, col: 6},
            '7': {row: 2, col: 7},
            '8': {row: 2, col: 8},
            '9': {row: 2, col: 9},
            
            // Row 3: Symbols (columns 0-8)
            '.': {row: 3, col: 0},
            ':': {row: 3, col: 1},
            ';': {row: 3, col: 2},
            ',': {row: 3, col: 3},
            '/': {row: 3, col: 4},
            '\\': {row: 3, col: 5},
            '+': {row: 3, col: 6},
            '-': {row: 3, col: 7},
            '*': {row: 3, col: 8},
            
            ' ': {row: 3, col: 10}
        };
        
        this.init();
    }

    /**
     * Initializes the HUD system, creating textures, shaders, and post-processing passes.
     */
    init() {
        this.createScratchesTextures();
        this.createTextCanvas();
        
        this.composer = new EffectComposer(this.renderer);
        
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        this.createHUDPass();
        this.loadTextures(); 
    }

    /**
     * Loads external textures for the HUD overlay.
     */
    loadTextures() {
        // Load crosshair/overlay texture
        this.crosshairTexture = this.textureLoader.load('textures/hud.png', (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.minFilter = THREE.LinearFilter;
            
            if (this.hudPass) {
                this.hudPass.uniforms.crosshairTexture.value = texture;
            }
        });

        this.fontImage = new Image();
        this.fontImage.src = 'textures/font.png';
        this.fontImage.onload = () => {
            const img = this.fontImage;
            this.fontCharW = Math.floor(img.width / 15);
            this.fontCharH = Math.floor(img.height / 6);
            
        };
    }


    /**
     * Creates a procedurally generated scratches texture using canvas.
     * Simulates wear and tear on the periscope lens.
     */
    createScratchesTextures() {
        // Create canvas for scratches texture
        const scratchesCanvas = document.createElement('canvas');
        scratchesCanvas.width = 512;
        scratchesCanvas.height = 512;
        const ctx = scratchesCanvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, 512, 512);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        
        // Generate random scratch lines
        for (let i = 0; i < 40; i++) {
            ctx.beginPath();
            const x1 = Math.random() * 512;
            const y1 = Math.random() * 512;
            const length = 10 + Math.random() * 80;
            const angle = Math.random() * Math.PI * 2;
            ctx.moveTo(x1, y1);
            ctx.lineTo(x1 + Math.cos(angle) * length, y1 + Math.sin(angle) * length);
            ctx.stroke();
        }
        
        // Create texture from canvas
        this.scratchesTexture = new THREE.CanvasTexture(scratchesCanvas);
    }

    /**
     * Creates a canvas and material for dynamic text rendering.
     * Used to display submarine data like coordinates and speed.
     */
    createTextCanvas() {
        // Create canvas for text rendering
        this.textCanvas = document.createElement('canvas');
        this.textCanvas.width = 512;
        this.textCanvas.height = 512;
        this.textContext = this.textCanvas.getContext('2d');
        
        const texture = new THREE.CanvasTexture(this.textCanvas);
        this.textMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false
        });
    }

    /**
     * Creates the HUD shader pass with all visual effects.
     * Includes masking, chromatic aberration, vignette, scratches, and overlays.
     */
    createHUDPass() {
        const hudShader = {
            uniforms: {
                tDiffuse: { value: null },
                scratchesTexture: { value: this.scratchesTexture },
                crosshairTexture: { value: this.crosshairTexture },
                textTexture: { value: this.textMaterial.map },
                time: { value: 0.0 },
                vignetteStrength: { value: 0.7 },
                chromaticAberration: { value: 0.003 },
                colorTint: { value: new THREE.Color(0.8, 1.0, 0.9) },
                dirtOpacity: { value: 0.2 },
                crosshairOpacity: { value: 1.0 },
                clipRadius: { value: 0.98 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D textTexture;
                uniform sampler2D tDiffuse;
                uniform sampler2D scratchesTexture;
                uniform sampler2D crosshairTexture;
                uniform float time;
                uniform float vignetteStrength;
                uniform float chromaticAberration;
                uniform vec3 colorTint;
                uniform float dirtOpacity;
                uniform float crosshairOpacity;
                uniform float clipRadius;
                
                varying vec2 vUv;
                
                void main() {
                    float rightBias = 0.1;
                    vec2 centeredUv = (vUv - vec2(0.5 - rightBias, 0.5)) * 2.0;
                    float dist = length(centeredUv);
                    
                    // 1. Masking: Create circular viewport
                    if (dist > clipRadius) {
                        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
                        return;
                    }
                    
                    // 2. Chromatic Aberration: Split RGB channels
                    float shift = chromaticAberration;
                    float r = texture2D(tDiffuse, vUv + vec2(shift, 0.0)).r;
                    float g = texture2D(tDiffuse, vUv).g;
                    float b = texture2D(tDiffuse, vUv - vec2(shift, 0.0)).b;
                    vec3 sceneColor = vec3(r, g, b) * colorTint;
                    
                    // 3. Vignette: Darken edges
                    sceneColor *= (1.0 - dist * vignetteStrength);
                    
                    // 4. Scratches: Add moving scratches overlay
                    vec2 scratchUv = vUv + vec2(sin(time)*0.001, cos(time)*0.001);
                    vec4 scratchMap = texture2D(scratchesTexture, scratchUv);
                    sceneColor = mix(sceneColor, scratchMap.rgb, scratchMap.a * dirtOpacity);
                    
                    // 5. Full Screen HUD PNG Overlay
                    vec4 hud = texture2D(crosshairTexture, vUv);
                    vec3 finalColor = mix(sceneColor, hud.rgb, hud.a * crosshairOpacity);

                    // 6. Text overlay on entire left side
                    // Map left side of screen to text texture
                    vec2 textUv = vec2(
                        vUv.x * 2.0,  // Double x coordinate to fill texture
                        1.0 - vUv.y   // Invert y for correct orientation
                    );

                    // Only apply text on the left side of the screen
                    if (vUv.x < 0.5) {
                        vec4 text = texture2D(textTexture, textUv);
                        finalColor = mix(finalColor, text.rgb, text.a);
                    }
                    
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `
        };
        
        // Create shader pass and add to composer
        this.hudPass = new ShaderPass(hudShader);
        this.composer.addPass(this.hudPass);
    }

    /**
     * Updates the text overlay with current submarine data.
     * @param {THREE.Vector3} pos - Current submarine position.
     */
    updateText(pos) {
        const ctx = this.textContext;

        // Clear previous text
        ctx.clearRect(0, 0, 512, 512);

        const startX = 60;
        let y = 330;
        const lineHeight = 15;
        const scale = 0.25;

        // Draw COORD X: using sprite characters
        this.drawChar('C', startX, y, scale);
        this.drawChar('O', startX + this.fontCharW * scale * 0.8, y, scale);
        this.drawChar('O', startX + this.fontCharW * scale * 1.6, y, scale);
        this.drawChar('R', startX + this.fontCharW * scale * 2.4, y, scale);
        this.drawChar('D', startX + this.fontCharW * scale * 3.2, y, scale);
        this.drawChar(' ', startX + this.fontCharW * scale * 4.0, y, scale);
        this.drawChar('X', startX + this.fontCharW * scale * 4.8, y, scale);
        this.drawChar(':', startX + this.fontCharW * scale * 5.6, y, scale);

        y -= lineHeight;
        this.drawNumber(pos.x.toFixed(1), startX , y, scale);

        // Draw COORD Z:
        y -= lineHeight * 2;
        this.drawChar('C', startX, y, scale);
        this.drawChar('O', startX + this.fontCharW * scale * 0.8, y, scale);
        this.drawChar('O', startX + this.fontCharW * scale * 1.6, y, scale);
        this.drawChar('R', startX + this.fontCharW * scale * 2.4, y, scale);
        this.drawChar('D', startX + this.fontCharW * scale * 3.2, y, scale);
        this.drawChar(' ', startX + this.fontCharW * scale * 4.0, y, scale);
        this.drawChar('Z', startX + this.fontCharW * scale * 4.8, y, scale);
        this.drawChar(':', startX + this.fontCharW * scale * 5.6, y, scale);
        
        y -= lineHeight;
        this.drawNumber(pos.z.toFixed(1), startX, y, scale);

        // Draw DEPTH:
        y -= lineHeight*2.5;
        this.drawChar('D', startX, y, scale);
        this.drawChar('E', startX + this.fontCharW * scale * 0.8, y, scale);
        this.drawChar('P', startX + this.fontCharW * scale * 1.6, y, scale);
        this.drawChar('T', startX + this.fontCharW * scale * 2.4, y, scale);
        this.drawChar('H', startX + this.fontCharW * scale * 3.2, y, scale);
        this.drawChar(':', startX + this.fontCharW * scale * 4.0, y, scale);
        
        y -= lineHeight;
        this.drawNumber(Math.abs(pos.y).toFixed(1), startX, y, scale);
        this.drawChar(' ', startX + this.fontCharW * scale * 2.4, y, scale);
        this.drawChar('M', startX + this.fontCharW * scale * 3.2, y, scale);

        if (this.submarine.forwardSpeed !== undefined) {
            y -= lineHeight * 2;
            const kn = (Math.abs(this.submarine.forwardSpeed) * 50).toFixed(1);
            
            this.drawChar('S', startX, y, scale);
            this.drawChar('P', startX + this.fontCharW * scale * 0.8, y, scale);
            this.drawChar('E', startX + this.fontCharW * scale * 1.6, y, scale);
            this.drawChar('E', startX + this.fontCharW * scale * 2.4, y, scale);
            this.drawChar('D', startX + this.fontCharW * scale * 3.2, y, scale);
            this.drawChar(':', startX + this.fontCharW * scale * 4.0, y, scale);
            
            y -= lineHeight;
            this.drawNumber(kn, startX, y, scale);
            this.drawChar(' ', startX + this.fontCharW * scale * 2.4, y, scale);
            this.drawChar('K', startX + this.fontCharW * scale * 3.2, y, scale);
            this.drawChar('T', startX + this.fontCharW * scale * 4.0, y, scale);
            this.drawChar('S', startX + this.fontCharW * scale * 4.8, y, scale);
        }

        this.textMaterial.map.needsUpdate = true;
    }

    /**
     * Draws a single character from the sprite sheet
     * @param {string} char - Character to draw
     * @param {number} dx - Destination x
     * @param {number} dy - Destination y
     * @param {number} scale - Scale factor
     */
    drawChar(char, dx, dy, scale = 1.0) {
        if (!this.fontImage || this.fontCharW === 0) {
            const ctx = this.textContext;
            ctx.fillStyle = 'rgba(0,255,0,1)';
            ctx.font = 'bold 14px monospace';
            ctx.textBaseline = 'top';
            ctx.fillText(char, dx, dy);
            return;
        }
        
        const ctx = this.textContext;
        const cw = this.fontCharW;
        const ch = this.fontCharH;
        
        // Get character position from map
        const mapping = this.charMap[char];
        if (!mapping) {
            ctx.fillStyle = 'rgba(0,255,0,1)';
            ctx.font = 'bold 14px monospace';
            ctx.textBaseline = 'top';
            ctx.fillText(char, dx, dy);
            return;
        }
        
        const sx = mapping.col * cw;
        const sy = mapping.row * ch;
        
        try {
            ctx.save();
            
            ctx.translate(dx, dy + ch * scale);
            
            ctx.scale(1, -1);
            
            ctx.drawImage(this.fontImage, sx, sy, cw, ch, 0, 0, cw * scale, ch * scale);
            
            ctx.restore();
        } catch (e) {
            ctx.fillStyle = 'rgba(0,255,0,1)';
            ctx.font = 'bold 14px monospace';
            ctx.textBaseline = 'top';
            ctx.fillText(char, dx, dy);
        }
    }

    /**
     * Draws a number (with decimal point and minus sign if needed)
     * @param {string} numStr - Number as string
     * @param {number} dx - Destination x
     * @param {number} dy - Destination y
     * @param {number} scale - Scale factor
     */
    drawNumber(numStr, dx, dy, scale = 1.0) {
        let x = dx;
        
        for (let i = 0; i < numStr.length; i++) {
            const char = numStr[i];
            this.drawChar(char, x, dy, scale);
            x += this.fontCharW * scale * 0.8;
        }
    }

    /**
     * Enables or disables the HUD effect.
     * @param {boolean} enabled - Whether to enable the HUD.
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Updates the HUD with current time and submarine data.
     * @param {number} time - Current time in seconds for animation effects.
     */
    update(time) {
        if (!this.enabled) return;
        
        if (this.hudPass) {
            this.hudPass.uniforms.time.value = time;
        }
        
        if (this.submarine) {
            this.updateText(this.submarine.position);
            
            if (this.hudPass) {
                this.hudPass.uniforms.textTexture.value = this.textMaterial.map;
                this.hudPass.uniforms.textTexture.value.needsUpdate = true;
            }
        }
    }

    /**
     * Handles window resize events.
     * @param {number} width - New window width.
     * @param {number} height - New window height.
     */
    resize(width, height) {
        if (this.composer) {
            this.composer.setSize(width, height);
        }
    }

    /**
     * Renders the scene with HUD effects if enabled.
     * Falls back to standard rendering if HUD is disabled.
     */
    render() {
        if (this.enabled && this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

    /**
     * Cleans up resources and disposes of textures and materials.
     * Should be called when the HUD is no longer needed.
     */
    dispose() {
        if (this.composer) this.composer.dispose();
        if (this.scratchesTexture) this.scratchesTexture.dispose();
        if (this.crosshairTexture) this.crosshairTexture.dispose();
        if (this.textMaterial) this.textMaterial.dispose();
    }
}

export { MyPeriscopeHUD };