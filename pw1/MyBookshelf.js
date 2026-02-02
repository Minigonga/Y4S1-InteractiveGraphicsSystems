import * as THREE from 'three';

class MyBookshelf extends THREE.Group {
    constructor() {
        super();

        // Load wood texture
        const textureLoader = new THREE.TextureLoader();
        const wood_text = textureLoader.load('./textures/wood_text.jpg');

        // Shelf material (wood)
        let shelfMaterial = new THREE.MeshStandardMaterial({
            map: wood_text,
            roughness: 0.7,
            metalness: 0.0,
        });

        // Left side panel
        let side1 = new THREE.BoxGeometry(0.2, 5, 1);
        let side1Mesh = new THREE.Mesh(side1, shelfMaterial);
        side1Mesh.position.set(-1.5, 2.5, -2.5);

        // Right side panel
        let side2 = new THREE.BoxGeometry(0.2, 5, 1);
        let side2Mesh = new THREE.Mesh(side2, shelfMaterial);
        side2Mesh.position.set(1.5, 2.5, -2.5);

        // Back panel
        let back = new THREE.BoxGeometry(3.2, 5, 0.2);  
        let backMesh = new THREE.Mesh(back, shelfMaterial);
        backMesh.position.set(0, 2.5, -3);

        // Base panel
        let base = new THREE.BoxGeometry(3.2, 0.2, 1);
        let baseMesh = new THREE.Mesh(base, shelfMaterial);
        baseMesh.position.set(0, 0.1, -2.5);

        // Shelf level 1
        let shelf1 = new THREE.BoxGeometry(3.2, 0.2, 0.9);
        let shelf1Mesh = new THREE.Mesh(shelf1, shelfMaterial);
        shelf1Mesh.position.set(0, 1.3, -2.5);

        // Shelf level 2
        let shelf2 = new THREE.BoxGeometry(3.2, 0.2, 0.9);
        let shelf2Mesh = new THREE.Mesh(shelf2, shelfMaterial);
        shelf2Mesh.position.set(0, 2.5, -2.5);

        // Shelf level 3
        let shelf3 = new THREE.BoxGeometry(3.2, 0.2, 0.9);
        let shelf3Mesh = new THREE.Mesh(shelf3, shelfMaterial);
        shelf3Mesh.position.set(0, 3.7, -2.5);

        // Top panel
        let top = new THREE.BoxGeometry(3.2, 0.2, 1);
        let topMesh = new THREE.Mesh(top, shelfMaterial);
        topMesh.position.set(0, 4.9, -2.5);
        
        // Add all meshes to group
        this.add(
            side1Mesh, side2Mesh, 
            backMesh, baseMesh, 
            shelf1Mesh, shelf2Mesh, shelf3Mesh, 
            topMesh
        );
    }
}

export { MyBookshelf };
