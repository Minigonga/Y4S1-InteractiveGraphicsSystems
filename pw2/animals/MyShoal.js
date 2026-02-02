// MyShoal.js - Generic shoal class for flocking behavior
// Updated to match teacher's boid implementation for better cohesive flocking

import * as THREE from 'three';
import { MeshBVH } from 'https://cdn.jsdelivr.net/npm/three-mesh-bvh@0.6.4/build/index.module.js';

/**
 * MyShoal
 * Represents a group of fish exhibiting flocking (boids) behavior.
 * This class implements a boids algorithm with separation, alignment, and cohesion behaviors,
 * plus additional features like danger evasion, boundary handling, and spatial acceleration.
 * @extends THREE.Group
 */
class MyShoal extends THREE.Group {
    constructor(FishClass, options = {}) {
        super();

        if (!FishClass) {
            throw new Error('MyShoal requires a FishClass constructor');
        }

        this.FishClass = FishClass;
        this.options = this._initializeOptions(options);
        this.terrain = this.options.terrain;

        // Visual setup
        this._initializeMaterial();

        // Arrays for fish data
        this.fishes = [];
        this.velocities = [];
        this.accelerations = [];
        this.wanderAngles = [];
        this.panicMode = [];
        this.panicTimer = [];
        this.dangerousEntities = [];

        // Spatial acceleration setup
        this.bvhEnabled = this.options.useBVH;
        this.bvh = null;
        this.bvhGeometry = null;
        this.bvhFrameCount = 0;
        this.bvhUpdateFrequency = this.options.bvhUpdateFrequency;

        // Reusable objects
        this._tempVector = new THREE.Vector3();
        this._tempQuaternion = new THREE.Quaternion();
        this._tempObject = new THREE.Object3D();
        this._tempEuler = new THREE.Euler();

        // Position and scale
        this.position.set(
            this.options.position.x,
            this.options.position.y, 
            this.options.position.z
        );
        this.scale.setScalar(this.options.scale);

        // Temple reference for avoidance
        this.temple = this.options.temple || null;

        // Terrain reference for avoidance
        this.terrain = this.options.terrain || null;

        // Build the shoal
        this.build();
        if (this.bvhEnabled) this.initBVH();
    }

    /**
     * Initializes the options object with default values.
     * @param {Object} options - User-provided options.
     * @returns {Object} - Merged options with defaults.
     * @private
     */
    _initializeOptions(options) {
        const defaults = {
            // Flocking behavior parameters
            separationDistance: 15.0,
            alignmentDistance: 40.0,
            cohesionDistance: 50.0,
            separationWeight: 3.0,
            alignmentWeight: 1.0,
            cohesionWeight: 3.0,
            
            // Movement parameters
            maxSpeed: 80.0,
            maxForce: 5,
            wanderStrength: 0.1,
            
            // Danger response parameters
            dangerDetectionDistance: 30.0,
            dangerEvasionDistance: 25.0,
            dangerEvasionWeight: 15.0,
            panicSpeedMultiplier: 5,
            panicDuration: 120,
            evasionSmoothness: 0.1,
            
            // Boundary parameters
            boundsWeight: 5.0,
            boundsMargin: 50.0,
            areaSize: 200,
            height: 100,
            
            // Terrain avoidance
            terrain: null,
            terrainMargin: 3.0,
            
            // Visual parameters
            fishCount: 15,
            color: "#506f6c",
            sizeVariation: 0.5,
            colorVariation: 0.2,
            flatShading: true,
            shininess: 90,
            specular: "#000000",
            emissive: "#000000",
            scale: 0.15,
            fishScale: 1.0,
            
            // Optimization
            useBVH: true,
            bvhUpdateFrequency: 10,
            rotationSmoothness: 0.2,
            
            // Position
            position: { x: 0, y: 0, z: 0 }
        };
        
        return { ...defaults, ...options };
    }

    /**
     * Initializes the material for fish models.
     * @private
     */
    _initializeMaterial() {
        this.fishMaterial = new THREE.MeshPhongMaterial({ 
            color: this.options.color,
            specular: this.options.specular,
            emissive: this.options.emissive, 
            shininess: this.options.shininess,
            flatShading: this.options.flatShading
        });
    }

    /**
     * Builds the shoal by creating the initial number of fish.
     * @public
     */
    build() {
        for (let i = 0; i < this.options.fishCount; i++) {
            this.createFish();
        }
    }

    /**
     * Creates a single fish and adds it to the shoal.
     * @returns {THREE.Object3D} - The created fish mesh.
     * @public
     */
    createFish() {
        const fish = this._createFishInstance();
        const position = this._generateRandomPosition();
        const velocity = this._generateInitialVelocity();
        
        fish.position.copy(position);
        
        this.fishes.push(fish);
        this.velocities.push(velocity);
        this.accelerations.push(new THREE.Vector3());
        this.wanderAngles.push(Math.random() * Math.PI * 2);
        this.panicMode.push(false);
        this.panicTimer.push(0);
        
        this.add(fish);
        return fish;
    }

    /**
     * Creates a fish instance with random size and color variations.
     * @returns {THREE.Object3D} - The fish instance.
     * @private
     */
    _createFishInstance() {
        const sizeScale = 0.8 + (Math.random() - 0.5) * this.options.sizeVariation;
        const variedColor = this._generateColorVariation();
        
        const fish = new this.FishClass();
        
        fish.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material = child.material.clone();
                child.material.color = variedColor;
            }
        });

        fish.scale.setScalar(sizeScale * (this.options.fishScale || 1.0));
        fish.userData.baseSizeScale = sizeScale;
        
        return fish;
    }

    /**
     * Generates a random color variation based on the base color.
     * @returns {THREE.Color} - The varied color.
     * @private
     */
    _generateColorVariation() {
        const baseColor = new THREE.Color(this.options.color);
        const hueVariation = (Math.random() - 0.5) * this.options.colorVariation;
        const saturationVariation = (Math.random() - 0.5) * 0.4;
        
        const hsl = baseColor.getHSL({});
        return new THREE.Color().setHSL(
            hsl.h + hueVariation,
            Math.max(0, Math.min(1, hsl.s + saturationVariation)),
            hsl.l
        );
    }

    /**
     * Generates a random starting position for a fish.
     * Positions are distributed throughout the entire area, avoiding a central dead zone.
     * @returns {THREE.Vector3} - The random position.
     * @private
     */
    _generateRandomPosition() {
        const deadZoneRadius = 120.0; // Radius where fish should NOT spawn
        
        let position;
        let attempts = 0;
        const maxAttempts = 100;
        
        // Keep trying until we find a position outside the dead zone
        do {
            // Generate random position in the entire area
            const x = (Math.random() - 0.5) * this.options.areaSize;
            const y = (Math.random() - 0.5) * this.options.height;
            const z = (Math.random() - 0.5) * this.options.areaSize;
            
            position = new THREE.Vector3(x, y, z);
            
            // Check if we're too close to the center
            const horizontalDistance = Math.sqrt(x * x + z * z);
            
            attempts++;
            
            // Accept position if it's outside dead zone or we've tried too many times
            if (horizontalDistance > deadZoneRadius || attempts >= maxAttempts) {
                break;
            }
            
        } while (attempts < maxAttempts);
        
        return position;
    }

    /**
     * Generates a random initial velocity for a fish.
     * @returns {THREE.Vector3} - The initial velocity vector.
     * @private
     */
    _generateInitialVelocity() {
        const angle = Math.random() * Math.PI * 2;
        const verticalAngle = (Math.random() - 0.5) * Math.PI * 0.3; 
        
        return new THREE.Vector3(
            Math.cos(angle) * this.options.maxSpeed * 0.3,
            Math.sin(verticalAngle) * this.options.maxSpeed * 0.1,
            Math.sin(angle) * this.options.maxSpeed * 0.3
        );
    }

    // ============================
    // BVH SPATIAL ACCELERATION
    // ============================

    /**
     * Initializes the BVH (Bounding Volume Hierarchy) for spatial acceleration.
     * BVH improves neighbor finding performance for large shoals.
     * @public
     */
    initBVH() {
        this.bvhGeometry = new THREE.BufferGeometry();
        this.updateBVHGeometry();
        this.bvh = new MeshBVH(this.bvhGeometry);
    }

    /**
     * Updates the BVH geometry with current fish positions.
     * Called periodically to keep the BVH accurate.
     * @public
     */
    updateBVHGeometry() {
        if (!this.bvhGeometry || !this.bvhEnabled) return;

        const positions = [];
        const indices = [];

        for (let i = 0; i < this.fishes.length; i++) {
            const fish = this.fishes[i];
            const p = fish.getWorldPosition(new THREE.Vector3());
            
            positions.push(
                p.x, p.y, p.z,
                p.x + 0.001, p.y, p.z,
                p.x, p.y + 0.001, p.z
            );
            
            const baseIndex = i * 3;
            indices.push(baseIndex, baseIndex + 1, baseIndex + 2);
        }

        if (positions.length > 0) {
            this.bvhGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            this.bvhGeometry.setIndex(indices);
            this.bvhGeometry.computeBoundingSphere();
            this.bvh = new MeshBVH(this.bvhGeometry);
        }
    }

    /**
     * Finds neighbors using BVH spatial acceleration.
     * @param {number} fishIndex - Index of the fish to find neighbors for.
     * @param {number} radius - Search radius for neighbors.
     * @returns {number[]} - Array of neighbor indices.
     * @public
     */
    getNeighborsBVH(fishIndex, radius) {
        const neighbors = [];
        if (!this.bvh || !this.bvhEnabled || !this.fishes[fishIndex]) return neighbors;

        const position = this.fishes[fishIndex].position;
        const sphere = new THREE.Sphere(position, radius);

        this.bvh.shapecast({
            intersectsBounds: (box) => sphere.intersectsBox(box),
            intersectsTriangle: (tri, triangleIndex) => {
                const neighborIndex = Math.floor(triangleIndex / 1);
                if (neighborIndex !== fishIndex && neighborIndex < this.fishes.length) {
                    const neighborPos = this.fishes[neighborIndex].position;
                    const distance = position.distanceTo(neighborPos);
                    if (distance <= radius && !neighbors.includes(neighborIndex)) {
                        neighbors.push(neighborIndex);
                    }
                }
                return false;
            }
        });

        return neighbors;
    }

    /**
     * Toggles BVH acceleration on/off.
     * @param {boolean} enabled - Whether BVH should be enabled.
     * @public
     */
    toggleBVH(enabled) {
        this.bvhEnabled = enabled;
        if (enabled && !this.bvh) this.initBVH();
        else if (!enabled) { 
            this.bvh = null; 
            this.bvhGeometry = null; 
        }
    }

    /**
     * Gets neighbors for a fish, using BVH if enabled or brute-force if not.
     * @param {number} fishIndex - Index of the fish to find neighbors for.
     * @param {number} radius - Search radius for neighbors.
     * @returns {number[]} - Array of neighbor indices.
     * @private
     */
    _getNeighbors(fishIndex, radius) {
        if (this.bvhEnabled && this.bvh) {
            return this.getNeighborsBVH(fishIndex, radius);
        }
        
        const neighbors = [];
        const position = this.fishes[fishIndex].position;
        
        for (let i = 0; i < this.fishes.length; i++) {
            if (fishIndex !== i) {
                const distance = position.distanceTo(this.fishes[i].position);
                if (distance < radius) {
                    neighbors.push(i);
                }
            }
        }
        
        return neighbors;
    }

    // ============================
    // FLOCKING BEHAVIORS
    // ============================

    /**
     * Calculates flocking forces for a fish (separation, alignment, cohesion).
     * Implements the classic boids algorithm with boundary avoidance.
     * @param {number} fishIndex - Index of the fish to calculate forces for.
     * @returns {THREE.Vector3} - The combined flocking force vector.
     * @public
     */
    flock(fishIndex) {
        const totalForce = new THREE.Vector3(0, 0, 0);
        const alignment = new THREE.Vector3(0, 0, 0);
        const cohesion = new THREE.Vector3(0, 0, 0);
        const separation = new THREE.Vector3(0, 0, 0);
        
        const position = this.fishes[fishIndex].position;
        const velocity = this.velocities[fishIndex];
        
        let total = 0;
        const awareness = Math.max(
            this.options.separationDistance, 
            this.options.alignmentDistance, 
            this.options.cohesionDistance
        );

        // Find neighbors and calculate forces
        for (let i = 0; i < this.fishes.length; i++) {
            if (i === fishIndex) continue;
            
            const distance = position.distanceTo(this.fishes[i].position);
            if (distance > 0 && distance < awareness) {
                // Alignment: accumulate neighbor velocities
                alignment.add(this.velocities[i]);
                
                // Cohesion: accumulate neighbor positions
                cohesion.add(this.fishes[i].position);
                
                // Separation: push away (stronger when closer)
                const diff = this._tempVector.subVectors(position, this.fishes[i].position);
                diff.normalize();
                diff.divideScalar(distance);
                separation.add(diff);
                
                total++;
            }
        }

        if (total > 0) {
            // ALIGNMENT: Steer toward average direction of neighbors
            alignment.divideScalar(total);
            alignment.normalize();
            alignment.multiplyScalar(this.options.maxSpeed);
            const alignSteer = alignment.sub(velocity);
            alignSteer.clampLength(0, this.options.alignmentWeight);
            totalForce.add(alignSteer);
            
            // COHESION: Steer toward center of neighbors
            cohesion.divideScalar(total);
            const toCenter = this._tempVector.subVectors(cohesion, position);
            toCenter.normalize();
            toCenter.multiplyScalar(this.options.maxSpeed);
            const cohSteer = toCenter.sub(velocity);
            cohSteer.clampLength(0, this.options.cohesionWeight);
            totalForce.add(cohSteer);
            
            // SEPARATION: Steer away from neighbors
            separation.divideScalar(total);
            separation.normalize();
            separation.multiplyScalar(this.options.maxSpeed);
            const sepSteer = separation.sub(velocity);
            sepSteer.clampLength(0, this.options.separationWeight);
            totalForce.add(sepSteer);
        }

        // IMPROVED BOUNDARY AVOIDANCE
        const boundAvoid = new THREE.Vector3();
        const halfArea = this.options.areaSize * 0.5;
        const halfHeight = this.options.height * 0.5;
        const margin = this.options.boundsMargin;
        
        // Calculate distance to boundaries
        const distToLeft = position.x + halfArea;
        const distToRight = halfArea - position.x;
        const distToBottom = position.y + halfHeight;
        const distToTop = halfHeight - position.y;
        const distToFront = position.z + halfArea;
        const distToBack = halfArea - position.z;
        
        // Apply boundary force based on proximity (softer near boundary)
        if (distToLeft < margin) {
            boundAvoid.x += (margin - distToLeft) / margin;
        } else if (distToRight < margin) {
            boundAvoid.x -= (margin - distToRight) / margin;
        }
        
        if (distToBottom < margin) {
            boundAvoid.y += (margin - distToBottom) / margin;
        } else if (distToTop < margin) {
            boundAvoid.y -= (margin - distToTop) / margin;
        }
        
        if (distToFront < margin) {
            boundAvoid.z += (margin - distToFront) / margin;
        } else if (distToBack < margin) {
            boundAvoid.z -= (margin - distToBack) / margin;
        }
        
        if (boundAvoid.lengthSq() > 0) {
            // Normalize and apply stronger force when closer to boundary
            boundAvoid.normalize();
            
            // Calculate how close we are to the boundary (0-1)
            const closestDistance = Math.min(
                Math.min(distToLeft, distToRight),
                Math.min(distToBottom, distToTop),
                Math.min(distToFront, distToBack)
            );
            const urgency = 1.0 - (closestDistance / margin);
            
            // Apply boundary force with urgency multiplier
            boundAvoid.multiplyScalar(this.options.maxSpeed * (1.0 + urgency * 2.0));
            const boundSteer = boundAvoid.sub(velocity);
            boundSteer.clampLength(0, this.options.boundsWeight * (1.0 + urgency));
            totalForce.add(boundSteer);
        }
        
        return totalForce;
    }

    /**
     * Calculates wander force for a fish (random exploration behavior).
     * Creates a "wander circle" in front of the fish and steers toward random points on it.
     * @param {number} fishIndex - Index of the fish to calculate wander for.
     * @returns {THREE.Vector3} - The wander force vector.
     * @public
     */
    wander(fishIndex) {
        const wanderForce = new THREE.Vector3();
        this.wanderAngles[fishIndex] += (Math.random() - 0.5) * 0.3;
        
        const circleCenter = this.velocities[fishIndex].clone().normalize().multiplyScalar(2);
        const circleOffset = new THREE.Vector3(
            Math.cos(this.wanderAngles[fishIndex]) * 0.8, 
            Math.sin(this.wanderAngles[fishIndex]) * 0.3,
            Math.sin(this.wanderAngles[fishIndex] * 0.8) * 0.8
        );
        
        // Desired velocity
        const desired = circleCenter.add(circleOffset);
        desired.normalize().multiplyScalar(this.options.maxSpeed * 0.3);
        
        // Steering force = desired - current
        wanderForce.subVectors(desired, this.velocities[fishIndex]);
        
        return wanderForce;
    }

    /**
     * Calculates terrain avoidance force to prevent fish from going below terrain.
     * @param {number} fishIndex - Index of the fish to check.
     * @returns {THREE.Vector3} - The terrain avoidance force.
     * @public
     */
    avoidTerrain(fishIndex) {
        const steer = new THREE.Vector3();
        if (!this.terrain || !this.terrain.getHeightAt) return steer;

        const fish = this.fishes[fishIndex];
        const worldPos = new THREE.Vector3();
        fish.getWorldPosition(worldPos);

        const terrainHeight = this.terrain.getHeightAt(worldPos.x, worldPos.z);
        const margin = this.options.terrainMargin;
        const safeHeight = terrainHeight.y + margin;

        if (worldPos.y < safeHeight) {
            const penetration = safeHeight - worldPos.y;
            steer.y = Math.pow(penetration / margin, 2) * 5.0;
        }

        if (steer.length() > 0) {
            steer.setLength(Math.min(this.options.maxSpeed * 2, 5.0));
        }

        return steer;
    }

    /**
     * Calculates avoidance force to prevent fish from entering temple area.
     * @param {number} fishIndex - Index of the fish to check.
     * @returns {THREE.Vector3} - The temple avoidance force.
     * @public
     */
    avoidTemple(fishIndex) {
        const steer = new THREE.Vector3();
        
        // Check if temple exists and is properly initialized
        if (!this.temple || !this.temple.children || this.temple.children.length === 0) {
            return steer;
        }

        const fish = this.fishes[fishIndex];
        const worldPos = new THREE.Vector3();
        fish.getWorldPosition(worldPos);

        // Calculate temple bounding box if not already done
        if (!this._templeBox) {
            this._templeBox = new THREE.Box3();
            // IMPORTANT: Set from the temple's world position, not local
            this._templeBox.setFromObject(this.temple);
            
            // Add some margin to the bounding box for better avoidance
            const margin = 5.0; // Extra margin to keep fish away from columns
            this._templeBox.expandByScalar(margin);
            
        }

        // Check if fish is inside or near the temple bounds
        const distanceToTemple = this._templeBox.distanceToPoint(worldPos);
        const isInsideOrNear = distanceToTemple === 0 || distanceToTemple < 10.0; // Within 10 units
        
        if (!isInsideOrNear) {
            return steer;
        }

        // If fish is inside the temple box, push it out
        if (this._templeBox.containsPoint(worldPos)) {
            const center = this._templeBox.getCenter(new THREE.Vector3());
            const size = this._templeBox.getSize(new THREE.Vector3());
            const local = worldPos.clone().sub(center);

            // Find the closest face to push fish out
            const distancesToFaces = [
                { axis: 'x', distance: size.x * 0.5 - Math.abs(local.x), sign: Math.sign(local.x) },
                { axis: 'y', distance: size.y * 0.5 - Math.abs(local.y), sign: Math.sign(local.y) },
                { axis: 'z', distance: size.z * 0.5 - Math.abs(local.z), sign: Math.sign(local.z) }
            ];

            // Find the face with smallest distance (closest face)
            const closestFace = distancesToFaces.reduce((prev, curr) => 
                curr.distance < prev.distance ? curr : prev
            );

            // Create push direction based on closest face
            if (closestFace.axis === 'x') {
                steer.x = closestFace.sign;
            } else if (closestFace.axis === 'y') {
                steer.y = closestFace.sign;
            } else {
                steer.z = closestFace.sign;
            }

            // Stronger force when deeper inside
            const penetrationDepth = size[closestFace.axis] * 0.5 - Math.abs(local[closestFace.axis]);
            const maxPenetration = size[closestFace.axis] * 0.5;
            const urgency = Math.pow(penetrationDepth / maxPenetration, 2);
            
            steer.normalize().multiplyScalar(this.options.maxSpeed * (1.0 + urgency * 3.0));

        } 
        // If fish is near but not inside, apply a gentle steering away
        else if (distanceToTemple < 1.0) {
            const center = this._templeBox.getCenter(new THREE.Vector3());
            const awayFromCenter = worldPos.clone().sub(center).normalize();
            
            // Stronger force when closer
            const proximityFactor = 1.0 - (distanceToTemple / 1.0);
            steer.copy(awayFromCenter).multiplyScalar(this.options.maxSpeed * proximityFactor * 2.0);
        }

        return steer;
    }

    /**
     * Calculates danger evasion force to avoid dangerous entities (e.g., submarine).
     * Uses exponential urgency for stronger evasion when closer to danger.
     * @param {number} fishIndex - Index of the fish to check.
     * @returns {THREE.Vector3} - The danger evasion force.
     * @public
     */
    dangerEvasion(fishIndex) {
        const steer = new THREE.Vector3();
        const fishPos = new THREE.Vector3();
        this.fishes[fishIndex].getWorldPosition(fishPos);
        
        let closestDangerDistance = Infinity;
        let closestDangerDirection = new THREE.Vector3();
        let dangerDetected = false;

        for (const entity of this.dangerousEntities) {
            if (!entity.visible) continue;
            
            const entityPos = new THREE.Vector3();
            entity.getWorldPosition(entityPos);
            
            const distance = fishPos.distanceTo(entityPos);

            // Check if within danger detection range
            if (distance < this.options.dangerDetectionDistance) {
                dangerDetected = true;
                
                // Track the closest danger
                if (distance < closestDangerDistance) {
                    closestDangerDistance = distance;
                    closestDangerDirection.subVectors(fishPos, entityPos).normalize();
                }

                // Immediate evasion when very close
                if (distance < this.options.dangerEvasionDistance) {
                    const escapeDir = this._tempVector.subVectors(fishPos, entityPos).normalize();
                    const urgency = 1.0 - (distance / this.options.dangerEvasionDistance);
                    
                    // Stronger evasion force with exponential urgency
                    const evasionStrength = Math.pow(urgency, 2) * 5.0;
                    const evasionForce = escapeDir.multiplyScalar(evasionStrength);
                    
                    steer.add(evasionForce);

                    // Trigger panic if dangerously close
                    if (distance < this.options.dangerEvasionDistance * 0.5) {
                        this.panicMode[fishIndex] = true;
                        this.panicTimer[fishIndex] = this.options.panicDuration;
                    }
                }
            }
        }

        if (dangerDetected) {
            // If no immediate danger but within detection range, steer away preemptively
            if (steer.length() === 0 && closestDangerDistance < this.options.dangerDetectionDistance) {
                const detectionUrgency = 1.0 - (closestDangerDistance / this.options.dangerDetectionDistance);
                steer.copy(closestDangerDirection).multiplyScalar(detectionUrgency * 2.0);
            }
            
            // Apply stronger force when panic mode is active
            if (steer.length() > 0) {
                const speedMultiplier = this.panicMode[fishIndex] ? this.options.panicSpeedMultiplier : 1.5;
                const maxEvasionForce = this.options.maxForce * this.options.dangerEvasionWeight * speedMultiplier;
                steer.clampLength(0, maxEvasionForce);
            }
        }

        return steer;
    }

    /**
     * Updates all fish in the shoal for one frame.
     * This is the main update loop that integrates all behaviors.
     * @param {number} delta - Time delta since last frame in seconds.
     * @public
     */
    update(delta) {
        // Update BVH periodically
        if (this.bvhEnabled) {
            this.bvhFrameCount++;
            if (this.bvhFrameCount >= this.bvhUpdateFrequency) {
                this.updateBVHGeometry();
                this.bvhFrameCount = 0;
            }
        }
        
        // Use fixed time step for stability
        const fixedDelta = Math.min(delta, 0.1);
        const halfArea = this.options.areaSize * 0.5;
        const halfHeight = this.options.height * 0.5;
        
        for (let i = 0; i < this.fishes.length; i++) {
            const fish = this.fishes[i];
            
            // 1. Reset acceleration
            this.accelerations[i].set(0, 0, 0);
            
            // 2. Update panic state
            if (this.panicMode[i]) {
                this.panicTimer[i]--;
                if (this.panicTimer[i] <= 0) {
                    this.panicMode[i] = false;
                }
            }
            
            // 3. Calculate all behavioral forces
            const flockForce = this.flock(i);
            const wanderForce = this.wander(i);
            const terrainForce = this.avoidTerrain(i);
            const templeForce = this.avoidTemple(i);
            const dangerForce = this.dangerEvasion(i);
            
            // 4. Scale forces by their weights
            wanderForce.multiplyScalar(this.options.wanderStrength);
            dangerForce.multiplyScalar(this.options.dangerEvasionWeight);
            
            // 5. Add all forces to acceleration
            this.accelerations[i].add(flockForce);
            this.accelerations[i].add(wanderForce);
            this.accelerations[i].add(terrainForce);
            this.accelerations[i].add(templeForce);
            this.accelerations[i].add(dangerForce);
            
            // 6. Clamp total acceleration to prevent runaway
            const maxAcceleration = this.options.maxForce * 2;
            this.accelerations[i].clampLength(0, maxAcceleration);
            
            // 7. Update velocity with acceleration (using fixedDelta)
            this.velocities[i].addScaledVector(this.accelerations[i], fixedDelta);
            
            // 8. Limit velocity based on panic state
            let maxSpeed = this.options.maxSpeed;
            if (this.panicMode[i]) {
                maxSpeed *= this.options.panicSpeedMultiplier;
            }
            
            const currentSpeed = this.velocities[i].length();
            if (currentSpeed > maxSpeed) {
                this.velocities[i].multiplyScalar(maxSpeed / currentSpeed);
            }
            
            // 9. Update position
            fish.position.addScaledVector(this.velocities[i], fixedDelta);
            
            // 10. GENTLE BOUNDARY HANDLING - Turn fish gradually when near boundaries
            const boundaryMargin = 20; // Distance from boundary where turning starts
            const turnStrength = 0.5; // How strongly to turn away
            
            // Check each axis and gently turn fish away from boundaries
            if (fish.position.x < -halfArea + boundaryMargin) {
                // Gently push fish away from left boundary
                this.velocities[i].x += turnStrength * (1.0 - (fish.position.x + halfArea) / boundaryMargin);
            } else if (fish.position.x > halfArea - boundaryMargin) {
                // Gently push fish away from right boundary
                this.velocities[i].x -= turnStrength * (1.0 - (halfArea - fish.position.x) / boundaryMargin);
            }
            
            if (fish.position.y < -halfHeight + boundaryMargin) {
                // Gently push fish away from bottom boundary
                this.velocities[i].y += turnStrength * (1.0 - (fish.position.y + halfHeight) / boundaryMargin);
            } else if (fish.position.y > halfHeight - boundaryMargin) {
                // Gently push fish away from top boundary
                this.velocities[i].y -= turnStrength * (1.0 - (halfHeight - fish.position.y) / boundaryMargin);
            }
            
            if (fish.position.z < -halfArea + boundaryMargin) {
                // Gently push fish away from front boundary
                this.velocities[i].z += turnStrength * (1.0 - (fish.position.z + halfArea) / boundaryMargin);
            } else if (fish.position.z > halfArea - boundaryMargin) {
                // Gently push fish away from back boundary
                this.velocities[i].z -= turnStrength * (1.0 - (halfArea - fish.position.z) / boundaryMargin);
            }
            
            // 11. SOFT BOUNDARY CONSTRAINT - Gently nudge fish back if they go outside
            const softBoundaryPush = 0.1;
            
            if (fish.position.x < -halfArea) {
                fish.position.x = -halfArea + 0.1;
                this.velocities[i].x = Math.max(0.1, this.velocities[i].x);
            } else if (fish.position.x > halfArea) {
                fish.position.x = halfArea - 0.1;
                this.velocities[i].x = Math.min(-0.1, this.velocities[i].x);
            }
            
            if (fish.position.y < -halfHeight) {
                fish.position.y = -halfHeight + 0.1;
                this.velocities[i].y = Math.max(0.1, this.velocities[i].y);
            } else if (fish.position.y > halfHeight) {
                fish.position.y = halfHeight - 0.1;
                this.velocities[i].y = Math.min(-0.1, this.velocities[i].y);
            }
            
            if (fish.position.z < -halfArea) {
                fish.position.z = -halfArea + 0.1;
                this.velocities[i].z = Math.max(0.1, this.velocities[i].z);
            } else if (fish.position.z > halfArea) {
                fish.position.z = halfArea - 0.1;
                this.velocities[i].z = Math.min(-0.1, this.velocities[i].z);
            }
            
            // 12. Animation
            if (fish.animate) fish.animate(fixedDelta);
            
            // 13. Update rotation
            this._updateRotation(i);
        }
    }

    /**
     * Updates the rotation of a fish to face its direction of movement with banking.
     * @param {number} fishIndex - Index of the fish to update.
     * @private
     */
    _updateRotation(fishIndex) {
        const fish = this.fishes[fishIndex];
        const velocity = this.velocities[fishIndex];
        
        if (velocity.lengthSq() < 0.0001) return;

        // Calculate target rotation
        const targetPos = this._tempVector.copy(fish.position).sub(velocity);
        
        this._tempObject.position.copy(fish.position);
        this._tempObject.up.set(0, 1, 0);
        this._tempObject.lookAt(targetPos);

        // Calculate banking
        this._tempEuler.setFromQuaternion(fish.quaternion, 'YXZ');
        const currentY = this._tempEuler.y;
        
        this._tempEuler.setFromQuaternion(this._tempObject.quaternion, 'YXZ');
        const targetY = this._tempEuler.y;

        // Handle angle wrapping
        let deltaY = targetY - currentY;
        if (deltaY > Math.PI) deltaY -= Math.PI * 2;
        if (deltaY < -Math.PI) deltaY += Math.PI * 2;

        // Apply banking based on turn rate
        const bankAmount = -deltaY * 4.5;
        const clampedBank = Math.max(-0.6, Math.min(0.6, bankAmount));

        const rollQuat = new THREE.Quaternion();
        rollQuat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), clampedBank);
        this._tempObject.quaternion.multiply(rollQuat);

        // Smooth rotation interpolation
        const smoothness = this.panicMode[fishIndex] ? 0.35 : this.options.rotationSmoothness;
        fish.quaternion.slerp(this._tempObject.quaternion, smoothness);
    }

    // ============================
    // PUBLIC API METHODS
    // ============================

    /**
     * Adds a dangerous entity that fish should avoid.
     * @param {THREE.Object3D} entity - The dangerous entity to add.
     * @public
     */
    addDangerousEntity(entity) {
        if (!this.dangerousEntities.includes(entity)) {
            this.dangerousEntities.push(entity);
        }
    }

    /**
     * Removes a dangerous entity from the avoidance list.
     * @param {THREE.Object3D} entity - The dangerous entity to remove.
     * @public
     */
    removeDangerousEntity(entity) {
        const index = this.dangerousEntities.indexOf(entity);
        if (index > -1) {
            this.dangerousEntities.splice(index, 1);
        }
    }

    /**
     * Adds new fish to the shoal.
     * @param {number} count - Number of fish to add.
     * @public
     */
    addFish(count = 1) {
        for (let i = 0; i < count; i++) {
            this.createFish();
        }
    }

    /**
     * Removes fish from the shoal.
     * @param {number} count - Number of fish to remove.
     * @public
     */
    removeFish(count = 1) {
        const removeCount = Math.min(count, this.fishes.length);
        for (let i = 0; i < removeCount; i++) {
            const fish = this.fishes.pop();
            this.velocities.pop();
            this.accelerations.pop();
            this.wanderAngles.pop();
            this.panicMode.pop();
            this.panicTimer.pop();
            if (fish) this.remove(fish);
        }
    }

    /**
     * Updates flocking parameters dynamically.
     * @param {Object} parameters - New parameter values to merge.
     * @public
     */
    setFlockingParameters(parameters) {
        this.options = { ...this.options, ...parameters };
    }

    /**
     * Sets the scale of all fish in the shoal.
     * @param {number} scale - New scale factor for fish.
     * @public
     */
    setFishScale(scale) {
        this.options.fishScale = scale;
        this.fishes.forEach(fish => {
            const sizeScale = fish.userData.baseSizeScale || 1.0;
            fish.scale.setScalar(sizeScale * scale);
        });
    }

    /**
     * Gets statistics about the shoal's current state.
     * @returns {Object} - Statistics object with shoal metrics.
     * @public
     */
    getFlockingStats() {
        let avgSpeed = 0;
        let avgDistance = 0;
        let count = 0;
        const panicCount = this.panicMode.filter(mode => mode).length;

        for (let i = 0; i < this.fishes.length; i++) {
            avgSpeed += this.velocities[i].length();
            
            const neighbors = this._getNeighbors(i, this.options.cohesionDistance * 2);
            for (const j of neighbors) {
                if (j > i) {
                    avgDistance += this.fishes[i].position.distanceTo(this.fishes[j].position);
                    count++;
                }
            }
        }

        return {
            fishCount: this.fishes.length,
            averageSpeed: avgSpeed / this.fishes.length,
            averageDistance: count > 0 ? avgDistance / count : 0,
            panicCount: panicCount,
            dangerousEntities: this.dangerousEntities.length,
            bvhEnabled: this.bvhEnabled,
            optimization: this.bvhEnabled ? 'BVH Accelerated' : 'Standard',
            performance: this.fishes.length > 50 ? (this.bvhEnabled ? 'Optimized' : 'Needs BVH') : 'Good'
        };
    }
}

export { MyShoal };