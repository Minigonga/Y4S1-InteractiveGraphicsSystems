
// MyBreamFish.js
// Implements a detailed, LOD-optimized, skinned and animated bream fish for the underwater scene.
// All classes and methods are documented for clarity and maintainability.

import * as THREE from 'three';

const FISH_CONSTANTS = {
    BASE_X_OFFSET: 8,
    SKELETON_POSITIONS: [1.0, 0.3, 0.6, 1.0],
    BONE_TRANSITION_POINTS: [8, 4, 0, -8],
    TAIL_HEIGHT_RATIOS: { upper: 5/8, lower: 3/8 },
    DEFAULT_MATERIAL_PROPS: {
        color: "#506f6c",
        specular: "#000000",
        emissive: "#000000",
        shininess: 90,
        flatShading: true
    },
    DEFAULT_TEXTURE_PROPS: {
        textureUrl: null,
        textureScale: { x: 1, y: 1 },
        textureOffset: { x: 0, y: 0 },
        wrapS: THREE.RepeatWrapping,
        wrapT: THREE.RepeatWrapping
    }
};


/**
 * FishGeometryBuilder
 * Responsible for procedurally generating the geometry (vertices, indices, UVs) for the bream fish
 * at different levels of detail (LOD).
 */
class FishGeometryBuilder {
    /**
     * @param {Object} options - Fish geometry parameters
     */
    constructor(options) {
        this.options = options;
        this.baseX = FISH_CONSTANTS.BASE_X_OFFSET;
    }

    /**
     * Builds the high-detail geometry for the fish body, including head, body, tail, and fins.
     * @returns {{vertices: Float32Array, indices: number[]}}
     */
    buildHighDetailBody() {
        const { headLength, headWidth, headHeight, bodyLength, bodyWidth, bodyHeight, tailLength, tailWidth, tailHeight } = this.options;
        const firstPartLength = bodyLength * 0.25;
        const secondPartLength = bodyLength * 0.2;
        
        const vertices = new Float32Array([
            // Head vertices (0-4)
            this.baseX + headLength, 0, 0,
            this.baseX, 0, -headWidth/2,
            this.baseX, headHeight*0.6, 0,
            this.baseX, 0, headWidth/2,
            this.baseX, -headHeight*0.4, 0,
            // Body segment 1 (5-8)
            this.baseX - firstPartLength, bodyHeight*0.5, 0,
            this.baseX - firstPartLength, 0, bodyWidth*2/5,
            this.baseX - firstPartLength, 0, -bodyWidth*2/5,
            this.baseX - firstPartLength, -bodyHeight*0.4, 0,
            // Body segment 2 (9-12)
            this.baseX - firstPartLength - secondPartLength, bodyHeight*0.6, 0,
            this.baseX - firstPartLength - secondPartLength, 0, bodyWidth/2,
            this.baseX - firstPartLength - secondPartLength, 0, -bodyWidth/2,
            this.baseX - firstPartLength - secondPartLength, -bodyHeight*0.4, 0,
            // Tail connection (13-16)
            this.baseX - bodyLength, 2.5, 0,
            this.baseX - bodyLength, 2.5, 0,
            this.baseX - bodyLength, 0.5, 0,
            this.baseX - bodyLength, 0.5, 0,
            // Tail (17-21)
            this.baseX - bodyLength + 2, 2, 0,
            this.baseX - bodyLength - tailLength/2, 2, tailWidth/2,
            this.baseX - (bodyLength + tailLength), -tailHeight*FISH_CONSTANTS.TAIL_HEIGHT_RATIOS.lower, 0,
            this.baseX - bodyLength - tailLength/2, 2, -tailWidth/2,
            this.baseX - (bodyLength + tailLength), tailHeight*FISH_CONSTANTS.TAIL_HEIGHT_RATIOS.upper, 0,
            // Side fins left (22-26)
            3, bodyHeight*0.2, bodyWidth/10,
            14 - bodyLength, -bodyHeight*0.4, bodyWidth*0.6,
            4, bodyHeight*0.05, bodyWidth/8,
            4, -bodyHeight*0.1, bodyWidth/10,
            4, 0, 0,
            // Side fins right (27-30)
            3, bodyHeight*0.2, -bodyWidth/10,
            14 - bodyLength, -bodyHeight*0.4, -bodyWidth*0.6,
            4, bodyHeight*0.05, -bodyWidth/8,
            4, -bodyHeight*0.1, -bodyWidth/10,
            // Top fin (31-35)
            this.baseX - firstPartLength - secondPartLength - bodyLength*0.15, bodyHeight*0.5, 0,
            this.baseX - firstPartLength - secondPartLength - bodyLength*0.4, bodyHeight*0.55, 0,
            this.baseX - firstPartLength - secondPartLength - bodyLength*0.5, 0.7, 0,
            this.baseX - firstPartLength - secondPartLength - bodyLength*0.2, bodyHeight*0.3, bodyWidth/10,
            this.baseX - firstPartLength - secondPartLength - bodyLength*0.2, bodyHeight*0.3, -bodyWidth/10,
        ]);

        const indices = [
            0,1,2, 3,0,2, 1,0,4, 0,3,4,
            2,5,3, 2,1,5, 5,1,7, 5,6,3,
            3,6,8, 7,1,8, 3,8,4, 8,1,4,
            9,6,5, 9,5,7, 11,9,7, 10,6,9,
            10,12,6, 12,11,7, 8,6,12, 7,8,12,
            9,13,10, 9,11,14, 13,9,14, 15,10,13, 11,16,14,
            10,15,12, 16,11,12, 12,15,16,
            13,14,15, 14,16,15,
            17,18,19, 20,17,19, 20,19,18, 17,21,18, 21,17,20, 21,20,18,
            22,23,24, 25,24,23, 22,26,23, 26,25,23,
            28,27,29, 29,30,28, 26,27,28, 30,26,28,
            31,32,34, 32,31,35, 32,33,34, 33,32,35,
        ];

        return { vertices, indices };
    }

    /**
     * Builds a medium-detail geometry for the fish body and tail.
     * @returns {{bodyVertices: Float32Array, bodyIndices: number[], tailVertices: Float32Array, tailIndices: number[]}}
     */
    buildMediumDetailBody() {
        const { headLength, bodyLength, bodyHeight, bodyWidth, tailLength, tailHeight } = this.options;
        
        const bodyVertices = new Float32Array([
            this.baseX + headLength, 0, 0,
            this.baseX - bodyLength*0.45, bodyHeight*0.6, 0,
            this.baseX - bodyLength*0.45, 0, bodyWidth/2,
            this.baseX - bodyLength*0.45, 0, -bodyWidth/2,
            this.baseX - bodyLength*0.45, -bodyHeight*0.4, 0,
            this.baseX - bodyLength, 3, 0,
            this.baseX - bodyLength, 0, 0,
        ]);

        const bodyIndices = [
            0,1,2, 1,0,3, 0,2,4, 3,0,4,
            1,5,2, 5,1,3, 2,5,6, 5,3,6, 4,2,6, 3,4,6,
        ];

        const tailVertices = new Float32Array([
            this.baseX - bodyLength, 3, 0,
            this.baseX - bodyLength, 0, 0,
            this.baseX - bodyLength - tailLength, -tailHeight*FISH_CONSTANTS.TAIL_HEIGHT_RATIOS.lower, 0,
            this.baseX - bodyLength - tailLength, tailHeight*FISH_CONSTANTS.TAIL_HEIGHT_RATIOS.upper, 0,
        ]);

        const tailIndices = [0,1,2, 1,0,2, 0,1,3, 1,0,3];

        return { bodyVertices, bodyIndices, tailVertices, tailIndices };
    }

    /**
     * Builds a low-detail geometry for the fish body and tail.
     * @returns {{vertices: Float32Array, indices: number[]}}
     */
    buildLowDetailBody() {
        const { headLength, bodyLength, bodyHeight, tailLength, tailHeight } = this.options;
        
        const vertices = new Float32Array([
            this.baseX + headLength, 0, 0,
            this.baseX - bodyLength*0.45, bodyHeight*0.6, 0,
            this.baseX - bodyLength, 1.5, 0,
            this.baseX - bodyLength*0.45, -bodyHeight*0.4, 0,
            this.baseX - bodyLength - tailLength, tailHeight*FISH_CONSTANTS.TAIL_HEIGHT_RATIOS.upper, 0,
            this.baseX - bodyLength - tailLength, -tailHeight*FISH_CONSTANTS.TAIL_HEIGHT_RATIOS.lower, 0,
        ]);

        const indices = [0,1,2, 1,0,2, 0,2,3, 2,0,3, 2,4,5, 4,2,5];

        return { vertices, indices };
    }

    /**
     * Builds a very low-detail geometry for the fish (triangle only).
     * @returns {{vertices: Float32Array, indices: number[]}}
     */
    buildVeryLowDetailBody() {
        const { headLength, bodyLength, tailLength, tailHeight } = this.options;
        
        const vertices = new Float32Array([
            this.baseX + headLength, 0, 0,
            this.baseX - bodyLength - tailLength, tailHeight*FISH_CONSTANTS.TAIL_HEIGHT_RATIOS.upper, 0,
            this.baseX - bodyLength - tailLength, -tailHeight*FISH_CONSTANTS.TAIL_HEIGHT_RATIOS.lower, 0,
        ]);

        const indices = [0,1,2, 1,0,2];

        return { vertices, indices };
    }

    /**
     * Generates UV coordinates for the fish geometry for texture mapping.
     * @param {Float32Array} vertices
     * @param {THREE.BufferGeometry} geometry
     */
    generateUVCoordinates(vertices, geometry) {
        const uvs = [];
        const vertexCount = vertices.length / 3;
        
        for (let i = 0; i < vertexCount; i++) {
            const x = vertices[i * 3];
            const y = vertices[i * 3 + 1];
            const z = vertices[i * 3 + 2];
            
            if (i <= 21) {
                const bodyStartX = this.baseX + this.options.headLength;
                const bodyEndX = this.baseX - this.options.bodyLength - this.options.tailLength;
                const bodyLength = bodyStartX - bodyEndX;
                
                const u = (bodyStartX - x) / bodyLength * this.options.textureRepeat.x;
                const v = (y + this.options.bodyHeight / 2) / this.options.bodyHeight * this.options.textureRepeat.y;
                
                uvs.push(u, 1 - v);
            } else {
                uvs.push(0, 0);
            }
        }
        
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    }
}


/**
 * FishSkeleton
 * Manages the bone structure and skinning for the fish, enabling smooth skeletal animation.
 */
class FishSkeleton {
    /**
     * @param {Object} options - Fish geometry parameters
     */
    constructor(options) {
        this.options = options;
        this.bones = [];
        this.rootBone = null;
        this.createBones();
    }

    /**
     * Creates the bone hierarchy for the fish skeleton.
     */
    createBones() {
        const { bodyLength, headLength } = this.options;
        const baseX = FISH_CONSTANTS.BASE_X_OFFSET;
        
        const positions = FISH_CONSTANTS.SKELETON_POSITIONS.map((mult, i) => {
            if (i === 0) return new THREE.Vector3(baseX + headLength, 0, 0);
            return new THREE.Vector3(baseX - bodyLength * mult, 0, 0);
        });

        let prevBone = null;
        positions.forEach((pos) => {
            const bone = new THREE.Bone();
            bone.position.copy(pos);
            if (prevBone) {
                prevBone.add(bone);
            }
            this.bones.push(bone);
            prevBone = bone;
        });

        this.rootBone = this.bones[0];
    }

    /**
     * Applies skinning attributes to the geometry for skeletal animation.
     * @param {THREE.BufferGeometry} geometry
     */
    applySkinning(geometry) {
        const vertexCount = geometry.attributes.position.count;
        const skinIndices = [];
        const skinWeights = [];

        for (let i = 0; i < vertexCount; i++) {
            const x = geometry.attributes.position.getX(i);
            const weights = this.calculateBoneWeights(x);
            
            skinIndices.push(0, 1, 2, 3);
            skinWeights.push(...weights);
        }

        geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
        geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));
    }

    /**
     * Calculates bone weights for a given vertex x position.
     * @param {number} x
     * @returns {number[]} Array of 4 weights
     */
    calculateBoneWeights(x) {
        const weights = [0, 0, 0, 0];
        const [p0, p1, p2, p3] = FISH_CONSTANTS.BONE_TRANSITION_POINTS;

        if (x > p0) {
            weights[0] = 1;
        } else if (x > p1) {
            const blend = (x - p1) / (p0 - p1);
            weights[0] = blend;
            weights[1] = 1 - blend;
        } else if (x > p2) {
            const blend = (x - p2) / (p1 - p2);
            weights[1] = blend;
            weights[2] = 1 - blend;
        } else if (x > p3) {
            const blend = (x - p3) / (p2 - p3);
            weights[2] = blend;
            weights[3] = 1 - blend;
        } else {
            weights[3] = 1;
        }

        return weights;
    }

    /**
     * Animates the fish skeleton to simulate swimming motion.
     * @param {number} deltaTime
     * @param {number} swimSpeed
     * @param {number} swimAmplitude
     */
    animateSwim(deltaTime, swimSpeed, swimAmplitude) {
        const time = performance.now();
        const amplitudes = [0.2, 0.4, 0.5, 5];
        const phases = [0, 1, 2, 3];

        this.bones.forEach((bone, i) => {
            if (bone) {
                bone.rotation.y = Math.sin(time * swimSpeed - phases[i]) * amplitudes[i] * swimAmplitude;
            }
        });

        if (this.rootBone) {
            this.rootBone.updateMatrixWorld(true);
        }
    }
}


/**
 * MyBreamFish
 * Main class for the bream fish, supporting multiple levels of detail (LOD), skinning, animation, and selection highlighting.
 */
class MyBreamFish extends THREE.LOD {
    /**
     * @param {Object} options - Fish parameters and overrides
     */
    constructor(options = {}) {
        super();

        this.options = this.mergeWithDefaults(options);
        this.fishMaterial = this.createMaterial();
        this.geometryBuilder = new FishGeometryBuilder(this.options);
        this.skeleton = new FishSkeleton(this.options);
        
        this.isMyBreamFish = true;
        this.isSelected = false;

        this.setupLOD();
        this.applyTransform();
    }

    /**
     * Merges user-provided options with default fish parameters.
     * @param {Object} options
     * @returns {Object} merged options
     */
    mergeWithDefaults(options) {
        const defaults = {
            headLength: 2,
            headWidth: 3,
            headHeight: 5,
            bodyLength: 20,
            bodyWidth: 5,
            bodyHeight: 10,
            tailLength: 4,
            tailWidth: 1,
            tailHeight: 8,
            scale: 0.08,
            lodDistances: [0, 45, 60, 75],
            position: { x: 0, y: 5, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            swimSpeed: 0.015,
            swimAmplitude: 0.05,
            textureRepeat: { x: 4, y: 2 },
            ...FISH_CONSTANTS.DEFAULT_MATERIAL_PROPS,
            ...FISH_CONSTANTS.DEFAULT_TEXTURE_PROPS
        };

        return { ...defaults, ...options };
    }

    /**
     * Creates the fish material, optionally loading a texture if provided.
     * @returns {THREE.MeshPhongMaterial}
     */
    createMaterial() {
        const materialProps = {
            color: this.options.color,
            specular: this.options.specular,
            emissive: this.options.emissive,
            shininess: this.options.shininess,
            flatShading: this.options.flatShading
        };

        if (this.options.textureUrl) {
            const textureLoader = new THREE.TextureLoader();
            materialProps.map = textureLoader.load(this.options.textureUrl);
            if (materialProps.map) {
                materialProps.map.repeat.set(this.options.textureScale.x, this.options.textureScale.y);
                materialProps.map.offset.set(this.options.textureOffset.x, this.options.textureOffset.y);
                materialProps.map.wrapS = this.options.wrapS;
                materialProps.map.wrapT = this.options.wrapT;
            }
        }

        return new THREE.MeshPhongMaterial(materialProps);
    }

    /**
     * Sets up the LOD meshes for the fish, from high to very low detail.
     */
    setupLOD() {
        const lodMeshes = [
            this.createHighDetail(),
            this.createMediumDetail(),
            this.createLowDetail(),
            this.createVeryLowDetail()
        ];

        lodMeshes.forEach((mesh, i) => {
            mesh.rotation.y = Math.PI / 2;
            this.addLevel(mesh, this.options.lodDistances[i]);
        });
    }

    /**
     * Creates the high-detail skinned mesh for the fish.
     * @returns {THREE.SkinnedMesh}
     */
    createHighDetail() {
        const { vertices, indices } = this.geometryBuilder.buildHighDetailBody();
        
        const geometry = new THREE.BufferGeometry();
        geometry.setIndex(indices);
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.computeVertexNormals();

        this.geometryBuilder.generateUVCoordinates(vertices, geometry);

        this.skeleton.applySkinning(geometry);

        const skinnedMesh = new THREE.SkinnedMesh(geometry, this.fishMaterial);
        const skeleton = new THREE.Skeleton(this.skeleton.bones);
        
        skinnedMesh.add(this.skeleton.rootBone);
        skinnedMesh.bind(skeleton);

        // Shadows enabled
        skinnedMesh.castShadow = true;
        skinnedMesh.receiveShadow = true;

        return skinnedMesh;
    }

    /**
     * Creates the medium-detail mesh for the fish.
     * @returns {THREE.Group}
     */
    createMediumDetail() {
        const group = new THREE.Group();
        const { bodyVertices, bodyIndices, tailVertices, tailIndices } = 
            this.geometryBuilder.buildMediumDetailBody();

        const bodyGeom = new THREE.BufferGeometry();
        bodyGeom.setIndex(bodyIndices);
        bodyGeom.setAttribute('position', new THREE.BufferAttribute(bodyVertices, 3));
        bodyGeom.computeVertexNormals();
        
        const bodyMesh = new THREE.Mesh(bodyGeom, this.fishMaterial);
        
        // Shadows enabled
        bodyMesh.castShadow = true;
        bodyMesh.receiveShadow = true;
        group.add(bodyMesh);

        const tailGeom = new THREE.BufferGeometry();
        tailGeom.setIndex(tailIndices);
        tailGeom.setAttribute('position', new THREE.BufferAttribute(tailVertices, 3));
        tailGeom.computeVertexNormals();
        
        const tailMesh = new THREE.Mesh(tailGeom, this.fishMaterial);

        // Shadows enabled
        tailMesh.castShadow = true;
        tailMesh.receiveShadow = true;
        group.add(tailMesh);

        return group;
    }

    /**
     * Creates the low-detail mesh for the fish.
     * @returns {THREE.Mesh}
     */
    createLowDetail() {
        const { vertices, indices } = this.geometryBuilder.buildLowDetailBody();
        
        const geometry = new THREE.BufferGeometry();
        geometry.setIndex(indices);
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.computeVertexNormals();

        return new THREE.Mesh(geometry, this.fishMaterial);
    }

    /**
     * Creates the very low-detail mesh for the fish.
     * @returns {THREE.Mesh}
     */
    createVeryLowDetail() {
        const { vertices, indices } = this.geometryBuilder.buildVeryLowDetailBody();
        
        const geometry = new THREE.BufferGeometry();
        geometry.setIndex(indices);
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.computeVertexNormals();

        return new THREE.Mesh(geometry, this.fishMaterial);
    }

    /**
     * Applies position, rotation, and scale transforms to the fish.
     */
    applyTransform() {
        this.position.set(
            this.options.position.x,
            this.options.position.y,
            this.options.position.z
        );
        this.rotation.set(
            this.options.rotation.x,
            this.options.rotation.y,
            this.options.rotation.z
        );
        this.scale.setScalar(this.options.scale);
    }

    /**
     * Updates the fish animation (swimming) for the current frame.
     * @param {number} deltaTime
     */
    animate(deltaTime) {
        this.skeleton.animateSwim(deltaTime, this.options.swimSpeed, this.options.swimAmplitude);
    }

    /**
     * Handles selection state changes for the fish.
     * @param {boolean} selected
     */
    onSelect(selected) {
        if (selected) this.select();
        else this.deselect();
    }

    /**
     * Highlights the fish to indicate selection.
     */
    select() {
        if (this.isSelected) return;
        this.isSelected = true;

        const highlightEmissive = 0xffaa00;
        this.traverse(child => {
            if (child.isMesh) {
                const mat = child.material;
                if (Array.isArray(mat)) {
                    mat.forEach(m => {
                        if (m && m.isMeshPhongMaterial && 'emissive' in m) m.emissive.setHex(highlightEmissive);
                        else if (m && m.color) m.color.setHex(highlightEmissive);
                    });
                } else if (mat) {
                    if (mat.isMeshPhongMaterial && 'emissive' in mat) mat.emissive.setHex(highlightEmissive);
                    else if (mat.color) mat.color.setHex(highlightEmissive);
                }
            }
        });
    }

    /**
     * Removes selection highlight from the fish.
     */
    deselect() {
        if (!this.isSelected) return;
        this.isSelected = false;

        const defaultColor = new THREE.Color(this.options.color);
        const defaultEmissive = new THREE.Color(this.options.emissive || "#000000");
        this.traverse(child => {
            if (child.isMesh) {
                const mat = child.material;
                if (Array.isArray(mat)) {
                    mat.forEach(m => {
                        if (!m) return;
                        if (m.isMeshPhongMaterial && 'emissive' in m) m.emissive.copy(defaultEmissive);
                        if (m.color) m.color.copy(defaultColor);
                    });
                } else if (mat) {
                    if (mat.isMeshPhongMaterial && 'emissive' in mat) mat.emissive.copy(defaultEmissive);
                    if (mat.color) mat.color.copy(defaultColor);
                }
            }
        });
    }
}

export { MyBreamFish };