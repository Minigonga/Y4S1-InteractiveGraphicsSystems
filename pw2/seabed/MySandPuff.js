
/**
 * MySandPuff
 * Particle system for simulating a puff of sand, spawned on seabed click.
 * Particles are projected in a hemisphere with parabolic trajectories.
 * Inherits from THREE.Points.
 */

import * as THREE from 'three';

class MySandPuff extends THREE.Points {
    /**
     * Constructs a new MySandPuff instance.
     * @param {THREE.Vector3} clickPosition - The position where the puff is spawned.
     * @param {number} particleCount - Number of sand particles.
     */
    constructor(clickPosition, particleCount = 100) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const lifetimes = new Float32Array(particleCount);
        const sizes = new Float32Array(particleCount);
        // Initial spawn position
        const spawnPos = clickPosition.clone();
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            // Start at click position with slight random offset
            positions[i3] = spawnPos.x + (Math.random() - 0.5) * 0.5;
            positions[i3 + 1] = spawnPos.y + 0.1;
            positions[i3 + 2] = spawnPos.z + (Math.random() - 0.5) * 0.5;
            // Hemisphere distribution for initial velocity
            const theta = Math.random() * Math.PI * 2; // Azimuthal angle
            const phi = Math.random() * Math.PI * 0.5; // Polar angle (0 to PI/2 for hemisphere)
            // Add noise to angles for more natural spread
            const noisyPhi = phi + (Math.random() - 0.5) * 0.3;
            const noisyTheta = theta + (Math.random() - 0.5) * 0.3;
            // Initial velocity magnitude with variation
            const speed = 2.0 + Math.random() * 3.0;
            // Convert spherical to Cartesian coordinates
            velocities[i3] = speed * Math.sin(noisyPhi) * Math.cos(noisyTheta);
            velocities[i3 + 1] = speed * Math.cos(noisyPhi); // Upward component
            velocities[i3 + 2] = speed * Math.sin(noisyPhi) * Math.sin(noisyTheta);
            // Lifetime (will fade and despawn)
            lifetimes[i] = 0;
            // Particle size with variation
            sizes[i] = 0.1 + Math.random() * 0.15;
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        // Sand-colored material
        const material = new THREE.PointsMaterial({
            color: 0x456c7a,
            size: 0.6,
            transparent: true,
            opacity: 1.0,
            sizeAttenuation: true,
            blending: THREE.NormalBlending,
            depthWrite: true
        });
        super(geometry, material);
        /**
         * Number of sand particles.
         * @type {number}
         */
        this.particleCount = particleCount;
        /**
         * Maximum lifetime for each particle (seconds).
         * @type {number}
         */
        this.maxLifetime = 2.0;
        /**
         * Gravity acceleration (negative for downward motion).
         * @type {number}
         */
        this.gravity = -9.8;
        /**
         * Y coordinate of the seabed.
         * @type {number}
         */
        this.seabedY = clickPosition.y;
        /**
         * Whether the puff is still active (particles visible).
         * @type {boolean}
         */
        this.active = true;
    }

    /**
     * Updates the position and state of all sand particles for animation.
     * @param {number} deltaTime - Time elapsed since last update (in seconds).
     */
    update(deltaTime) {
        if (!this.active) return;
        if (!deltaTime || deltaTime === 0) return;
        const positions = this.geometry.attributes.position.array;
        const velocities = this.geometry.attributes.velocity.array;
        const lifetimes = this.geometry.attributes.lifetime.array;
        let allDead = true;
        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;
            lifetimes[i] += deltaTime;
            if (lifetimes[i] < this.maxLifetime && positions[i3 + 1] >= this.seabedY) {
                allDead = false;
                velocities[i3 + 1] += this.gravity * deltaTime;
                const resistance = 0.98;
                velocities[i3] *= resistance;
                velocities[i3 + 2] *= resistance;
                positions[i3] += velocities[i3] * deltaTime;
                positions[i3 + 1] += velocities[i3 + 1] * deltaTime;
                positions[i3 + 2] += velocities[i3 + 2] * deltaTime;
                if (positions[i3 + 1] < this.seabedY) {
                    positions[i3 + 1] = this.seabedY;
                    velocities[i3 + 1] = 0;
                }
            }
        }
        const avgLifetime = lifetimes.reduce((sum, life) => sum + life, 0) / this.particleCount;
        const lifetimeRatio = avgLifetime / this.maxLifetime;
        this.material.opacity = Math.max(0, 0.8 * (1.0 - lifetimeRatio));
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.lifetime.needsUpdate = true;
        if (allDead || lifetimeRatio >= 1.0) {
            this.active = false;
        }
    }

    /**
     * Returns whether the sand puff is still active (particles visible).
     * @returns {boolean} True if active, false if all particles have faded.
     */
    isActive() {
        return this.active;
    }

    /**
     * Disposes of geometry and material resources.
     */
    dispose() {
        this.geometry.dispose();
        this.material.dispose();
    }
}

export { MySandPuff };
