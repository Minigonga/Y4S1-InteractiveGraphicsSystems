import * as THREE from 'three';

class MyFrame extends THREE.Group{
    constructor() {
        super();

        const textureLoader = new THREE.TextureLoader();

        // Load artwork texture
        this.artTexture = textureLoader.load('./textures/art.jpg');
        this.artTexture.wrapS = THREE.ClampToEdgeWrapping;
        this.artTexture.wrapT = THREE.ClampToEdgeWrapping;
        this.artTexture.center.set(0.5, 0.5);
        this.artTexture.repeat.set(2, 2);
        this.artTexture.offset.set(0, 0);

        // Art plane
        const artSize = 2;
        const artGeometry = new THREE.PlaneGeometry(artSize, artSize);
        this.wallMaterial = new THREE.MeshStandardMaterial({
            map: this.artTexture,
            side: THREE.FrontSide,
        });
        this.artMesh = new THREE.Mesh(artGeometry, this.wallMaterial);
        this.artMesh.rotation.y = -Math.PI / 2;
        this.add(this.artMesh);

        // Frame parameters
        const frameThickness = 0.15;
        const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });

        // Top frame
        const top = new THREE.Mesh(
            new THREE.PlaneGeometry(artSize + frameThickness*2, frameThickness),
            frameMaterial
        );
        top.position.set(0, artSize/2 + frameThickness/2, 0.01);

        // Bottom frame
        const bottom = new THREE.Mesh(
            new THREE.PlaneGeometry(artSize + frameThickness*2, frameThickness),
            frameMaterial
        );
        bottom.position.set(0, -artSize/2 - frameThickness/2, 0.01);

        // Left frame
        const left = new THREE.Mesh(
            new THREE.PlaneGeometry(frameThickness, artSize),
            frameMaterial
        );
        left.position.set(-artSize/2 - frameThickness/2, 0, 0.01);

        // Right frame
        const right = new THREE.Mesh(
            new THREE.PlaneGeometry(frameThickness, artSize),
            frameMaterial
        );
        right.position.set(artSize/2 + frameThickness/2, 0, 0.01);

        // Group for frame
        this.frameGroup = new THREE.Group();
        this.frameGroup.add(top, bottom, left, right);
        this.frameGroup.rotation.y = -Math.PI / 2;
        this.add(this.frameGroup);
    }

    // Change wrapping mode (repeat or clamp)
    setWrapMode(mode) {
        if (mode === 'repeat') {
            this.artTexture.wrapS = THREE.RepeatWrapping;
            this.artTexture.wrapT = THREE.RepeatWrapping;
        } else {
            this.artTexture.wrapS = THREE.ClampToEdgeWrapping;
            this.artTexture.wrapT = THREE.ClampToEdgeWrapping;
        }
        this.artTexture.needsUpdate = true;
    }

    // Rotate artwork texture
    rotateTexture(angleRadians) {
        this.artTexture.rotation = angleRadians;
    }
}

export { MyFrame };
