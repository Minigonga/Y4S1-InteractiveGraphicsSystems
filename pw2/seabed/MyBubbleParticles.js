/**
 * MyBubbleParticles
 * Represents a group of animated bubble particles using instancing for performance.
 * Bubbles rise, wobble, and fade, and are reset when reaching max height or lifetime.
 * Inherits from THREE.Group.
 */

import * as THREE from 'three';

class MyBubbleParticles extends THREE.Group {
    /**
     * Constructs a new MyBubbleParticles instance.
     * @param {Object} options - Options for bubble placement and behavior.
     * @param {Object} options.pos - Position object (THREE.Vector3 or {x, y, z}).
     * @param {number} [options.count=50] - Number of bubbles.
     * @param {number} [options.maxHeight=50] - Maximum height before bubble resets.
     */
    constructor(options = {}) {
        super();
        const sourcePosition = options.pos;
        /**
         * Number of bubbles in the group.
         * @type {number}
         */
        this.count = options.count || 50;
        /**
         * Source position for bubbles.
         * @type {THREE.Vector3}
         */
        this.sourcePosition = sourcePosition instanceof THREE.Vector3 ? sourcePosition.clone() : new THREE.Vector3(sourcePosition.x, sourcePosition.y, sourcePosition.z);
        /**
         * Maximum height before a bubble resets.
         * @type {number}
         */
        this.maxHeight = options.maxHeight || 50;
        /**
         * Internal time accumulator for animation.
         * @type {number}
         */
        this.time = 0;
        this.wobbleStrength = 0.8;
        this.wobbleSpeed = 2.0;
        this.buoyancyAccel = 0.5;

        /**
         * Material for the bubbles.
         * @type {THREE.MeshPhongMaterial}
         */
        this.bubbleMaterial = new THREE.MeshPhongMaterial({
            color: "#bfc2f1",
            specular: "#ffffff",
            emissive: "#000000",
            shininess: 90,
            transparent: true,
            opacity: 0.3
        });

        // Geometry for each bubble
        const bubbleGeometry = new THREE.SphereGeometry(0.3, 8, 8);

        /**
         * Instanced mesh for all bubbles.
         * @type {THREE.InstancedMesh}
         */
        this.instancedMesh = new THREE.InstancedMesh(
            bubbleGeometry,
            this.bubbleMaterial,
            this.count
        );
        this.add(this.instancedMesh);

        // Per-bubble state arrays
        this.positions = [];
        this.velocities = [];
        this.lifetimes = [];
        this.maxLifetimes = [];
        this.sizes = [];
        this.wobbleOffsets = [];

        // Position the entire group at the source position
        this.position.copy(this.sourcePosition);
        this.position.y += 0.5; // Start slightly above terrain

        // Initialize each bubble's state
        const matrix = new THREE.Matrix4();
        for (let i = 0; i < this.count; i++) {
            // Position bubbles in LOCAL space relative to the group
            const pos = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                0,
                (Math.random() - 0.5) * 2
            );
            this.positions.push(pos);

            const vel = new THREE.Vector3(
                0,
                0.5 + Math.random() * 1.0,
                0
            );
            this.velocities.push(vel);

            const maxLife = 5.0 + Math.random() * 5.0;
            this.maxLifetimes.push(maxLife);
            this.lifetimes.push(Math.random() * maxLife);            

            this.sizes.push(0.5 + Math.random() * 0.8);

            this.wobbleOffsets.push({
                x: Math.random() * 1000,
                z: Math.random() * 1000
            });

            matrix.makeScale(this.sizes[i], this.sizes[i], this.sizes[i]);
            matrix.setPosition(pos);
            this.instancedMesh.setMatrixAt(i, matrix);
        }
        this.instancedMesh.instanceMatrix.needsUpdate = true;
    }

    /**
     * Updates the position, velocity, and scale of all bubbles for animation.
     * Bubbles rise, wobble, and fade, and are reset when reaching max height or lifetime.
     * @param {number} deltaTime - Time elapsed since last update (in seconds).
     */
    update(deltaTime) {
        this.time += deltaTime;
        const matrix = new THREE.Matrix4();
        const scale = new THREE.Vector3();
        for (let i = 0; i < this.count; i++) {
            this.lifetimes[i] += deltaTime;
            // Check height in local space
            const heightAboveSource = this.positions[i].y;
            if (this.lifetimes[i] >= this.maxLifetimes[i] || heightAboveSource >= this.maxHeight) {
                // Reset bubble at local origin with small random offset
                this.positions[i].set(
                    (Math.random() - 0.5) * 2,
                    0,
                    (Math.random() - 0.5) * 2
                );
                this.velocities[i].y = 0.5 + Math.random() * 1.0;
                this.lifetimes[i] = 0;
                scale.set(this.sizes[i], this.sizes[i], this.sizes[i]);
                matrix.compose(this.positions[i], new THREE.Quaternion(), scale);
                this.instancedMesh.setMatrixAt(i, matrix);
                continue;
            }
            // Buoyancy and wobble
            this.velocities[i].y += this.buoyancyAccel * deltaTime;
            this.velocities[i].y = Math.min(this.velocities[i].y, 3.0);
            const wobbleX = this.wobbleOffsets[i].x;
            const wobbleZ = this.wobbleOffsets[i].z;
            const lateralX = Math.sin(this.time * this.wobbleSpeed + wobbleX) * this.wobbleStrength;
            const lateralZ = Math.cos(this.time * this.wobbleSpeed * 1.3 + wobbleZ) * this.wobbleStrength;
            this.positions[i].x += lateralX * deltaTime;
            this.positions[i].y += this.velocities[i].y * deltaTime;
            this.positions[i].z += lateralZ * deltaTime;
            // Fade out as bubble ages
            const lifeRatio = this.lifetimes[i] / this.maxLifetimes[i];
            const fadeScale = this.sizes[i] * (1.0 - lifeRatio * 0.3);  
            scale.set(fadeScale, fadeScale, fadeScale);
            matrix.compose(this.positions[i], new THREE.Quaternion(), scale);
            this.instancedMesh.setMatrixAt(i, matrix);
        }
        this.instancedMesh.instanceMatrix.needsUpdate = true;
    }

    /**
     * Sets the level of detail for the bubble group by reducing the number of visible bubbles.
     * @param {boolean} useLowDetail - If true, show fewer bubbles for performance.
     */
    setLOD(useLowDetail) {
        if (useLowDetail) {
            this.instancedMesh.count = Math.floor(this.count * 0.3);
        } else {
            this.instancedMesh.count = this.count;
        }
    }

    /**
     * Updates the LOD based on camera distance.
     * @param {THREE.Camera} camera - The camera to compare distance.
     * @param {number} [threshold=60] - Distance threshold for low detail.
     */
    updateLOD(camera, threshold = 60) {
        const worldPos = new THREE.Vector3();
        this.getWorldPosition(worldPos);
        const camPos = camera.position;
        const dist = worldPos.distanceTo(camPos);
        this.setLOD(dist > threshold);
    }
}

export { MyBubbleParticles };
