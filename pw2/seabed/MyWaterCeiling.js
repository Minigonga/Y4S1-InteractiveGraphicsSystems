import * as THREE from 'three';

/**
 * MyWaterCeiling
 * Represents the water surface ceiling with animated video texture.
 * Creates a semi-transparent cylinder at the top of the underwater scene.
 * Inherits from THREE.Mesh.
 */
class MyWaterCeiling extends THREE.Mesh {
    /**
     * Constructs a new MyWaterCeiling instance.
     * @param {number} radius - Radius of the ceiling cylinder (default: 175).
     * @param {number} thickness - Thickness of the ceiling cylinder (default: 0.5).
     * @param {number} yPosition - Y position of the ceiling (default: 95).
     * @param {string} videoSrc - Path to the video texture (default: './textures/ceiling.mp4').
     */
    constructor(radius = 175, thickness = 0.5, yPosition = 95, videoSrc = './textures/ceiling.mp4') {
        // Create video element for texture
        const video = document.createElement('video');
        video.src = videoSrc;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;
        video.style.display = 'none';
        document.body.appendChild(video);
        video.play().catch(err => {
            console.warn('Ceiling video failed to play automatically:', err);
        });

        // Create video texture
        const texture = new THREE.VideoTexture(video);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.format = THREE.RGBFormat;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);

        // Create geometry and material
        const geometry = new THREE.CylinderGeometry(radius, radius, thickness, 64);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            color: 0x777777,
            transparent: true,
            opacity: 0.85
        });

        super(geometry, material);

        /**
         * Reference to the video element for cleanup.
         * @type {HTMLVideoElement}
         */
        this.video = video;

        /**
         * Reference to the video texture.
         * @type {THREE.VideoTexture}
         */
        this.texture = texture;

        // Set position and properties
        this.position.y = yPosition;
        this.receiveShadow = false;
        this.castShadow = false;
        this.name = 'WaterCeiling';
    }

    /**
     * Disposes of the ceiling resources including video element and texture.
     */
    dispose() {
        if (this.video) {
            this.video.pause();
            this.video.src = '';
            if (this.video.parentNode) {
                this.video.parentNode.removeChild(this.video);
            }
        }
        if (this.texture) {
            this.texture.dispose();
        }
        if (this.geometry) {
            this.geometry.dispose();
        }
        if (this.material) {
            this.material.dispose();
        }
    }
}

export { MyWaterCeiling };
