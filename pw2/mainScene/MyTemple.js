
// MyTemple.js
// Defines the MyTemple class, a Greek-style temple with columns, base, roof, and pediments.
// All methods and classes are documented for clarity and maintainability.

import * as THREE from 'three';
import { MyColumn } from './MyColumn.js';


/**
 * MyTemple
 * Represents a Greek-style temple with columns, base, roof, and pediments.
 * Inherits from THREE.Group.
 */
class MyTemple extends THREE.Group {
    /**
     * Constructs a new MyTemple instance, builds all geometry and adds columns, base, roof, and pediments.
     */
    constructor() {
        super();
        /**
         * Texture loader for temple textures.
         * @type {THREE.TextureLoader}
         */
        this.textureLoader = new THREE.TextureLoader();
        // Load and configure textures for temple materials
        const texture = this.textureLoader.load('textures/greek.png', (tex) => {
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(8, 8);
            tex.needsUpdate = true;
        });
        const topTexture = this.textureLoader.load('textures/greek.png');
        topTexture.wrapS = topTexture.wrapT = THREE.RepeatWrapping;
        topTexture.repeat.set(8, 8);

        const sideTexture = this.textureLoader.load('textures/greek.png');
        sideTexture.wrapS = sideTexture.wrapT = THREE.RepeatWrapping;
        sideTexture.repeat.set(8, 1);

        /**
         * Array of materials for different temple faces.
         * @type {THREE.MeshPhongMaterial[]}
         */
        this.materials = [
            new THREE.MeshPhongMaterial({ map: sideTexture, color: '#dee9b0' }),
            new THREE.MeshPhongMaterial({ map: sideTexture, color: '#dee9b0' }),
            new THREE.MeshPhongMaterial({ map: topTexture,  color: '#dee9b0' }),
            new THREE.MeshPhongMaterial({ map: topTexture,  color: '#dee9b0' }),
            new THREE.MeshPhongMaterial({ map: sideTexture, color: '#dee9b0' }),
            new THREE.MeshPhongMaterial({ map: sideTexture, color: '#dee9b0' })
        ];

        /**
         * Main material for temple meshes.
         * @type {THREE.MeshPhongMaterial}
         */
        this.material = new THREE.MeshPhongMaterial({
            map: texture,
            color: '#dee9b0',
            specular: '#000000',
            emissive: '#000000',
            shininess: 90
        });

        // Temple base
        const baseGeometry = new THREE.BoxGeometry(24.5, 2, 34.5);
        const baseMesh = new THREE.Mesh(baseGeometry, this.materials);
        baseMesh.position.y = 10;
        baseMesh.castShadow = true;
        baseMesh.receiveShadow = true;
        this.add(baseMesh);

        // Lower base
        const botBaseGeometry = new THREE.BoxGeometry(30, 7, 37.5, 4);
        const botBaseMesh = new THREE.Mesh(botBaseGeometry, this.materials);
        botBaseMesh.position.y = 5.5;
        botBaseMesh.castShadow = true;
        botBaseMesh.receiveShadow = true;
        this.add(botBaseMesh);

        // Column placement parameters
        const halfLengthX = 12.25;
        const halfLengthZ = 15; 
        const yColumnBase = 12;

        // Front side (+Z)
        for (let i = 1; i < 3; i++) {
            const t = i/3 * 2 - 1;
            const column = new MyColumn();
            column.position.set(t * halfLengthX, yColumnBase, halfLengthZ);
            this.add(column);
        }

        // Back side (-Z)
        for (let i = 1; i < 3; i++) {
            const t = i/3 * 2 - 1;
            const column = new MyColumn();
            column.position.set(t * halfLengthX, yColumnBase, -halfLengthZ);
            this.add(column);
        }

        // Right side (+X)
        for (let i = 0; i < 5; i++) {
            const t = (i / 4) * 2 - 1;
            const column = new MyColumn();
            column.position.set(halfLengthX - 3, yColumnBase, t * halfLengthZ);
            this.add(column);
        }

        // Left side (-X)
        for (let i = 0; i < 5; i++) {
            const t = (i / 4) * 2 - 1;
            const column = new MyColumn();
            column.position.set(-halfLengthX + 3, yColumnBase, t * halfLengthZ);
            this.add(column);
        }

        // Main roof
        const roofGeometry = new THREE.BoxGeometry(25, 1.5, 35, 4);
        const roofMesh = new THREE.Mesh(roofGeometry, this.materials);
        roofMesh.position.y = 25.8;
        roofMesh.castShadow = true;
        roofMesh.receiveShadow = true;
        this.add(roofMesh);

        // Sloped roof halves
        const halfRoofGeometry = new THREE.BoxGeometry(12.5, 1.5, 34.7, 4);
        const leftRoofMesh = new THREE.Mesh(halfRoofGeometry, this.materials);
        leftRoofMesh.position.set(-5, 29.3, 0);
        leftRoofMesh.rotateZ(Math.PI / 6);
        leftRoofMesh.castShadow = true;
        leftRoofMesh.receiveShadow = true;
        this.add(leftRoofMesh);

        const rightRoofMesh = new THREE.Mesh(halfRoofGeometry, this.materials);
        rightRoofMesh.position.set(5, 29.3, 0);
        rightRoofMesh.rotateZ(-Math.PI / 6);
        rightRoofMesh.castShadow = true;
        rightRoofMesh.receiveShadow = true;
        this.add(rightRoofMesh);

        // Pediments (triangular front and back)
        const side1 = new THREE.BufferGeometry();
        const side2 = new THREE.BufferGeometry();

        const verticesSide1 = new Float32Array([
            12.5, 25.3, 17,
            -12.5, 25.3, 17,  
            0, 32, 17  
        ]);
        const verticesSide2 = new Float32Array([
            12.5, 25.3, -17,
            -12.5, 25.3, -17,    
            0, 32, -17  
        ]);

        side1.setAttribute('position', new THREE.BufferAttribute(verticesSide1, 3));
        side1.setIndex([1, 0, 2]);     
        side1.computeVertexNormals(); 

        const pedimentMesh1 = new THREE.Mesh(side1, this.material);
        pedimentMesh1.castShadow = true;
        pedimentMesh1.receiveShadow = true;
        this.add(pedimentMesh1);

        side2.setAttribute('position', new THREE.BufferAttribute(verticesSide2, 3));
        side2.setIndex([1, 2, 0]);     
        side2.computeVertexNormals(); 

        const pedimentMesh2 = new THREE.Mesh(side2, this.material);
        pedimentMesh2.castShadow = true;
        pedimentMesh2.receiveShadow = true;
        this.add(pedimentMesh2);
    }

    /**
     * Sets the emissive color of all temple meshes when selected or deselected.
     * @param {boolean} selected - Whether the temple is selected.
     */
    onSelect(selected) {
        const emissiveColor = selected ? 0xffaa00 : 0x000000;
        
        this.traverse(child => {
            if (child.isMesh) {
                // Handle single material
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        // Handle material array (for BoxGeometry faces)
                        child.material.forEach(mat => {
                            if (mat.emissive) mat.emissive.setHex(emissiveColor);
                        });
                    } else {
                        // Handle single material
                        if (child.material.emissive) {
                            child.material.emissive.setHex(emissiveColor);
                        }
                    }
                }
            }
        });
    }

}

export { MyTemple };
