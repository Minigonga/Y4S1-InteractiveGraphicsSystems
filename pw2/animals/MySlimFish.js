
// MySlimFish.js
// Defines the MySlimFish class, a skinned, LOD-enabled fish with procedural geometry and skeletal animation for use in shoals.
// All methods and classes are documented for clarity and maintainability.

import * as THREE from 'three';


/**
 * MySlimFish
 * Represents a slim fish with skeletal animation and LOD for use in shoals.
 * Inherits from THREE.Group and contains both high and low detail meshes.
 */
class MySlimFish extends THREE.Group {
    /**
     * Constructs a new MySlimFish instance, sets up materials, LOD, and geometry.
     */
    constructor() {
        super();

        /**
         * Material used for the fish mesh.
         * @type {THREE.MeshPhongMaterial}
         */
        this.shoalFishMaterial = new THREE.MeshPhongMaterial({
            color: '#8dcec7',
            specular: '#000000',
            emissive: '#000000',
            shininess: 90,
        });

        /**
         * Speed of the swimming animation.
         * @type {number}
         */
        this.swimSpeed = 0.01;

        /**
         * Amplitude of the swimming animation.
         * @type {number}
         */
        this.swimAmplitude = 0.3;

        /**
         * LOD (Level of Detail) object containing high and low detail meshes.
         * @type {THREE.LOD}
         */
        this.lod = new THREE.LOD();
        this.add(this.lod);

        this.createBody();
        this.createLowLod();
    }

    /**
     * Creates the high-detail geometry, mesh, and skeleton for the fish, and adds it to the LOD.
     */
    createBody() {
        const vertices = new Float32Array([
            // Head (0-4)
            0, 1, 1, //0
            0, -1, 1, //1
            0.75,0,1, //2
            -0.75,0,1, //3
            0, 0, -1, //4

            // Body (5-16)
            0, 1, 1, //5
            0, -1, 1, //6
            0.75,0,1, //7
            -0.75,0,1, //8
            0, 1.5, 4, //9
            1,0,4, //10
            -1,0,4, //11
            0, -1.5, 4, //12
            0, 1, 6, //13
            0, -1, 6, //14
            0.75,0,6, //15
            -0.75,0,6, //16

            // Tail (17-24)
            0, 1, 6, //17
            0, -1, 6, //18
            0.75,0,6, //19
            -0.75,0,6, //20
            0, 0.75, 8, //21
            0, -0.75, 8, //22
            0.5,0,8, //23
            -0.5,0,8, //24

            // Back Fin (25-32)
            0, 1.75, 10, //25
            0, -1.75, 10, //26
            0, 0.75, 8, //27
            0, -0.75, 8, //28
            0.5,0,8, //29
            -0.5,0,8, //30
            0, 0.5,9, //31
            0, -0.5,9, //32

            // Top Fin (33-37)
            0, 1.5, 4, //33
            0, 1, 5.5, //34
            0.5,0.75,4.75, //35
            -0.5,0.75,4.75, //36
            0, 2.75, 5.5, //37

            // Side Fin Right (38-42)
            0.5, 0, 1.5, //38
            0.5, 0, 3.5, //39
            0.5, 0.5, 2.5, //40
            0.5, -0.5, 2.5, //41
            1.5, -1.75, 4, //42

            // Side Fin Left (43-47)
            -0.5, 0, 1.5, //43
            -0.5, 0, 3.5, //44
            -0.5, 0.5, 2.5, //45
            -0.5, -0.5, 2.5, //46
            -1.5, -1.75, 4, //47
        ]);

        const indices = [
            // Head
            0,2,4,
            0,4,3,
            1,4,2,
            1,3,4,

            // Body
            5,9,7,
            5,8,9,
            10,7,9,
            11,9,8,
            6,7,12,
            6,12,8,
            10,12,7,
            11,8,12,
            13,10,9,
            13,9,11,
            13,15,10,
            13,11,16,
            14,12,10,
            14,11,12,
            14,10,15,
            14,16,11,

            // Tail
            17,21,19,
            17,20,21,
            18,19,22,
            18,22,20,
            21,23,19,
            21,20,24,
            22,19,23,
            22,24,20,

            // Back Fin
            31,32,29,
            31,30,32,
            31,29,25,
            31,25,30,
            25,29,27,
            25,27,30,
            32,26,29,
            32,30,26,
            26,28,29,
            26,30,28,

            // Top Fin
            37,35,33,
            37,34,35,
            37,33,36,
            37,36,34,

            // Side Fin Right
            38, 40, 42,
            38, 42, 41,
            39, 42, 40,
            39, 41, 42,

            // Side Fin Left
            43, 47, 45,
            43, 46, 47,
            44, 45, 47,
            44, 47, 46,
        ];

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        geometry.normalizeNormals();

        // Create skinned mesh first
        /**
         * Skinned mesh for high detail rendering.
         * @type {THREE.SkinnedMesh}
         */
        this.skinnedMesh = new THREE.SkinnedMesh(geometry, this.shoalFishMaterial);
        this.skinnedMesh.frustumCulled = false;

        // Create bones for animation
        this.createSkeleton(geometry);

        // Add high detail mesh to LOD at distance 0-30
        this.lod.addLevel(this.skinnedMesh, 0);
    }

    /**
     * Creates a low-detail mesh for distant rendering and adds it to the LOD.
     */
    createLowLod() {
        const vertices = new Float32Array([
            // Head (pointed front)
            0, 0.2, 0,    //0 - top front
            0, -0.2, 0,   //1 - bottom front
            0.2, 0, 0,    //2 - right front
            -0.2, 0, 0,   //3 - left front
            
            // Body (wider middle section)
            0, 0.8, 2,    //4 - top mid
            0, -0.8, 2,   //5 - bottom mid
            0.6, 0, 2,    //6 - right mid
            -0.6, 0, 2,   //7 - left mid
            
            // Tail base (narrower)
            0, 0.5, 4,    //8 - top back
            0, -0.5, 4,   //9 - bottom back
            0.3, 0, 4,    //10 - right back
            -0.3, 0, 4,   //11 - left back
            
            // Tail fin (flat end)
            0, 0.8, 5,    //12 - top tail
            0, -0.8, 5,   //13 - bottom tail
        ]);

        const indices = [
            // Front point to body - top
            0, 2, 4,
            0, 4, 3,
            // Front point to body - bottom
            1, 4, 2,
            1, 3, 4,
            
            // Head to body connection - right
            0, 6, 2,
            0, 4, 6,
            // Head to body connection - left
            0, 7, 4,
            0, 3, 7,
            // Head to body connection - bottom right
            1, 2, 6,
            1, 6, 5,
            // Head to body connection - bottom left
            1, 7, 3,
            1, 5, 7,
            
            // Body to tail - top right
            4, 10, 6,
            4, 8, 10,
            // Body to tail - top left
            4, 11, 8,
            4, 7, 11,
            // Body to tail - bottom right
            5, 6, 10,
            5, 10, 9,
            // Body to tail - bottom left
            5, 11, 7,
            5, 9, 11,
            
            // Tail to fin - top right
            8, 12, 10,
            // Tail to fin - top left
            8, 11, 12,
            // Tail to fin - bottom right
            9, 10, 13,
            10, 12, 13,
            // Tail to fin - bottom left
            9, 13, 11,
            11, 13, 12,
        ];

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        geometry.normalizeNormals();

        // Create simple mesh for low LOD
        /**
         * Low detail mesh for LOD.
         * @type {THREE.Mesh}
         */
        this.lowLodMesh = new THREE.Mesh(geometry, this.shoalFishMaterial);
        this.lowLodMesh.frustumCulled = false;

        this.lowLodMesh.scale.set(2, 2, 2); 
        this.lod.addLevel(this.lowLodMesh, 45);
    }

    /**
     * Creates the skeleton (bones) for the fish, adds them to the skinned mesh, and binds the skeleton.
     * @param {THREE.BufferGeometry} geometry - The geometry to apply skinning to.
     */
    createSkeleton(geometry) {
        // Create bones along the fish body from head to tail
        /**
         * Array of bones for skeletal animation.
         * @type {THREE.Bone[]}
         */
        this.bones = [];

        // Bone positions along the Z-axis (head is at 0, tail extends back)
        const bonePositions = [
            new THREE.Vector3(0, 0, -1),     // Head (bone 0)
            new THREE.Vector3(0, 0, 2),      // Front body (bone 1)
            new THREE.Vector3(0, 0, 4),      // Mid body (bone 2)
            new THREE.Vector3(0, 0, 6),      // Back body (bone 3)
            new THREE.Vector3(0, 0, 8),      // Tail start (bone 4)
            new THREE.Vector3(0, 0, 10)      // Tail end (bone 5)
        ];

        // Create bones and build hierarchy
        let prevBone = null;
        let rootBone = null;
        bonePositions.forEach((pos, i) => {
            const bone = new THREE.Bone();
            bone.position.copy(pos);

            if (prevBone) {
                // Make this bone relative to previous bone
                bone.position.sub(bonePositions[i - 1]);
                prevBone.add(bone);
            } else {
                // Store root bone to add to mesh later
                rootBone = bone;
            }

            this.bones.push(bone);
            prevBone = bone;
        });

        // Add root bone to skinned mesh
        this.skinnedMesh.add(rootBone);

        // Apply skinning weights to vertices
        this.applySkinning(geometry);

        // Create and bind skeleton
        const skeleton = new THREE.Skeleton(this.bones);
        this.skinnedMesh.bind(skeleton);
    }

    /**
     * Applies skinning weights to the geometry's vertices based on their Z position.
     * @param {THREE.BufferGeometry} geometry - The geometry to apply skinning to.
     */
    applySkinning(geometry) {
        const vertexCount = geometry.attributes.position.count;
        const skinIndices = [];
        const skinWeights = [];

        // Assign bone weights based on Z position
        for (let i = 0; i < vertexCount; i++) {
            const z = geometry.attributes.position.getZ(i);
            const weights = this.calculateBoneWeights(z);

            // Each vertex can be influenced by up to 4 bones
            skinIndices.push(weights.indices[0], weights.indices[1], weights.indices[2], weights.indices[3]);
            skinWeights.push(weights.weights[0], weights.weights[1], weights.weights[2], weights.weights[3]);
        }

        geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
        geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));
    }

    /**
     * Calculates bone indices and weights for a given Z position.
     * @param {number} z - The Z position of the vertex.
     * @returns {{indices: number[], weights: number[]}} Bone indices and weights.
     */
    calculateBoneWeights(z) {
        // Define bone influence zones based on Z position
        const boneZones = [-1, 2, 4, 6, 8, 10]; // Matches bone positions

        const weights = { indices: [0, 0, 0, 0], weights: [0, 0, 0, 0] };

        // Find which bones influence this vertex
        for (let i = 0; i < boneZones.length - 1; i++) {
            if (z >= boneZones[i] && z < boneZones[i + 1]) {
                const t = (z - boneZones[i]) / (boneZones[i + 1] - boneZones[i]);
                weights.indices[0] = i;
                weights.indices[1] = i + 1;
                weights.weights[0] = 1 - t;
                weights.weights[1] = t;
                return weights;
            }
        }

        // Handle head vertices (before first bone)
        if (z < boneZones[0]) {
            weights.indices[0] = 0;
            weights.weights[0] = 1;
            return weights;
        }

        // Handle tail vertices (after last bone)
        if (z >= boneZones[boneZones.length - 1]) {
            weights.indices[0] = boneZones.length - 1;
            weights.weights[0] = 1;
            return weights;
        }

        return weights;
    }

    /**
     * Animates the fish by applying a wave motion to the bones from head to tail.
     * Call this in the render loop to update the swimming animation.
     * @param {number} deltaTime - Time since last frame (not used, but kept for compatibility).
     */
    animate(deltaTime) {
        if (!this.bones) return;

        const time = performance.now();

        // Animate bones with wave motion from head to tail
        const amplitudes = [0.05, 0.15, 0.25, 0.35, 0.45, 0.8]; // Increasing amplitude towards tail
        const phases = [0, 0.5, 1, 1.5, 2, 2.5]; // Phase shift for wave propagation

        this.bones.forEach((bone, i) => {
            if (bone && i > 0) { // Skip root bone
                // Rotate around Y-axis for side-to-side swimming motion
                bone.rotation.y = Math.sin(time * this.swimSpeed - phases[i]) * amplitudes[i] * this.swimAmplitude;
            }
        });

        // Update bone matrices
        if (this.bones[0]) {
            this.bones[0].updateMatrixWorld(true);
        }
    }
    
    /**
     * Updates the LOD selection based on camera distance. Call this in your render loop.
     * @param {THREE.Camera} camera - The camera to determine LOD level.
     */
    update(camera) {
        this.lod.update(camera);
    }
    /**
     * Sets the emissive color of the starfish when selected or deselected.
     * @param {boolean} selected - Whether the starfish is selected.
     */
    onSelect(selected) {
        const emissiveColor = selected ? 0xffaa00 : 0x000000;
        this.traverse(child => {
            if (child.isMesh && child.material) {
                const materials = Array.isArray(child.material)
                    ? child.material
                    : [child.material];

                materials.forEach(mat => {
                    if (mat.emissive) {
                        mat.emissive.setHex(emissiveColor);
                        mat.needsUpdate = true;
                    }
                });
            }
        });
    }
}

// Export the MySlimFish class for use in other modules.
export { MySlimFish };