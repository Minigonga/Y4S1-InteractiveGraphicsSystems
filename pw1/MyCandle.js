import * as THREE from 'three';

class MyCandle extends THREE.Group {
    constructor() {
        super();

        // Materials
        const candleBodyMaterial = new THREE.MeshPhongMaterial({ 
            color: "#e9d163", shininess: 30 
        });
        const holderMaterial = new THREE.MeshPhongMaterial({ 
            color: "#c59701", shininess: 60, side: THREE.DoubleSide 
        });
        const wickMaterial = new THREE.MeshBasicMaterial({ color: "#000000" });
        const flameMaterial = new THREE.MeshStandardMaterial({
            emissive: 0xffff66, emissiveIntensity: 3, color: 0xffff00
        });

        // Geometries (reused)
        const cylSmall = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 32); 
        const cylHolder = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 32, 1, true);
        const cylBase = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 32);
        const cylArmLong = new THREE.CylinderGeometry(0.07, 0.07, 0.6, 32);
        const cylArmShort = new THREE.CylinderGeometry(0.07, 0.07, 0.2, 32);
        const cylArmWide = new THREE.CylinderGeometry(0.07, 0.07, 0.3, 32);
        const cylWick = new THREE.CylinderGeometry(0.01, 0.01, 0.1, 16);
        const flameGeo = new THREE.SphereGeometry(0.05, 16, 16);

        // Candle body
        const candleBodyMesh = new THREE.Mesh(cylSmall, candleBodyMaterial);
        candleBodyMesh.position.set(0, 0.25, 0);
        this.add(candleBodyMesh);

        // Holder ring
        const candleHolderMesh = new THREE.Mesh(cylHolder, holderMaterial);
        candleHolderMesh.position.set(0, 0.05, 0);
        this.add(candleHolderMesh);

        // Base
        const candleBaseMesh = new THREE.Mesh(cylBase, holderMaterial);
        candleBaseMesh.position.set(0, 0, 0);
        this.add(candleBaseMesh);

        // Arms (reuse geometries via array config)
        const armConfigs = [
            { geo: cylArmLong, pos: [0, -0.3, 0], rot: 0 },
            { geo: cylArmShort, pos: [0.015, -0.67, 0], rot: Math.PI/18 },
            { geo: cylArmShort, pos: [0.05, -0.8, 0], rot: Math.PI/9 },
            { geo: cylArmShort, pos: [0.12, -0.95, 0], rot: Math.PI/6 },
            { geo: cylArmShort, pos: [0.22, -1.05, 0], rot: Math.PI/3 },
            { geo: cylArmWide, pos: [0.42, -1.1, 0], rot: Math.PI/2 },
        ];
        armConfigs.forEach(cfg => {
            const arm = new THREE.Mesh(cfg.geo, holderMaterial);
            arm.position.set(...cfg.pos);
            if (cfg.rot) arm.rotateZ(cfg.rot);
            this.add(arm);
        });

        // Wick
        const wick = new THREE.Mesh(cylWick, wickMaterial);
        wick.position.set(0, 0.55, 0);
        this.add(wick);

        // Flame
        this.candleFlameMesh = new THREE.Mesh(flameGeo, flameMaterial);
        this.candleFlameMesh.position.set(0, 0.65, 0);
        this.add(this.candleFlameMesh);

        // Light
        this.candleLight = new THREE.SpotLight(0xfff4bd, 2, 5, Math.PI / 6, 0.5, 2);
        this.candleLight.position.set(-0.5, 0.5, 0);
        this.candleLight.target.position.set(0.5, 1, 0);
        this.candleLight.angle = Math.PI;
        this.add(this.candleLight);
        this.add(this.candleLight.target);

        // Light helper
        this.candleLightHelper = new THREE.SpotLightHelper(this.candleLight);
    }
}

export { MyCandle };
