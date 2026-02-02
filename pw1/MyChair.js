import * as THREE from 'three';

class MyChair extends THREE.Group {
    constructor() {
        super();
        const textureLoader = new THREE.TextureLoader();

        // Load wood texture for chair
        const table_text = textureLoader.load('./textures/table_text.png');

        // Chair material
        let chairMaterial = new THREE.MeshStandardMaterial({
            map: table_text,
            color: 0xAAAAAA,
            roughness: 0.7,
            metalness: 0.0,
        });

        // Seat
        let seat = new THREE.BoxGeometry(1.2, 0.2, 1.2);
        let seatMesh = new THREE.Mesh(seat, chairMaterial);
        seatMesh.position.set(0.5, 1.2, 1.6);
        this.add(seatMesh);
        
        // Front left leg
        let frontLeg1 = new THREE.CylinderGeometry(0.1, 0.1, 1.2, 32);
        let frontLeg1Mesh = new THREE.Mesh(frontLeg1, chairMaterial);
        frontLeg1Mesh.position.set(0.05, 0.6, 1.15);
        this.add(frontLeg1Mesh);

        // Front right leg
        let frontLeg2 = new THREE.CylinderGeometry(0.1, 0.1, 1.2, 32);
        let frontLeg2Mesh = new THREE.Mesh(frontLeg2, chairMaterial);
        frontLeg2Mesh.position.set(0.95, 0.6, 1.15);
        this.add(frontLeg2Mesh);

        // Back left leg (longer, extends for backrest)
        let backLeg1 = new THREE.CylinderGeometry(0.1, 0.1, 2.8, 32);
        let backLeg1Mesh = new THREE.Mesh(backLeg1, chairMaterial);
        backLeg1Mesh.position.set(0.05, 1.4, 2.15);
        this.add(backLeg1Mesh);

        // Back right leg
        let backLeg2 = new THREE.CylinderGeometry(0.1, 0.1, 2.8, 32);
        let backLeg2Mesh = new THREE.Mesh(backLeg2, chairMaterial);
        backLeg2Mesh.position.set(0.95, 1.4, 2.15);
        this.add(backLeg2Mesh);

        // Horizontal bar for backrest
        let backRest = new THREE.CylinderGeometry(0.1, 0.1, 1.4, 32);
        let backRestMesh = new THREE.Mesh(backRest, chairMaterial);
        backRestMesh.position.set(0.50, 2.6, 2.15);
        backRestMesh.rotateZ(Math.PI / 2);
        this.add(backRestMesh);

        // Load rope texture for woven backrest
        const ropeTexture = textureLoader.load('./textures/rope.jpg');
        ropeTexture.wrapS = THREE.RepeatWrapping;
        ropeTexture.wrapT = THREE.RepeatWrapping;
        ropeTexture.repeat.set(1, 20);

        // Rope material
        let wireMaterial = new THREE.MeshStandardMaterial({
            map: ropeTexture,
            color: 0xffffff,
            roughness: 0.6,
            metalness: 0.0,
        });

        // Backrest rope grid parameters
        const yBottom = 1.6;
        const yTop = 2.6;
        const xLeft = 0.05;  
        const xRight = 0.95;
        const steps = 15;
        const wireRadius = 0.01;

        // Horizontal ropes
        for (let i = 0; i <= steps; i++) {
            let y = yBottom + (i / steps) * (yTop - yBottom);
            let length = xRight - xLeft;

            let geo = new THREE.CylinderGeometry(wireRadius, wireRadius, length, 16);
            let mesh = new THREE.Mesh(geo, wireMaterial);

            mesh.position.set((xLeft + xRight) / 2, y, 2.15);
            mesh.rotateZ(Math.PI / 2);
            this.add(mesh);
        }

        // Vertical ropes
        for (let i = 0; i <= steps; i++) {
            let x = xLeft + (i / steps) * (xRight - xLeft);
            let length = yTop - yBottom;

            let geo = new THREE.CylinderGeometry(wireRadius, wireRadius, length, 16);
            let mesh = new THREE.Mesh(geo, wireMaterial);

            mesh.position.set(x, (yBottom + yTop) / 2, 2.15);
            this.add(mesh);
        }

        // Load cushion texture
        const cushion_text = textureLoader.load('./textures/cushion.jpg');
        let cushionMaterial = new THREE.MeshStandardMaterial({
            map: cushion_text,
            roughness: 0.8,
            metalness: 0.1,
        });

        // Cushion geometry
        let cushionGeometry = new THREE.BoxGeometry(1.05, 0.2, 1.05);
        let cushionMesh = new THREE.Mesh(cushionGeometry, cushionMaterial);
        cushionMesh.position.set(0.5, 1.25, 1.6);
        this.add(cushionMesh);
    }
}

export { MyChair };
