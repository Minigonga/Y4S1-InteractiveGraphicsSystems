import * as THREE from 'three';

class MyTable extends THREE.Group{
    constructor() {
        super();

        const textureLoader = new THREE.TextureLoader();

        // Load table texture
        const table_text = textureLoader.load('./textures/table_text.png');

        // Material for table
        let tableMaterial = new THREE.MeshStandardMaterial({
            map: table_text,
            color: 0xAAAAAA,
            roughness: 0.7,
            metalness: 0.0,
        });
        
        // Table top (box)
        let tableTop = new THREE.BoxGeometry(4, 0.2, 2);
        let tableTopMesh = new THREE.Mesh(tableTop, tableMaterial);
        tableTopMesh.position.set(0, 2, 0);
        this.add(tableTopMesh);

        // Leg geometry (cylinders)
        let legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 32);

        // Four corner leg positions
        let legPositions = [
            [ 1.8, 1,  0.8],
            [-1.8, 1,  0.8],
            [ 1.8, 1, -0.8],
            [-1.8, 1, -0.8]
        ];

        // Create legs and place them
        legPositions.forEach(pos => {
            let legMesh = new THREE.Mesh(legGeometry, tableMaterial);
            legMesh.position.set(...pos);
            this.add(legMesh);
        });
    }
}

export { MyTable };
