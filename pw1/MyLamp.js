import * as THREE from 'three';

class MyLamp extends THREE.Group {
    constructor() {
        super();

        // Material for lamp body
        let lampBodyMaterial = new THREE.MeshPhongMaterial({ 
            color: "#d29852", 
            specular: "#000000", 
            emissive: "#000000", 
            shininess: 90 
        });

        // Material for lamp cover
        let lampCoverMaterial = new THREE.MeshPhongMaterial({ 
            color: "#ff0e0e", 
            specular: "#000000", 
            emissive: "#000000", 
            shininess: 90,
            side: THREE.DoubleSide 
        });

        // Spotlight
        const lampLight = new THREE.SpotLight(0xf4f4bd);
        lampLight.visible = true;
        lampLight.position.set(0, 0.8, 0);
        lampLight.intensity = 10;
        lampLight.distance = 4;
        lampLight.penumbra = 0.1;
        lampLight.angle = Math.PI;
        lampLight.target.position.set(0, 0, 0);
        this.add(lampLight.target);
        this.lampLight = lampLight;
        this.add(lampLight);
        this.lampLightHelper = new THREE.SpotLightHelper(this.lampLight);

        // Bulb
        let lampBulb = new THREE.SphereGeometry(0.2, 32, 32);
        this.lampBulbMesh = new THREE.Mesh(
            lampBulb, 
            new THREE.MeshBasicMaterial({ color: "#ffff00" })
        );
        this.lampBulbMesh.position.set(0, 0.8, 0);
        this.add(this.lampBulbMesh);

        // Lamp base (cylinder)
        let lampBase = new THREE.CylinderGeometry(0.2, 0.2, 0.15, 32);
        let lampBaseMesh = new THREE.Mesh(lampBase, lampBodyMaterial);
        lampBaseMesh.position.set(0, 0, 0);
        this.add(lampBaseMesh);

        // Lamp neck (thin cylinder)
        let lampNeck = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 32);
        let lampNeckMesh = new THREE.Mesh(lampNeck, lampBodyMaterial);
        lampNeckMesh.position.set(0, 0.4, 0);
        this.add(lampNeckMesh);

        // Lamp shade/cover (open cylinder)
        let lampCover = new THREE.CylinderGeometry(0.25, 0.5, 0.65, 32, 1, true);
        let lampCoverMesh = new THREE.Mesh(lampCover, lampCoverMaterial);
        lampCoverMesh.position.set(0, 0.75, 0);
        this.add(lampCoverMesh);
    }
}

export { MyLamp };
