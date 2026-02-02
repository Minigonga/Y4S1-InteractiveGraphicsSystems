import * as THREE from 'three';

class MyBook extends THREE.Group {
    constructor() {
        super();

        const textureLoader = new THREE.TextureLoader();

        // Textures
        const bookCoverTexture = textureLoader.load('./textures/book_cover.jpg');
        const sideTexture1 = textureLoader.load('./textures/side_book.jpg');
        const sideTexture2 = textureLoader.load('./textures/side_book.jpg');
        sideTexture1.rotation = Math.PI / 2;
        sideTexture1.center.set(0.5, 0.5);
        
        // Materials
        const coverMaterial = new THREE.MeshPhongMaterial({ 
            map: bookCoverTexture,
            specular: "#000000", 
            emissive: "#000000", 
            shininess: 90,
            side: THREE.DoubleSide 
        });

        const pageEdgeMaterial1 = new THREE.MeshPhongMaterial({ 
            map: sideTexture1,
            specular: "#000000", 
            emissive: "#000000", 
            shininess: 30,
            side: THREE.DoubleSide 
        });
        
        const pageEdgeMaterial2 = new THREE.MeshPhongMaterial({ 
            map: sideTexture2,
            specular: "#000000", 
            emissive: "#000000", 
            shininess: 30,
            side: THREE.DoubleSide 
        });

        const pagesMaterial = new THREE.MeshPhongMaterial({
            color: "#f5f5dc",
            specular: "#000000", 
            emissive: "#000000", 
            shininess: 10,
            side: THREE.DoubleSide 
        });

        // Material for stand
        const table_text = textureLoader.load('./textures/table_text.png');
        let book_holder = new THREE.MeshStandardMaterial({
            map: table_text,
            color: 0xAAAAAA,
            roughness: 0.7,
            metalness: 0.0,
        });

        // Book covers
        const bookCover1 = new THREE.BoxGeometry(1.5, 1, 0.1);
        const bookCoverMesh1 = new THREE.Mesh(bookCover1, coverMaterial);
        bookCoverMesh1.position.set(0, 2, 0.075);
        bookCoverMesh1.rotation.x = -Math.PI / 64;
        this.add(bookCoverMesh1);

        const bookCover2 = new THREE.BoxGeometry(1.5, 1, 0.1);
        const bookCoverMesh2 = new THREE.Mesh(bookCover2, coverMaterial);
        bookCoverMesh2.position.set(0, 1, 0.1);
        this.add(bookCoverMesh2);

        // Book pages 1
        const bookPages1 = new THREE.BoxGeometry(1.4, 0.9, 0.1);
        const pagesMaterials1 = [
            pageEdgeMaterial1, // right
            pageEdgeMaterial1, // left
            pageEdgeMaterial2, // top
            pageEdgeMaterial2, // bottom
            pagesMaterial,     // front
            pagesMaterial      // back
        ];
        const bookPagesMesh1 = new THREE.Mesh(bookPages1, pagesMaterials1);
        bookPagesMesh1.position.set(0, 1.05, 0.15);
        this.add(bookPagesMesh1);

        // Book pages 2
        const bookPages2 = new THREE.BoxGeometry(1.4, 0.9, 0.15);
        const pagesMaterials2 = [
            pageEdgeMaterial1, // right
            pageEdgeMaterial1, // left
            pageEdgeMaterial2, // top
            pageEdgeMaterial2, // bottom
            pagesMaterial,     // front
            pagesMaterial      // back
        ];
        const bookPagesMesh2 = new THREE.Mesh(bookPages2, pagesMaterials2);
        bookPagesMesh2.rotation.x = -Math.PI / 64;
        bookPagesMesh2.position.set(0, 1.95, 0.15);
        this.add(bookPagesMesh2);

        // Book spines
        const bookSpine1 = new THREE.BoxGeometry(1.2, 1, 0.1);
        const bookSpineMesh1 = new THREE.Mesh(bookSpine1, book_holder);
        bookSpineMesh1.position.set(0.2, 1.5, 0);
        bookSpineMesh1.rotation.x = -Math.PI / 128;
        this.add(bookSpineMesh1);

        const bookSpine2 = new THREE.BoxGeometry(0.1, 1, 0.5);
        const bookSpineMesh2 = new THREE.Mesh(bookSpine2, book_holder);
        bookSpineMesh2.position.set(0.8, 1.5, -0.1);
        bookSpineMesh2.rotation.x = -Math.PI / 128;
        this.add(bookSpineMesh2);

        // Slight tilt for realism
        this.rotateX(Math.PI / 16);
    }
}

export { MyBook };
