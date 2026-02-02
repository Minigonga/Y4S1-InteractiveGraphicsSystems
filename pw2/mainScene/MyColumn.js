
// MyColumn.js
// Defines the MyColumn class, a detailed Greek-style column with decorative top and base.
// All methods and classes are documented for clarity and maintainability.

import * as THREE from 'three';

/**
 * MyColumn
 * Represents a Greek-style column with decorative teeth, top, and base.
 * Inherits from THREE.Group.
 */
class MyColumn extends THREE.Group {
    /**
     * Constructs a new MyColumn instance, builds geometry and adds all column parts.
     */
    constructor() {
        super();

        /**
         * Texture loader for column textures.
         * @type {THREE.TextureLoader}
         */
        this.textureLoader = new THREE.TextureLoader();

        // Column parameters
        const radius = 1;
        const height = 12;
        const teeth = 12;
        const toothDepth = 0.1;
        const toothTopFraction = 0.3;

        // Create the shape for the column base with decorative teeth
        const shape = new THREE.Shape();
        const TWO_PI = Math.PI * 2;
        const anglePerTooth = TWO_PI / teeth;

        for (let i = 0; i < teeth; i++) {
            const startAngle = i * anglePerTooth;
            const outerStart = startAngle + (anglePerTooth * (1 - toothTopFraction)) / 2;
            const outerEnd = startAngle + anglePerTooth - (anglePerTooth * (1 - toothTopFraction)) / 2;

            const x1 = Math.cos(startAngle) * radius;
            const y1 = Math.sin(startAngle) * radius;
            if (i === 0) shape.moveTo(x1, y1);
            else shape.lineTo(x1, y1);

            const x2 = Math.cos(outerStart) * (radius + toothDepth);
            const y2 = Math.sin(outerStart) * (radius + toothDepth);
            shape.lineTo(x2, y2);

            const x3 = Math.cos(outerEnd) * (radius + toothDepth);
            const y3 = Math.sin(outerEnd) * (radius + toothDepth);
            shape.lineTo(x3, y3);

            const x4 = Math.cos(startAngle + anglePerTooth) * radius;
            const y4 = Math.sin(startAngle + anglePerTooth) * radius;
            shape.lineTo(x4, y4);
        }

        shape.closePath();

        // Extrude the shape to create the column body
        const extrudeSettings = {
            depth: height,
            steps: 1,
            bevelEnabled: false
        };

        const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geom.rotateX(-Math.PI / 2);
        geom.computeVertexNormals();

        // Load and configure the column texture
        const texture = this.textureLoader.load('textures/greek.png', (tex) => {
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            tex.needsUpdate = true;
        });

        /**
         * Material for the column meshes.
         * @type {THREE.MeshPhongMaterial}
         */
        this.material = new THREE.MeshPhongMaterial({
            map: texture,
            color: '#dee9b0',
            specular: '#000000',
            emissive: '#000000',
            shininess: 90
        });

        // Main column mesh
        const columnMesh = new THREE.Mesh(geom, this.material);
        columnMesh.castShadow = true;
        columnMesh.receiveShadow = true;
        this.add(columnMesh);

        // Decorative top cylinder
        const cyl = new THREE.CylinderGeometry(1.5, 1.3, 1, 12);
        const cylMesh = new THREE.Mesh(cyl, this.material);
        cylMesh.position.setY(height);
        cylMesh.castShadow = true;
        cylMesh.receiveShadow = true;
        this.add(cylMesh);

        // Top box (abacus)
        const box = new THREE.BoxGeometry(3.3, 0.75, 3.3, 2);
        const boxMesh = new THREE.Mesh(box, this.material);
        boxMesh.position.setY(height + 0.75);
        boxMesh.castShadow = true;
        boxMesh.receiveShadow = true;
        this.add(boxMesh);

        // Decorative bottom cylinder
        const bot = new THREE.CylinderGeometry(1.3, 1.7, 2, 12);
        const botMesh = new THREE.Mesh(bot, this.material);
        botMesh.castShadow = true;
        botMesh.receiveShadow = true;
        this.add(botMesh);
    }
}

// Export the MyColumn class for use in other modules.
export { MyColumn };
