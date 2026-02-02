
/**
 * MyAlgaGroup
 * Represents a group of MyAlga instances, distributed randomly within a patch.
 * Inherits from THREE.Group.
 */

import * as THREE from 'three';
import { MyAlga } from './MyAlga.js';

class MyAlgaGroup extends THREE.Group {
    /**
     * Constructs a new MyAlgaGroup instance.
     * @param {Object} options - Options for group placement and terrain.
     * @param {Object} options.pos - Position object with x and z coordinates.
     * @param {Object} options.terrain - Terrain object with getHeightAt(x, z) method.
     */
    constructor(options) {
        super();
        /**
         * Array of materials used for the algas in the group.
         * @type {THREE.Material[]}
         */
        this.materials = [];

        /**
         * Shared base material for algas.
         * @type {THREE.MeshPhongMaterial}
         */
        this.algaMaterial = new THREE.MeshPhongMaterial({
            color: '#5caa2f',
            specular: '#000000',
            emissive: '#000000',
            shininess: 90
        });
        this.materials.push(this.algaMaterial);

        // Create a random number of algas and distribute them in the patch
        for (let i = 0; i < Math.ceil(Math.random() * 4 + 8); i++) {
            const material = this.algaMaterial.clone();
            const alga = new MyAlga(material);

            // Random offset within patch
            const offsetX = (Math.random() - 0.5) * Math.ceil(Math.random() * 2 + 2.5);
            const offsetZ = (Math.random() - 0.5) * Math.ceil(Math.random() * 2 + 2.5);
            const worldX = offsetX + options.pos.x;
            const worldZ = offsetZ + options.pos.z;
            let y = options.terrain.getHeightAt(worldX, worldZ).y; 

            alga.position.set(offsetX, y, offsetZ);

            // Random scale and rotation for natural look
            const scale = 0.8 + Math.random() * 0.4;
            alga.scale.set(scale, scale, scale);
            alga.rotation.y = Math.random() * Math.PI * 2;

            this.add(alga);
        }
    }
}

export { MyAlgaGroup };
