
/**
 * MyAlga
 * Represents a single animated alga (seaweed) with LOD (Level of Detail) support.
 * High detail: cylinder stalk and two waving leaves. Low detail: textured plane.
 * Inherits from THREE.Group.
 */

import * as THREE from 'three';

class MyAlga extends THREE.Group {
    /**
     * Constructs a new MyAlga instance.
     * @param {THREE.Material|null} material - Optional material to use for the alga.
     */
    constructor(material = null) {
        super();
        /**
         * Texture loader for alga textures.
         * @type {THREE.TextureLoader}
         */
        this.textureLoader = new THREE.TextureLoader();
        const lod = new THREE.LOD();
        this.add(lod); 

        /**
         * Material for the alga meshes.
         * @type {THREE.MeshPhongMaterial}
         */
        this.algaMaterial = material || new THREE.MeshPhongMaterial({
            color: '#5caa2f',
            specular: '#000000',
            emissive: '#000000',
            shininess: 90
        });

        // Random height for the alga
        const height = Math.ceil(Math.random() * 10);
        this.height = height;

        // High detail: stalk geometry
        this.algaBase = new THREE.CylinderGeometry(0.05, 0.05, height, 6, height * 4);
        this.algaPosition = this.algaBase.attributes.position;
        this.algaOriginal = this.algaPosition.array.slice();
        this.algaMesh = new THREE.Mesh(this.algaBase, this.algaMaterial);
        this.algaMesh.position.set(0, height / 2, 0);

        // High detail: first leaf geometry (wavy)
        const leaf0 = new THREE.BoxGeometry(3, height, 0.01, 1, height * 5);
        const leaf0Pos = leaf0.attributes.position;
        const amplitude = 0.2;
        const frequency = 3;
        for (let i = 0; i < leaf0Pos.count; i++) {
            const x = leaf0Pos.getX(i);
            const y = leaf0Pos.getY(i);
            const scale = Math.sin(y * frequency) * amplitude;
            leaf0Pos.setX(i, -x * scale);
        }
        leaf0Pos.needsUpdate = true;
        this.leaf0Original = leaf0Pos.array.slice();
        this.leafMesh0 = new THREE.Mesh(leaf0, this.algaMaterial);
        this.leafMesh0.position.set(0, height / 2, 0);

        // High detail: second leaf geometry (wavy, rotated)
        const leaf1 = new THREE.BoxGeometry(3, height, 0.01, 1, height * 5);
        const leaf1Pos = leaf1.attributes.position;
        for (let i = 0; i < leaf1Pos.count; i++) {
            const x = leaf1Pos.getX(i);
            const y = leaf1Pos.getY(i);
            const scale = Math.sin(y * frequency) * amplitude;
            leaf1Pos.setX(i, -x * scale);
        }
        leaf1Pos.needsUpdate = true;
        this.leaf1Original = leaf1Pos.array.slice();
        this.leafMesh1 = new THREE.Mesh(leaf1, this.algaMaterial);
        this.leafMesh1.position.set(0, height / 2, 0);
        this.leafMesh1.rotateY(Math.PI / 2);

        // Group for high detail meshes
        this.highDetailGroup = new THREE.Group();
        this.highDetailGroup.add(this.algaMesh);
        this.highDetailGroup.add(this.leafMesh0);
        this.highDetailGroup.add(this.leafMesh1);

        // Add high detail group to LOD (close distance)
        lod.addLevel(this.highDetailGroup, 0); 

        // Low detail: textured plane
        const texture = this.textureLoader.load('textures/alga.png', (tex) => {
          tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
          tex.repeat.set(1, height/2);
          tex.needsUpdate = true;
        });
        this.lowDetailMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            color: 0x668866,
            transparent: true,
            side: THREE.DoubleSide,
            alphaTest: 0.5 
        });
        const lowDetailGeometry = new THREE.PlaneGeometry(0.75, height); 
        this.lowDetailMesh = new THREE.Mesh(lowDetailGeometry, this.lowDetailMaterial);
        this.lowDetailMesh.position.set(0, height / 2, 0); 
        this.lowDetailMesh.lowDetailMaterial = this.lowDetailMaterial;
        lod.addLevel(this.lowDetailMesh, 30);

        this.lod = lod;

        // Enable shadows for all meshes
        this.highDetailGroup.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        this.lowDetailMesh.castShadow = true;
        this.lowDetailMesh.receiveShadow = true;
    }

    /**
     * Animates the alga geometry if in high detail mode (close to camera).
     * Wobbles the stalk and leaves using sine waves.
     */
    update() { 
        const time = performance.now() * 0.001;

        if (this.lod.getCurrentLevel() === 0) { 
            const pos = this.algaPosition;
            const orig = this.algaOriginal;
            const amplitude = 0.15;
            const frequency = 2;
            for (let i = 0; i < pos.count; i++) {
                const x = orig[i * 3];
                const y = orig[i * 3 + 1];
                const z = orig[i * 3 + 2];
                pos.setZ(i, z + Math.sin(y * frequency + time) * amplitude);
                pos.setY(i, y);
                pos.setX(i, x);
            }
            pos.needsUpdate = true;

            const leaf0Pos = this.leafMesh0.geometry.attributes.position;
            const leaf0Orig = this.leaf0Original;
            for (let i = 0; i < leaf0Pos.count; i++) {
                const x = leaf0Orig[i * 3];
                const y = leaf0Orig[i * 3 + 1];
                const z = leaf0Orig[i * 3 + 2];
                leaf0Pos.setX(i, x);
                leaf0Pos.setY(i, y);
                leaf0Pos.setZ(i, z + Math.sin(y * frequency + time) * amplitude); 
            }
            leaf0Pos.needsUpdate = true;

            const leaf1Pos = this.leafMesh1.geometry.attributes.position;
            const leaf1Orig = this.leaf1Original;
            for (let i = 0; i < leaf1Pos.count; i++) {
                const x = leaf1Orig[i * 3];
                const y = leaf1Orig[i * 3 + 1];
                const z = leaf1Orig[i * 3 + 2];
                leaf1Pos.setZ(i, z);
                leaf1Pos.setY(i, y);
                leaf1Pos.setX(i, x + Math.sin(-(y * frequency + time)) * amplitude);
            }
            leaf1Pos.needsUpdate = true;
        }
    }

    /**
     * Highlights the alga when selected by changing emissive color.
     * @param {boolean} selected - Whether the alga is selected.
     */
    onSelect(selected) {
        const emissiveColor = selected ? 0xffaa00 : 0x000000;
        this.traverse(child => {
            if (child.isMesh && child.material?.emissive) {
                child.material.emissive.setHex(emissiveColor);
            }
            if (child.isMesh && child.lowDetailMaterial) {
                child.lowDetailMaterial.color.setHex(
                    selected ? 0xffaa00 : 0x668866
                );
            }
        });
    }
}

export { MyAlga };