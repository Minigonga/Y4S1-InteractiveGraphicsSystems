
/**
 * MyMarineSnow
 * Represents a cloud of animated marine snow particles (falling detritus) using THREE.Points.
 * Each particle drifts and falls, and is reset when reaching the seabed or boundary.
 * Inherits from THREE.Points.
 */

import * as THREE from 'three';

class MyMarineSnow extends THREE.Points {
    /**
     * Constructs a new MyMarineSnow instance.
     * @param {number} count - Number of particles.
     * @param {number} regionSize - Size of the region (diameter) for snow distribution.
     * @param {number} height - Height of the snow region.
     * @param {number} seabedY - Y coordinate of the seabed.
     */
    constructor(count = 1000, regionSize = 400, height = 100, seabedY = 0) {
        // Create geometry and per-particle attributes
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);
        const noiseOffsets = new Float32Array(count * 2);
        const radius = regionSize / 2;
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const i2 = i * 2;
            // Random radial distribution
            const r = Math.sqrt(Math.random()) * radius;
            const a = Math.random() * Math.PI * 2;
            positions[i3]     = Math.cos(a) * r;
            positions[i3 + 1] = Math.random() * height + seabedY;
            positions[i3 + 2] = Math.sin(a) * r;
            velocities[i3]     = 0;
            velocities[i3 + 1] = -(0.5 + Math.random() * 1.5);
            velocities[i3 + 2] = 0;
            noiseOffsets[i2]     = Math.random() * 1000;
            noiseOffsets[i2 + 1] = Math.random() * 1000;
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('noiseOffset', new THREE.BufferAttribute(noiseOffsets, 2));

        // Create a circular gradient texture for snow particles
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.5, 'rgba(180, 200, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.PointsMaterial({
            size: 1.5,
            map: texture,
            transparent: true,
            opacity: 0.67,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            vertexColors: false
        });
        super(geometry, material);
        /**
         * Number of particles.
         * @type {number}
         */
        this.count = count;
        /**
         * Size of the region (diameter) for snow distribution.
         * @type {number}
         */
        this.regionSize = regionSize;
        /**
         * Radius of the region.
         * @type {number}
         */
        this.radius = radius;
        /**
         * Height of the snow region.
         * @type {number}
         */
        this.height = height;
        /**
         * Y coordinate of the seabed.
         * @type {number}
         */
        this.seabedY = seabedY;
        /**
         * Internal time accumulator for animation.
         * @type {number}
         */
        this.time = 0;
        /**
         * Strength of horizontal meandering.
         * @type {number}
         */
        this.meanderStrength = 1;
        /**
         * Speed of horizontal meandering.
         * @type {number}
         */
        this.meanderSpeed = 1;
    }

    /**
     * Updates the position of all marine snow particles for animation.
     * Particles drift and fall, and are reset when reaching the seabed or boundary.
     * @param {number} deltaTime - Time elapsed since last update (in seconds).
     */
    update(deltaTime) {
        if (!deltaTime || deltaTime === 0) return;
        this.time += deltaTime;
        const positions = this.geometry.attributes.position.array;
        const velocities = this.geometry.attributes.velocity.array;
        const noiseOffsets = this.geometry.attributes.noiseOffset.array;
        for (let i = 0; i < this.count; i++) {
            const i3 = i * 3;
            const i2 = i * 2;
            // Horizontal drift
            const driftX = Math.sin(this.time * this.meanderSpeed + noiseOffsets[i2]) * this.meanderStrength;
            const driftZ = Math.cos(this.time * this.meanderSpeed + noiseOffsets[i2 + 1]) * this.meanderStrength;
            positions[i3]     += driftX * deltaTime;
            positions[i3 + 1] += velocities[i3 + 1] * deltaTime;
            positions[i3 + 2] += driftZ * deltaTime;
            // Reset if below seabed
            if (positions[i3 + 1] < this.seabedY) {
                const r = Math.sqrt(Math.random()) * this.radius;
                const a = Math.random() * Math.PI * 2;
                positions[i3]     = Math.cos(a) * r;
                positions[i3 + 1] = this.height + this.seabedY;
                positions[i3 + 2] = Math.sin(a) * r;
            }
            // Clamp to region boundary
            const x = positions[i3];
            const z = positions[i3 + 2];
            const dist = Math.sqrt(x * x + z * z);
            if (dist > this.radius) {
                const angle = Math.atan2(z, x);
                positions[i3]     = Math.cos(angle) * this.radius;
                positions[i3 + 2] = Math.sin(angle) * this.radius;
            }
        }
        this.geometry.attributes.position.needsUpdate = true;
    }
}

export { MyMarineSnow };
