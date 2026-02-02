
/**
 * MyRock
 * Represents a cluster of textured rocks with LOD (Level of Detail) support.
 * Each cluster is made of several dodecahedron-based meshes with PBR textures.
 * Inherits from THREE.Group.
 */

import * as THREE from 'three';

class MyRock extends THREE.Group {
    /**
     * Constructs a new MyRock instance.
     * @param {Object} options - Options for rock cluster generation.
     * @param {number} [options.clusterCount] - Number of rocks in the cluster.
     * @param {number} [options.baseSize] - Base size for each rock.
     * @param {number} [options.deformation] - Unused, for future geometry deformation.
     * @param {string} [options.texturePath] - Path to the rock textures.
     * @param {Object} [options.pos] - Position of the cluster.
     */
    constructor(options = {}) {
        super();
        /**
         * Options for this rock cluster.
         * @type {Object}
         */
        this.options = Object.assign({
            clusterCount: 2 + Math.floor(Math.random()),
            baseSize: 2,
            deformation: 0.25,
            texturePath: './textures/ocean-rock-bl/',
            pos: { x: 0, y: 0, z: 0 }
        }, options);

        // Load all required PBR textures
        const loader = new THREE.TextureLoader();
        this.textures = {
            albedo: loader.load(`${this.options.texturePath}ocean-rock_albedo.jpg`),
            normal: loader.load(`${this.options.texturePath}ocean-rock_normal-ogl.jpg`),
            ao: loader.load(`${this.options.texturePath}ocean-rock_ao.jpg`),
            roughness: loader.load(`${this.options.texturePath}ocean-rock_roughness.jpg`),
            metalness: loader.load(`${this.options.texturePath}ocean-rock_metallic.jpg`),
            displacement: loader.load(`${this.options.texturePath}ocean-rock_height.jpg`)
        };

        this.createClusterLOD();
        this.position.set(this.options.pos.x, this.options.pos.y, this.options.pos.z);
    }

    /**
     * Creates a single textured rock mesh.
     * @param {number} size - Size of the rock.
     * @param {boolean} lowLOD - If true, use only albedo map for performance.
     * @param {number} segments - Geometry detail level.
     * @returns {THREE.Mesh} The created rock mesh.
     */
    createTexturedRock(size = 1.0, lowLOD = false, segments = 1) {
        const geometry = new THREE.DodecahedronGeometry(size, segments);
        let material;
        if (lowLOD) {
            material = new THREE.MeshStandardMaterial({
                map: this.textures.albedo
            });
        } else {
            material = new THREE.MeshStandardMaterial({
                map: this.textures.albedo,
                normalMap: this.textures.normal,
                aoMap: this.textures.ao,
                roughnessMap: this.textures.roughness,
                metalnessMap: this.textures.metalness,
                displacementMap: this.textures.displacement,
                displacementScale: size * 0.25,
                displacementBias: -size * 0.25
            });
        }
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        mesh.scale.setScalar(0.8 + Math.random() * 0.6);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        return mesh;
    }

    /**
     * Creates a cluster of rocks, each with LOD (high and low detail meshes).
     * Adds the cluster to this group.
     */
    createClusterLOD() {
        const { clusterCount, baseSize } = this.options;
        for (let i = 0; i < clusterCount; i++) {
            const size = baseSize * (0.7 + Math.random() * 0.3);
            const lod = new THREE.LOD();
            const highMesh = this.createTexturedRock(size, false, 7);
            lod.addLevel(highMesh, 0);
            const lowMesh = this.createTexturedRock(size, true, 0);
            lod.addLevel(lowMesh, 20); 
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * baseSize * 1.5;
            const height = (Math.random() - 0.2) * baseSize * 0.5;
            lod.position.set(
                Math.cos(angle) * dist,
                height * 0.3,
                Math.sin(angle) * dist
            );
            this.add(lod);
        }
    }

    /**
     * Highlights the rock cluster when selected by changing emissive color.
     * @param {boolean} selected - Whether the rock is selected.
     */
    onSelect(selected) {
        this.traverse((child) => {
            if (child.isMesh) {
                const emissiveColor = selected ? 0xffaa00 : 0x000000;
                child.material.emissive.setHex(emissiveColor);
            }
        });
    }
}

export { MyRock };
