
// MyShark.js
// Defines the MyShark class, a skinned, animated shark with procedural geometry and path-following logic.
// All methods and classes are documented for clarity and maintainability.

import * as THREE from 'three';


/**
 * MyShark
 * Represents a shark with procedural geometry, skeletal animation, and path-following logic.
 * Inherits from THREE.Group.
 */
class MyShark extends THREE.Group {
    /**
     * Constructs a new MyShark instance, sets up geometry, skeleton, and path-following state.
     */
    constructor() {
        super();

        /**
         * Array of bones for skeletal animation.
         * @type {THREE.Bone[]}
         */
        this.bones = [];
        /**
         * Last animation time (ms).
         * @type {number}
         */
        this.lastTime = performance.now();

        /**
         * Material for the shark mesh.
         * @type {THREE.MeshPhongMaterial}
         */
        this.material = new THREE.MeshPhongMaterial({
            color: '#679cd8',
            specular: '#000000',
            emissive: '#000000',
            shininess: 90,
            flatShading: false,
        });

        this.createBody();
        this.createSkeleton();
        this.bindSkeleton();

        /**
         * Maximum radius for path generation.
         * @type {number}
         */
        this.radius = 111;
        /**
         * Length of each path segment.
         * @type {number}
         */
        this.segmentLength = 20;
        /**
         * Maximum turn angle in degrees.
         * @type {number}
         */
        this.maxAngleDegrees = 45;
        /**
         * Maximum turn angle in radians.
         * @type {number}
         */
        this.maxAngleRadians = (this.maxAngleDegrees * Math.PI) / 180;

        /**
         * Array of path points for the shark to follow.
         * @type {THREE.Vector3[]}
         */
        this.pathPoints = [];
        /**
         * Current segment index in the path.
         * @type {number}
         */
        this.currentSegmentIndex = 0;
        /**
         * Progress along the current segment (0-1).
         * @type {number}
         */
        this.segmentProgress = 0;
        /**
         * Movement speed along the path.
         * @type {number}
         */
        this.speed = 0.018;
        /**
         * Look-ahead distance for path following (not used directly).
         * @type {number}
         */
        this.lookAheadDistance = 2;

        /**
         * Base vertical position for the shark and parameters for vertical variation.
         */
        this.baseHeight = 20;
        this.heightAmplitude = 3; // max vertical offset from baseHeight
        this.heightFrequency = 0.001; // frequency for subtle runtime bobbing

        /**
         * Inner radius barrier: when the shark gets closer than this, it will turn outward.
         */
        this.innerRadius = 30;

        this.generateInitialPath();
    }

    /**
     * Creates the procedural geometry for the shark, sets up skinning attributes.
     */
    createBody() {
        const vert = new Float32Array([
            //head
            -0.75, 0 , 0.5, //0
            0.75, 0, 0.5, //1
            0, 1, 0,  //2
            0, 2, 3, //3
            -1.75, 0, 4, //4
            1.75, 0, 4, //5
            0, -1, 3.75, //6
            0, 2.5, 3.75, //7

            //body
            3, 0, 8, //2
            -3, 0, 8, //3
            2.25, 1.75, 8, //5
            -2.25, 1.75, 8, //6
            0, 3.5, 8, //7
            0, -2.5, 8, //8
            0, 3.25, 12, //10
            0, 2.25, 15, //11
            2, 0, 15, //12
            -2, 0, 15, //13
            0, -2.25, 9, //14
            0, -1.5, 15, //15 - 19

            // tail
            0, 1.25, 20, //4 t
            0, -1, 20, //5 b
            1, 0, 20, //6 r
            -1, 0, 20, //7 l
            0, 1, 22.5, //8 t
            0, -0.75, 22.5, //9 b
            0.75, 0, 22, //10 r
            -0.75, 0, 22, //11 l
            0, 0, 25, //12 tip - 27

            // back fin
            0, 5, 27, //5 t fin
            0.5, 0, 23, //6
            -0.5, 0, 23, //7
            0, -3, 26, //8 b fin
            0.5, 0, 23, //9
            -0.5, 0, 23, //10 - 33

            // top fin
            0, 3.5, 8, //0  top
            0, 3.25, 12, //1 sTop
            0, 7.5, 11.5, //2 fTop
            0.5, 2.75, 10, //3 right
            -0.5, 2.75, 10, //4 left

            // right fin
            2, 0, 5.5, //0 f
            2.75, 0, 9.5, //1 b
            2.25, 0.75, 7.5, //2 t
            1.5, -0.75, 7.5, //3 b
            6, -2.25, 9.5, // 4 p

            // left fin
            -2, 0, 5.5, //0 f
            -2.75, 0, 9.5, //1 b
            -2.25, 0.75, 7.5, //2 t
            -1.5, -0.75, 7.5, //3 b
            -6, -2.25, 9.5, // 4 p

            // small right fin
            1, 0, 16.05,       //0 f
            1.375, 0, 18.05,   //1 b
            1.125, 0.375, 17.05, //2 t
            0.75, -0.375, 17.05, //3 b
            3, -1.125, 18.05,  //4 p

            // small left fin
            -1, 0, 16.05,      //0 f
            -1.375, 0, 18.05,  //1 b
            -1.125, 0.375, 17.05, //2 t
            -0.75, -0.375, 17.05, //3 b
            -3, -1.125, 18.05   //4 p
        ]);

        const ind = [
            // head
            0, 2, 1,
            4, 7, 2,
            5, 2, 7,
            0, 4, 2,
            1, 2, 5,
            0, 6, 4,
            1, 5, 6,
            0, 1, 6,
            6, 7, 4,
            6, 5, 7,

            // body
            4, 11, 7,
            5, 7, 10,
            5, 10, 8,
            4, 9, 11,
            10, 7, 12,
            11, 12, 7,
            14, 10, 12,
            14, 12, 11,
            15, 10, 14,
            15, 14, 11,
            17, 11, 9,
            16, 8, 10,
            10, 15, 16,
            11, 17, 15,
            18, 5, 8,
            18, 9, 4,
            18, 6, 5,
            18, 4, 6,
            18, 8, 16,
            18, 17, 9,
            19, 18, 16,
            19, 17, 18,
            19,16,15,
            19,15,17,

            // tail
            15, 20, 16,
            15, 17, 20,
            19, 16, 21,
            19, 21, 17,
            17, 23, 20,
            16, 20, 22,
            17, 21, 23,
            16, 22, 21,
            20, 24, 26,
            20, 27, 24,
            21, 26, 25,
            21, 25, 27,
            22, 20, 26,
            23, 27, 20,
            22, 26, 21,
            23, 21, 27,

            // back fin
            24,28,26,
            24,27,28,
            25,26,28,
            25,28,27,
            24,29,30,
            24,31,29,
            28,30,29,
            28,29,31,
            25,33,32,
            25,32,34,
            28,32,33,
            28,34,32,

            // top fin
            35, 37, 38,
            36, 38, 37,
            35, 39, 37,
            36, 37, 39,

            // right fin
            40, 42, 44,
            40, 44, 43,
            41, 44, 42,
            41, 43, 44,     

            // left fin
            45, 49, 47,
            45, 48, 49,
            46, 47, 49,
            46, 49, 48,

            // small right fin
            50, 52, 54,
            50, 54, 53,
            51, 54, 52,
            51, 53, 54,     

            // small left fin
            55, 59, 57,
            55, 58, 59,
            56, 57, 59,
            56, 59, 58,
        ];

        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(vert, 3));
        this.geometry.setIndex(ind);
        this.geometry.computeVertexNormals();
        this.geometry.normalizeNormals();

        const vertexCount = this.geometry.attributes.position.count;

        const skinIndices = [];
        const skinWeights = [];
        for (let i = 0; i < vertexCount; i++) {
            const z = this.geometry.attributes.position.getZ(i);

            let weights = [0, 0, 0, 0];

            if (z < 8) { 
                weights[0] = 1;
            } else if (z < 15) {
                weights[1] = 1 - (z - 8)/7;
                weights[2] = (z - 8)/7;
            } else {
                weights[2] = 1 - (z - 15)/10;
                weights[3] = (z - 15)/10;
            }

            skinIndices.push(0,1,2,3);
            skinWeights.push(weights[0], weights[1], weights[2], weights[3]);
        }

        this.geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
        this.geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));
    }

    /**
     * Creates the skeleton (bones) for the shark and builds the hierarchy.
     */
    createSkeleton() {
        const positions = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 8), 
            new THREE.Vector3(0, 0, 15), 
            new THREE.Vector3(0, 0, 25)  
        ];

        let prevBone = null;
        positions.forEach((pos) => {
            const bone = new THREE.Bone();
            bone.position.copy(pos);
            if (prevBone) prevBone.add(bone);
            this.bones.push(bone);
            prevBone = bone;
        });
    }

    /**
     * Binds the skeleton to the geometry and creates the skinned mesh.
     */
    bindSkeleton() {
        this.skinnedMesh = new THREE.SkinnedMesh(this.geometry, this.material);
        this.skinnedMesh.castShadow = true;
        this.skinnedMesh.receiveShadow = true;
        const skeleton = new THREE.Skeleton(this.bones);
        this.skinnedMesh.add(this.bones[0]); 
        this.skinnedMesh.bind(skeleton);
        this.add(this.skinnedMesh);
    }

    /**
     * Computes a cubic Catmull-Rom spline interpolation for smooth path following.
     * @param {number} p0 - First control point.
     * @param {number} p1 - Second control point.
     * @param {number} p2 - Third control point.
     * @param {number} p3 - Fourth control point.
     * @param {number} t - Interpolation parameter (0-1).
     * @returns {number} Interpolated value.
     */
    cubic(p0, p1, p2, p3, t) {
        const t2 = t * t, t3 = t2 * t;
        return 0.5 * (
            (2 * p1) +
            (-p0 + p2) * t +
            (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
            (-p0 + 3 * p1 - 3 * p2 + p3) * t3
        );
    }

    /**
     * Generates the initial random path for the shark to follow, using cubic splines.
     */
    generateInitialPath() {
        // spawn at a fixed start position per request
        const startPoint = new THREE.Vector3(30, 20, 30);
        
        this.pathPoints.push(startPoint);
        
        let currentDirection = Math.random() * Math.PI * 2;
        
        const numKeyframes = 20;
        
        for (let i = 0; i < numKeyframes; i++) {
            const lastPoint = this.pathPoints[this.pathPoints.length - 1];
            
            const angleChange = (Math.random() - 0.5) * 2 * this.maxAngleRadians;
            currentDirection += angleChange;
            
            const y = this.baseHeight + Math.sin(i * 0.6) * (this.heightAmplitude * 0.6) + (Math.random() - 0.5) * 1.0;
            const nextPoint = new THREE.Vector3(
                lastPoint.x + Math.cos(currentDirection) * this.segmentLength,
                y,
                lastPoint.z + Math.sin(currentDirection) * this.segmentLength
            );
            
            const distanceFromCenter = Math.sqrt(nextPoint.x * nextPoint.x + nextPoint.z * nextPoint.z);

            if (distanceFromCenter > this.radius) {
                const angleToCenter = Math.atan2(-lastPoint.z, -lastPoint.x);

                const turnStrength = (distanceFromCenter - this.radius) / (this.radius * 0.1);
                currentDirection = this.lerpAngle(currentDirection, angleToCenter, Math.min(turnStrength, 0.5));

                nextPoint.x = lastPoint.x + Math.cos(currentDirection) * this.segmentLength;
                nextPoint.z = lastPoint.z + Math.sin(currentDirection) * this.segmentLength;
            } else if (distanceFromCenter < this.innerRadius) {
                // steer outward if too close to center
                const angleAway = Math.atan2(lastPoint.z, lastPoint.x);
                const turnStrength = (this.innerRadius - distanceFromCenter) / this.innerRadius;
                currentDirection = this.lerpAngle(currentDirection, angleAway, Math.min(turnStrength, 0.5));

                nextPoint.x = lastPoint.x + Math.cos(currentDirection) * this.segmentLength;
                nextPoint.z = lastPoint.z + Math.sin(currentDirection) * this.segmentLength;
            }
            
            this.pathPoints.push(nextPoint);
        }
        
        this.position.copy(this.pathPoints[0]);
    }

    /**
     * Linearly interpolates between two angles, handling wrapping.
     * @param {number} a - Start angle (radians).
     * @param {number} b - End angle (radians).
     * @param {number} t - Interpolation parameter (0-1).
     * @returns {number} Interpolated angle.
     */
    lerpAngle(a, b, t) {
        let diff = b - a;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        return a + diff * t;
    }

    /**
     * Extends the path with additional random segments as the shark moves forward.
     */
    extendPath() {
        let lastPoint = this.pathPoints[this.pathPoints.length - 1];
        const secondLastPoint = this.pathPoints[this.pathPoints.length - 2];
        
        if (!lastPoint || !secondLastPoint) return;
        
        let currentDirection = Math.atan2(
            lastPoint.z - secondLastPoint.z,
            lastPoint.x - secondLastPoint.x
        );
        
        for (let i = 0; i < 5; i++) {
            const angleChange = (Math.random() - 0.5) * 2 * this.maxAngleRadians;
            currentDirection += angleChange;
            
            let nextPoint = new THREE.Vector3(
                lastPoint.x + Math.cos(currentDirection) * this.segmentLength,
                this.baseHeight + Math.sin((this.pathPoints.length + i) * 0.5) * (this.heightAmplitude * 0.6) + (Math.random() - 0.5) * 1.0,
                lastPoint.z + Math.sin(currentDirection) * this.segmentLength
            );
            
            const distanceFromCenter = Math.sqrt(nextPoint.x * nextPoint.x + nextPoint.z * nextPoint.z);

            if (distanceFromCenter > this.radius * 0.9) {
                const angleToCenter = Math.atan2(-lastPoint.z, -lastPoint.x);
                const turnStrength = (distanceFromCenter - this.radius * 0.9) / (this.radius * 0.1);
                currentDirection = this.lerpAngle(currentDirection, angleToCenter, Math.min(turnStrength, 0.5));

                nextPoint.x = lastPoint.x + Math.cos(currentDirection) * this.segmentLength;
                nextPoint.z = lastPoint.z + Math.sin(currentDirection) * this.segmentLength;
            } else if (distanceFromCenter < this.innerRadius) {
                // steer outward if too close to center
                const angleAway = Math.atan2(lastPoint.z, lastPoint.x);
                const turnStrength = (this.innerRadius - distanceFromCenter) / this.innerRadius;
                currentDirection = this.lerpAngle(currentDirection, angleAway, Math.min(turnStrength, 0.5));

                nextPoint.x = lastPoint.x + Math.cos(currentDirection) * this.segmentLength;
                nextPoint.z = lastPoint.z + Math.sin(currentDirection) * this.segmentLength;
            }
            
            this.pathPoints.push(nextPoint);
            lastPoint = nextPoint;
        }
        
        if (this.pathPoints.length > 50) {
            const removeCount = 5;
            this.pathPoints.splice(0, removeCount);
            this.currentSegmentIndex -= removeCount;
            if (this.currentSegmentIndex < 0) this.currentSegmentIndex = 0;
        }
    }

    /**
     * Updates the shark's position and orientation along the path.
     */
    updatePath() {
        this.segmentProgress += this.speed;
        
        if (this.segmentProgress >= 1.0) {
            this.segmentProgress = 0;
            this.currentSegmentIndex++;
            
            if (this.currentSegmentIndex >= this.pathPoints.length - 3) {
                this.extendPath();
            }
        }
        
        if (this.currentSegmentIndex + 2 >= this.pathPoints.length) {
            this.extendPath();
        }
        
        const i = this.currentSegmentIndex;
        
        const p0Index = Math.max(0, i - 1);
        const p1Index = i;
        const p2Index = Math.min(this.pathPoints.length - 1, i + 1);
        const p3Index = Math.min(this.pathPoints.length - 1, i + 2);
        
        const p0 = this.pathPoints[p0Index];
        const p1 = this.pathPoints[p1Index];
        const p2 = this.pathPoints[p2Index];
        const p3 = this.pathPoints[p3Index];

        if (!p0 || !p1 || !p2 || !p3) {
            this.extendPath();
            return;
        }
        
        const newPosition = new THREE.Vector3(
            this.cubic(p0.x, p1.x, p2.x, p3.x, this.segmentProgress),
            this.cubic(p0.y, p1.y, p2.y, p3.y, this.segmentProgress),
            this.cubic(p0.z, p1.z, p2.z, p3.z, this.segmentProgress)
        );

        this.position.copy(newPosition);
        const bob = Math.sin(performance.now() * this.heightFrequency) * this.heightAmplitude * 0.5;
        this.position.y += bob;
        
        const t = this.segmentProgress;
        const t2 = t * t;
        
        const dx = 0.5 * (
            (-p0.x + p2.x) +
            2 * (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t +
            3 * (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t2
        );
        
        const dz = 0.5 * (
            (-p0.z + p2.z) +
            2 * (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t +
            3 * (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t2
        );
        
        if (dx !== 0 || dz !== 0) {
            const targetRotation = Math.atan2(-dx, -dz);
            this.rotation.y = targetRotation;
        }
    }

    /**
     * Animates the shark's bones to create a swimming motion.
     */
    swimAnimation() {
        const now = performance.now();
        this.lastTime = now;

        const amplitudes = [0.08, 0.08, 0.08, 0.08];
        const phases = [1, 2, 4, 6];
        this.bones.forEach((bone, i) => {
            bone.rotation.y = Math.sin(now * 0.0035 - phases[i]) * amplitudes[i];
        });
    }

    /**
     * Updates the shark's path following and swimming animation. Call this in the render loop.
     */
    update() {
        this.updatePath();
        this.swimAnimation();
    }

    /**
     * Sets the emissive color of the shark when selected or deselected.
     * @param {boolean} selected - Whether the shark is selected.
     */
    onSelect(selected) {
        const emissiveColor = selected ? 0xffaa00 : 0x000000;
        this.material.emissive.setHex(emissiveColor);
    }

    /**
     * Creates a THREE.Line visualization of the shark's path and adds it to the scene.
     * @param {THREE.Scene} scene - The scene to add the path visualization to.
     * @returns {THREE.Line} The created line object.
     */
    createPathVisualization(scene) {
        const points = this.pathPoints.map(p => new THREE.Vector3(p.x, p.y, p.z));
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        const line = new THREE.Line(geometry, material);
        scene.add(line);
        return line;
    }
}


// Export the MyShark class for use in other modules.
export { MyShark };