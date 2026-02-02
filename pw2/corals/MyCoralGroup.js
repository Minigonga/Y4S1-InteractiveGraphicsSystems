import * as THREE from 'three';
import { MyCoral } from './MyCoral.js';
import { MyCoralStochastic } from './MyCoralStochastic.js';


/**
 * MyCoralGroup
 * Represents a group of corals, managing their creation, materials, and animation.
 * Inherits from THREE.Group.
 */
export class MyCoralGroup extends THREE.Group {
    /**
     * Constructs a new MyCoralGroup, creates coral(s) based on type and sets up materials.
     * @param {Object} options - Configuration for coral type and position.
     */
    constructor(options) {
        super();

        // Store the coral type for filtering purposes
        this.type = options.type;

        // Load textures for coral materials
        const textureLoader = new THREE.TextureLoader();
        const normalMap = textureLoader.load('textures/coralTexture/coral1_normal-ogl.jpg');
        const roughnessMap = textureLoader.load('textures/coralTexture/coral1_roughness.jpg');
        const aoMap = textureLoader.load('textures/coralTexture/coral1_ao.jpg');

        // Generate a random vivid color for the coral
        const coralColor = new THREE.Color(this.getRandomVividColor());

        /**
         * High detail material for coral branches.
         * @type {THREE.MeshStandardMaterial}
         */
        this.highMaterial = new THREE.MeshStandardMaterial({
            color: coralColor.multiplyScalar(0.75),
            roughnessMap: roughnessMap,
            aoMap: aoMap,
            normalMap: normalMap,
        });

        /**
         * Low detail material for coral branches.
         * @type {THREE.MeshStandardMaterial}
         */
        this.lowMaterial = new THREE.MeshStandardMaterial({
            color: coralColor.multiplyScalar(0.75),
        });

        /**
         * L-system rules for coral generation.
         * @type {Object}
         */
        this.rules = {
            'X': '[+FX][-FX][^FX][&FX]',
            'F': 'FX'
        };

        /**
         * Stochastic rules for random L-system expansion.
         * @type {Object}
         */
        this.stochasticRules = {
            'X': [
                { prob: 0.10, rule: 'FF' },
                { prob: 0.10, rule: 'F[+X]^X' },
                { prob: 0.10, rule: 'F[-X]^X' },
                { prob: 0.10, rule: 'F[+X]&X' },
                { prob: 0.10, rule: 'F[-X]&X' },
                { prob: 0.50, rule: 'F[+X][-X][&X][^X]' }
            ],
            'F': [
                { prob: 0.05, rule: 'FF' },
                { prob: 0.15, rule: 'F[&F]-F' },
                { prob: 0.15, rule: 'F[^F]+F' },
                { prob: 0.15, rule: 'F[^F]-F' },
                { prob: 0.15, rule: 'F[&F]+F' },
                { prob: 0.35, rule: 'F[+X][-X][&X][^X]' }
            ]
        };

        /**
         * The coral instance managed by this group.
         * @type {MyCoral|MyCoralStochastic}
         */
        this.coral = null;

        // Create coral based on type
        switch (options.type) {
            case 0: 
                this.coral = new MyCoral(
                    { complexity: 3, rules: this.rules, pos: options.pos, highMaterial: this.highMaterial, lowMaterial: this.lowMaterial }, 
                );
                this.coral.scale.setScalar(0.2);
                this.add(this.coral);
                break;
            case 1: 
                this.coral = new MyCoralStochastic(
                    { complexity: 4, rules: this.rules, stochasticRules: this.stochasticRules, pos: options.pos, highMaterial: this.highMaterial, lowMaterial: this.lowMaterial  }, 
                );
                this.coral.scale.setScalar(0.2);
                this.add(this.coral);
                break;
            default: break;
        }
    }

    /**
     * Toggles the wireframe mode for all coral meshes in the group.
     */
    setWireframe() {
        let currentState = false;

        this.coralGroup.traverse(child => {
            if (child.isMesh && child.material) {
                const mat = Array.isArray(child.material)
                    ? child.material[0]
                    : child.material;
                currentState = mat.wireframe;
                return;
            }
        });

        const newState = !currentState;

        this.coralGroup.traverse(child => {
            if (child.isMesh && child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => (mat.wireframe = newState));
                } else {
                    child.material.wireframe = newState;
                }
            }
        });
    }

    /**
     * Animates all corals in the group by calling their animate methods.
     * @param {number} deltaTime - Current time or frame count.
     */
    animate(deltaTime) {
        this.traverse(child => {
            if (typeof child.animate === 'function') {
                child.animate(deltaTime);
            }
        });
    }

    /**
     * Sets the emissive color of all coral meshes when selected or deselected.
     * @param {boolean} selected - Whether the coral group is selected.
     */
    onSelect(selected) {
        const emissiveColor = selected ? 0xffaa00 : 0x000000;

        this.traverse(child => {
            if (child.isMesh) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => {
                        if (mat.emissive) mat.emissive.setHex(emissiveColor);
                    });
                } else if (child.material && child.material.emissive) {
                    child.material.emissive.setHex(emissiveColor);
                }
            }
        });
    }

    /**
     * Generates a random vivid color in HSL space and converts it to hex.
     * @returns {string} Hex color string.
     */
    getRandomVividColor() {
        const hue = Math.random() * 360;
        const saturation = 70 + Math.random() * 30;
        const lightness = 50 + Math.random() * 20;

        function hslToRgb(h, s, l) {
            s /= 100;
            l /= 100;
            const k = n => (n + h / 30) % 12;
            const a = s * Math.min(l, 1 - l);
            const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
            return [f(0), f(8), f(4)].map(x => Math.round(x * 255));
        }

        const [r, g, b] = hslToRgb(hue, saturation, lightness);
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }

}