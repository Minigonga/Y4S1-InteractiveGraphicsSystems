
// MyCrab.js
// Implements a stylized crab model for the underwater scene.
// All classes and methods are documented for clarity and maintainability.

import * as THREE from 'three';


/**
 * MyCrab
 * Procedurally generates a stylized crab with body, legs, arms, and claws.
 * Supports selection highlighting.
 */
class MyCrab extends THREE.Group {
    /**
     * @param {Object} options - Crab parameters (position, etc.)
     */
    constructor(options) {
        super();
        this.options = options;

        this.material = new THREE.MeshPhongMaterial({
            color: '#aa4e2f',
            specular: '#000000',
            emissive: '#000000',
            shininess: 90
        });

        this.createBody();
        this.createLegs();
        this.createArms();
        this.createClaws();
        this.position.set(this.options.pos.x, this.options.pos.y - 0.25, this.options.pos.z);

        // Enable shadows for all parts except shieldMesh (if present)
        this.traverse(child => {
            if (child !== this.shieldMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }

    // === 🦀 BODY ===
    /**
     * Creates the crab's main body (shell).
     */
    createBody() {
        const bodyGeometry = new THREE.SphereGeometry(0.5, 6, 6);
        const bodyMesh = new THREE.Mesh(bodyGeometry, this.material);
        bodyMesh.scale.set(0.8, 0.5, 1);
        bodyMesh.position.set(0, 0.25, 0);
        this.add(bodyMesh);
        this.bodyMesh = bodyMesh;
    }

    // === 🦵 LEGS ===
    /**
     * Creates all crab legs by calling createLegSet with different parameters.
     */
    createLegs() {
        this.createLegSet(4, Math.PI / 4, 0.5, true);
        // Back legs
        this.createLegSet(4, -Math.PI / 4, -0.5, false);
        // Outer front
        this.createLegSet(4, -Math.PI / 4, 0.8, true);
        // Outer back
        this.createLegSet(4, Math.PI / 4, -0.8, false);
    }

    /**
     * Creates a set of crab legs.
     * @param {number} count - Number of legs in the set
     * @param {number} rotationX - X rotation for the legs
     * @param {number} zOffset - Z offset for leg placement
     * @param {boolean} isFront - Whether this is a front or back leg set
     */
    createLegSet(count, rotationX, zOffset, isFront) {
        for (let i = 0; i < count; i++) {
            const pivot = new THREE.Object3D();
            pivot.position.set(0, 0.25, 0);
            this.add(pivot);

            const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 6);
            const legMesh = new THREE.Mesh(legGeometry, this.material);
            legMesh.position.set(0, 0.125, zOffset);
            legMesh.rotateX(rotationX);
            pivot.add(legMesh);

            pivot.rotateY(isFront ? i / 3 : -i / 3);
        }
    }

    // === 👊 ARMS ===
    /**
     * Creates the crab's arms (including big arms for claws).
     */
    createArms() {
        const armData = [
            { yRot: 1 },
            { yRot: -1 }
        ];

        armData.forEach(data => {
            const pivot = new THREE.Object3D();
            pivot.position.set(0, 0.25, 0);
            this.add(pivot);

            const armGeometry = new THREE.CylinderGeometry(0.125, 0.075, 0.5, 6);
            const armMesh = new THREE.Mesh(armGeometry, this.material);
            armMesh.scale.set(1, 1, 0.75);
            armMesh.position.set(-0.5, 0.125, 0);
            armMesh.rotateZ(Math.PI / 2.5);
            pivot.add(armMesh);
            pivot.rotateY(data.yRot);
        });

        const bigArmData = [
            { yRot: 0.8, xRot: -1 },
            { yRot: -0.8, xRot: 1 }
        ];

        bigArmData.forEach(data => {
            const pivot = new THREE.Object3D();
            pivot.position.set(0, 0.25, 0);
            this.add(pivot);

            const bigArmGeometry = new THREE.CylinderGeometry(0.2, 0.125, 0.5, 6);
            const bigArmMesh = new THREE.Mesh(bigArmGeometry, this.material);
            bigArmMesh.scale.set(1, 1, 0.75);
            bigArmMesh.position.set(-0.85,0.2,0);
            bigArmMesh.rotateZ(Math.PI / 2);
            bigArmMesh.rotateX(data.xRot * Math.PI/4);
            pivot.add(bigArmMesh);
            pivot.rotateY(data.yRot);
        });

    }

    // === CLAWS ===
    /**
     * Creates the crab's claws by calling createClawSection.
     */
    createClaws() {
        
        this.pivot4 = this.createClawSection(0.54, Math.PI * 1.2, true);
        this.pivot5 = this.createClawSection(-0.54, -Math.PI * 1.2, true);

        this.createClawSection(0.58, Math.PI * 1.2, false);
        this.createClawSection(-0.58, -Math.PI * 1.2, false);
    }

    /**
     * Creates a single claw section (main or secondary).
     * @param {number} yRotation - Y rotation for the claw
     * @param {number} xRotation - X rotation for the claw
     * @param {boolean} isMainClaw - Whether this is a main claw
     * @returns {THREE.Object3D|null} The pivot for the main claw, or null
     */
    createClawSection(yRotation, xRotation, isMainClaw) {
        const geometry = isMainClaw
            ? this.createMainClawGeometry()
            : new THREE.CylinderGeometry(0.05, 0.075, 0.25, 6);

        const clawMesh = new THREE.Mesh(geometry, this.material);
        clawMesh.position.set(isMainClaw ? -1.18 : -1.15, isMainClaw ? 0.29 : 0.1, 0);
        clawMesh.rotateZ(-Math.PI / 2);
        clawMesh.rotateX(xRotation);

        const pivot = new THREE.Object3D();
        pivot.position.set(0, 0.25, 0);
        this.add(pivot);
        pivot.add(clawMesh);
        pivot.rotateY(yRotation);

        return isMainClaw ? pivot : null;
    }

    /**
     * Creates the geometry for the main claw, deforming a cylinder.
     * @returns {THREE.CylinderGeometry}
     */
    createMainClawGeometry() {
        const geometry = new THREE.CylinderGeometry(0.05, 0.125, 0.4, 6, 1);
        const pos = geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const y = pos.getY(i);
            if (y > 0) pos.setX(i, pos.getX(i) + 0.2);
        }
        pos.needsUpdate = true;
        return geometry;
    }

    /**
     * Highlights or unhighlights the crab when selected.
     * @param {boolean} selected
     */
    onSelect(selected) {
        const emissiveColor = selected ? 0xffaa00 : 0x000000;

        this.material.emissive.setHex(emissiveColor);
    }
}

export { MyCrab };
