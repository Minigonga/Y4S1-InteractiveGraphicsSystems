import * as THREE from 'three';

class MyDoor extends THREE.Group{
    constructor() {
        super();

        const textureLoader = new THREE.TextureLoader();

        // Door texture + material
        const doorTexture = textureLoader.load('./textures/door.jpg');
        const doorMaterial = new THREE.MeshStandardMaterial({
            map: doorTexture,
            roughness: 0.7,
            metalness: 0.2,
        });

        // Door geometry
        const doorGeometry = new THREE.BoxGeometry(1, 2, 0.05);
        const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);
        doorMesh.position.set(0, 1, 0);
        this.add(doorMesh);

        // Frame texture + material
        const frameTexture = textureLoader.load('./textures/wood_text.jpg');
        const frameMaterial = new THREE.MeshPhongMaterial({ 
            map: frameTexture, 
            color: 0xaaaaaa 
        });

        const frameThickness = 0.05;
        const frameHeight = 2.1;
        const frameWidth = 1.1;

        // Left frame
        const leftFrame = new THREE.Mesh(
            new THREE.BoxGeometry(frameThickness, frameHeight, 0.1),
            frameMaterial
        );
        leftFrame.position.set(-frameWidth / 2 + frameThickness / 2, frameHeight / 2 - 0.05, 0);
        this.add(leftFrame);

        // Right frame
        const rightFrame = new THREE.Mesh(
            new THREE.BoxGeometry(frameThickness, frameHeight, 0.1),
            frameMaterial
        );
        rightFrame.position.set(frameWidth / 2 - frameThickness / 2, frameHeight / 2 - 0.05, 0);
        this.add(rightFrame);

        // Top frame
        const topFrame = new THREE.Mesh(
            new THREE.BoxGeometry(frameWidth, frameThickness, 0.1),
            frameMaterial
        );
        topFrame.position.set(0, frameHeight - frameThickness / 2 - 0.05, 0);
        this.add(topFrame);

        // Handle material + geometry
        const handleMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffff00, 
            metalness: 1, 
            shininess: 300 
        });
        const handleGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.1, 16);
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.set(0.45, 1, 0.03);
        handle.rotateZ(Math.PI / 2);
        this.add(handle);
    }
}

export { MyDoor };
