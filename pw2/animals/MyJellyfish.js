
// MyJellyfish.js
// Implements a proper LOD-safe animated jellyfish for Three.js scenes.

import * as THREE from 'three';

/**
 * MyJellyfish
 * Animated jellyfish model with LOD support, tentacle and cap animation, and internal lighting.
 * Designed for underwater scenes in Three.js.
 */
class MyJellyfish extends THREE.Group {
    /**
     * Constructs a new MyJellyfish instance, initializing geometry, materials, LOD, and animation parameters.
     */
    constructor() {
        super();

        // High and low detail roots for LOD
        this.highRoot = new THREE.Group(); 
        this.lowRoot = new THREE.Group(); 

        // Materials for different jellyfish parts
        this.outerMaterial = new THREE.MeshPhongMaterial({
            color: 0x7ccbe7,
            transparent: true,
            opacity: 0.75,
            shininess: 90,
            side: THREE.DoubleSide
        });
        this.innerMaterial = new THREE.MeshPhongMaterial({
            color: 0x1a3a6b,
            transparent: true,
            opacity: 0.85,
            shininess: 100,
            side: THREE.DoubleSide
        });
        this.stemMaterial = new THREE.MeshPhongMaterial({
            color: 0x3a7ca5,
            transparent: true,
            opacity: 0.7
        });
        this.tentacleMaterial = new THREE.MeshPhongMaterial({
            color: 0x7ccbe7,
            transparent: true,
            opacity: 0.6
        });

        // Geometry parameters
        this.radius = 1.0;
        this.innerRadius = 0.7;
        this.tentacleCount = 10;
        this.centerTentacleCount = 4;
        this.tentacleLength = 2.2;
        this.longTentacleLength = 3.7;

        // Tentacle animation state
        this.tentacles = [];

        // Animation parameters for floating
        this.floatPhase = Math.random() * Math.PI * 2;
        this.floatAmplitude = 0.08 + Math.random() * 0.08;

        // Build high and low detail models
        this.createHighDetailModel();
        this.createLowDetailModel();

        // Set up LOD (Level of Detail)
        this.lod = new THREE.LOD();
        this.lod.addLevel(this.highRoot, 0);
        this.lod.addLevel(this.lowRoot, 20);
        this.add(this.lod);
    }


    /**
     * Builds the high-detail model (animated cap, tentacles, and internal light).
     */
    createHighDetailModel() {
        this.createCap(this.highRoot, true);
        this.createInnerCap(this.highRoot);
        this.createStem(this.highRoot);
        this.createTentacles(this.highRoot);
        this.createLight();
    }


    /**
     * Builds the low-detail model (static, no light).
     */
    createLowDetailModel() {
        this.createCap(this.lowRoot, true);
        this.createInnerCap(this.lowRoot);
        this.createStem(this.lowRoot);
        this.createTentacles(this.lowRoot);
    }


    /**
     * Creates the outer cap geometry and mesh, with a flat border for animation if animatedBorder is true.
     * @param {THREE.Group} root - The parent group to add the cap to.
     * @param {boolean} animatedBorder - Whether to enable border animation.
     */
    createCap(root, animatedBorder = false) {
        let widthSegments, heightSegments;
        if (root === this.highRoot) {
            widthSegments = 10;
            heightSegments = 5;
        } else {
            widthSegments = 7;
            heightSegments = 4;
        }
        const geometry = new THREE.SphereGeometry(
            this.radius, widthSegments, heightSegments, 0, Math.PI * 2, 0, Math.PI / 2
        );
        if (animatedBorder) {
            const pos = geometry.attributes.position;
            for (let i = 0; i < pos.count; i++) {
                const y = pos.getY(i);
                if (Math.abs(y) < 0.01) pos.setY(i, 0);
            }
            pos.needsUpdate = true;
            if (root === this.highRoot) {
                this.highOuterCapGeometry = geometry;
                this.highOuterCapOriginal = Array.from(pos.array);
            }
        }
        const mesh = new THREE.Mesh(geometry, this.outerMaterial);
        mesh.position.y = -0.1;
        root.add(mesh);
        if (root === this.highRoot) {
            this.highOuterCapMesh = mesh;
        }
    }


    /**
     * Creates the inner cap geometry and mesh.
     * @param {THREE.Group} root - The parent group to add the inner cap to.
     */
    createInnerCap(root) {
        
        let widthSegments, heightSegments;

        if(root === this.highRoot) {
            widthSegments = 10;
            heightSegments = 5;
        }
        else {
            widthSegments = 8;
            heightSegments = 4;
        }
        
        const g = new THREE.SphereGeometry(
            this.innerRadius, widthSegments, heightSegments, 0, Math.PI * 2, 0, Math.PI / 2
        );
        const m = new THREE.Mesh(g, this.innerMaterial);
        m.position.y = -0.08;
        root.add(m);
    }


    /**
     * Creates the stem geometry and mesh.
     * @param {THREE.Group} root - The parent group to add the stem to.
     */
    createStem(root) {
        const g = new THREE.CylinderGeometry(0.13, 0.09, 0.7, 6);
        const m = new THREE.Mesh(g, this.stemMaterial);
        m.position.y = -0.35;
        root.add(m);
    }


    /**
     * Creates all tentacles for the jellyfish.
     * @param {THREE.Group} root - The parent group to add tentacles to.
     */
    createTentacles(root) {
        const baseRadius = this.innerRadius * 0.92;

        for (let i = 0; i < this.tentacleCount; i++) {
            const angle = (i / this.tentacleCount) * Math.PI * 2;
            this.addTentacle(angle, baseRadius, this.tentacleLength, 0.045, root);
        }

        for (let i = 0; i < this.centerTentacleCount; i++) {
            const angle = (i / this.centerTentacleCount) * Math.PI * 2 + Math.PI / 4;
            this.addTentacle(angle, this.innerRadius * 0.25, this.longTentacleLength, 0.065, root);
        }
    }


    /**
     * Adds a single tentacle to the jellyfish.
     * @param {number} angle - Angle around the cap for tentacle placement.
     * @param {number} baseRadius - Distance from center for tentacle base.
     * @param {number} length - Tentacle length.
     * @param {number} radius - Tentacle thickness.
     * @param {THREE.Group} root - The parent group to add the tentacle to.
     */
    addTentacle(angle, baseRadius, length, radius, root) {
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, -length, 0)
        ]);

        let tubularSegments, radialSegments;

        if(root === this.highRoot) {
            tubularSegments = 8;
            radialSegments = 4;
        }
        else {
            tubularSegments = 6;
            radialSegments = 3;
        }
        const geometry = new THREE.TubeGeometry(curve, tubularSegments, radius, radialSegments, false);
        new THREE.TubeGeometry()
        const original = geometry.attributes.position.array.slice();

        const mesh = new THREE.Mesh(geometry, this.tentacleMaterial);
        mesh.position.set(
            Math.cos(angle) * baseRadius,
            -0.05,
            Math.sin(angle) * baseRadius
        );

        root.add(mesh);

        this.tentacles.push({
            mesh,
            geometry,
            original,
            angle,
            length,
            phase: Math.random() * Math.PI * 2,
            amplitude: 0.3 + Math.random() * 0.2
        });
    }


    /**
     * Creates an internal spot light for the high-detail model.
     */
    createLight() {
        const light = new THREE.PointLight(0x7ccbe7, 10, 10, 1);
        light.position.set(0, 0.2, 0);
        this.add(light);
    }


    /**
     * Animates the jellyfish, including floating, tentacle waving, and cap border waves.
     * Only animates if the high-detail LOD is active.
     * @param {number} time - The current animation time.
     */
    animate(time) {

        // Only animate if high-detail LOD is active
        if (this.lod.getCurrentLevel() !== 0) {
            this.lowRoot.position.y = Math.sin(time * 1.5 + this.floatPhase) * this.floatAmplitude;
            return;
        }
        
        this.highRoot.position.y = Math.sin(time * 1.5 + this.floatPhase) * this.floatAmplitude;

        // Animate tentacles
        for (const t of this.tentacles) {
            const pos = t.geometry.attributes.position;
            for (let i = 0; i < pos.count; i++) {
                const oy = t.original[i * 3 + 1];
                const s = Math.abs(oy) / t.length;
                const f = s < 0.3 ? 0 : (s - 0.3) / 0.7;
                const w =
                    Math.sin(time * 2 + t.phase + s * 4) *
                    t.amplitude * f;

                pos.setXYZ(
                    i,
                    t.original[i * 3] + Math.cos(t.angle) * w,
                    oy,
                    t.original[i * 3 + 2] + Math.sin(t.angle) * w
                );
            }
            pos.needsUpdate = true;
        }

        // Animate the border of the outer cap (traveling wave around the flat edge)
        if (this.highOuterCapMesh && this.highOuterCapOriginal) {
            const pos = this.highOuterCapMesh.geometry.attributes.position;
            for (let i = 0; i < pos.count; i++) {
                const oy = this.highOuterCapOriginal[i * 3 + 1];
                if (Math.abs(oy) < 0.01) {
                    const ox = this.highOuterCapOriginal[i * 3];
                    const oz = this.highOuterCapOriginal[i * 3 + 2];
                    const a = Math.atan2(oz, ox);
                    pos.setY(
                        i,
                        -Math.sin(a * 6 + time * 2 + this.floatPhase) * 0.09
                    );
                }
            }
            pos.needsUpdate = true;
        }
    }


    /**
     * Updates the LOD selection based on camera distance. Call this in your render loop.
     * @param {THREE.Camera} camera - The camera to determine LOD level.
     */
    update(camera) {
        this.lod.update(camera);
    }


    /**
     * Returns true for identification as a MyJellyfish instance.
     */
    get isMyJellyfish() {
        return true;
    }

    /**
     * Sets the emissive color of the jellyfish when selected or deselected.
     * @param {boolean} selected - Whether the jellyfish is selected.
     */
    onSelect(selected) {
        const emissiveColor = selected ? 0xffaa00 : 0x000000;
        this.traverse(child => {
            if (child.isMesh && child.material) {
                const materials = Array.isArray(child.material)
                    ? child.material
                    : [child.material];

                materials.forEach(mat => {
                    if (mat.emissive) {
                        mat.emissive.setHex(emissiveColor);
                        mat.needsUpdate = true;
                    }
                });
            }
        });
    }
}

export { MyJellyfish };
