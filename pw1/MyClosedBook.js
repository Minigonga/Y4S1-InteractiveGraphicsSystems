import * as THREE from 'three';

class MyClosedBook extends THREE.Group {
    constructor({
        coverColor = 0x2a3b4c,
        pagesColor = 0xf5f5dc,   
        width = 1,              
        height = 1.5,            
        thickness = 0.45         
    } = {}) {
        super();

        // Cover material (shiny)
        const coverMaterial = new THREE.MeshPhongMaterial({ 
            color: coverColor,
            specular: "#111111",
            shininess: 60,
            side: THREE.DoubleSide 
        });

        // Pages material (matte)
        const pagesMaterial = new THREE.MeshPhongMaterial({
            color: pagesColor,
            specular: "#000000", 
            shininess: 10,
            side: THREE.DoubleSide 
        });

        // Dimensions for parts
        const pageWidth = width * 0.93;
        const pageHeight = height * 0.95;
        const pageThickness = thickness * 0.9;
        const coverThickness = thickness * 0.11;
        const spineThickness = thickness;
        const yCenter = height / 2;

        // Pages block
        const bookPages = new THREE.Mesh(
            new THREE.BoxGeometry(pageWidth, pageHeight, pageThickness),
            pagesMaterial
        );
        bookPages.position.set(0, yCenter, 0);
        this.add(bookPages);

        // Back cover
        const backCover = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, coverThickness),
            coverMaterial
        );
        backCover.position.set(0, yCenter, -(thickness / 2) + (coverThickness / 2));
        this.add(backCover);

        // Front cover
        const frontCover = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, coverThickness),
            coverMaterial
        );
        frontCover.position.set(0, yCenter, (thickness / 2) - (coverThickness / 2));
        this.add(frontCover);

        // Spine
        const spine = new THREE.Mesh(
            new THREE.BoxGeometry(0.1 * width, height, spineThickness),
            coverMaterial
        );
        spine.position.set(-(width / 2) + (0.05 * width), yCenter, 0);
        this.add(spine);
    }
}

export { MyClosedBook };
