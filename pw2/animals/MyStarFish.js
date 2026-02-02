
// MyStarFish.js
// Defines the MyStarFish class, a procedurally generated, shader-animated starfish with randomization options.
// All methods and classes are documented for clarity and maintainability.

import * as THREE from 'three';
import { createStarShaderMaterial } from './MyStarFishShader.js';


/**
 * MyStarFish
 * Represents a procedurally generated starfish with customizable appearance and procedural shader.
 * Inherits from THREE.Group.
 */
class MyStarFish extends THREE.Group {
    /**
     * Constructs a new MyStarFish instance with randomization and shader options.
     * @param {Object} options - Configuration for size, color, arms, rotation, and position.
     */
    constructor(options) {
        super();

        const defaults = {
            size: 1,
            minSize: 0.7,
            maxSize: 1.5,
            randomSize: true,
            randomArms: false,
            color: 0xff9966,
            randomColor: true,
            colorVariation: 0.3,
            randomRotation: true,
            pos: new THREE.Vector3(0, 0, 0),
            terrain: null
        };

        /**
         * Options for starfish appearance and behavior.
         * @type {Object}
         */
        this.options = { ...defaults, ...options };
        /**
         * Whether the starfish rotates itself (for animation).
         * @type {boolean}
         */
        this.rotatesItself = true;

        // Randomize size
        if (this.options.randomSize) {
            this.options.size = this.options.minSize + Math.random() * (this.options.maxSize - this.options.minSize);
        }

        // Randomize base color
        if (this.options.randomColor) {
            this.options.color = this.generateRandomColor();
        }

        /**
         * Shader material for procedural starfish patterns.
         * @type {THREE.ShaderMaterial}
         */
        this.material = createStarShaderMaterial(this.options.color, Math.random() * 1000);

        /**
         * Pivot object for scaling and arm placement.
         * @type {THREE.Object3D}
         */
        this.pivot = new THREE.Object3D();
        this.add(this.pivot);

        this.build();

        // Random rotation around Y-axis
        if (this.options.randomRotation) {
            this.rotation.y = Math.random() * Math.PI * 2;
        }

        // Set position and align to terrain if provided
        this.position.copy(this.options.pos);
    }

    /**
     * Generates a random color for the starfish, with HSL variation.
     * @returns {number} Hex color value.
     */
    generateRandomColor() {
        const starfishColors = [
            0xff9966, 0xff7744, 0xff5566, 0xff6688,
            0xee8866, 0xdd7744, 0xffaa77, 0xee9955,
            0xff8866, 0xdd6655
        ];

        const baseColor = starfishColors[Math.floor(Math.random() * starfishColors.length)];
        const color = new THREE.Color(baseColor);
        const hsl = color.getHSL({});
        hsl.h += (Math.random() - 0.5) * this.options.colorVariation * 0.1;
        hsl.s += (Math.random() - 0.5) * this.options.colorVariation;
        hsl.l += (Math.random() - 0.5) * this.options.colorVariation * 0.5;
        hsl.h = (hsl.h + 1) % 1;
        hsl.s = Math.max(0.3, Math.min(0.9, hsl.s));
        hsl.l = Math.max(0.3, Math.min(0.8, hsl.l));
        color.setHSL(hsl.h, hsl.s, hsl.l);
        return color.getHex();
    }

    /**
     * Builds the starfish geometry by creating and positioning arms.
     */
    build() {
        this.pivot.scale.setScalar(this.options.size);

        for (let i = 0; i < 5; i++) {
            let armScale = 1;
            if (this.options.randomArms) armScale = 0.8 + Math.random() * 0.4;

            const arm = new THREE.Mesh(
                new THREE.CylinderGeometry(0.12, 0.25, 1.0, 8),
                this.material
            );

            arm.castShadow = false;
            arm.receiveShadow = true;

            const angle = (i * 72 * Math.PI) / 180;
            arm.position.set(-Math.cos(angle) * 0.45, 0, Math.sin(angle) * 0.45);
            arm.rotation.set(0, angle, Math.PI / 2);
            arm.scale.setScalar(armScale);

            this.pivot.add(arm);
        }
    }

    /**
     * Sets the emissive color of the starfish when selected or deselected.
     * @param {boolean} selected - Whether the starfish is selected.
     */
    onSelect(selected) {
        const emissiveColor = selected ? 0xffaa00 : 0x000000;
        this.material.uniforms.uEmissive.value.setHex(emissiveColor);
    }
}


// Export the MyStarFish class for use in other modules.
export { MyStarFish };
