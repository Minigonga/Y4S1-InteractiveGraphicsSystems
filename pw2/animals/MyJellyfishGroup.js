// MyJellyfishGroup.js
// Manages a group of animated jellyfish, each with independent animation and positioning.
// All classes and methods are documented for clarity and maintainability.

import * as THREE from 'three';
import { MyJellyfish } from './MyJellyfish.js';

/**
 * MyJellyfishGroup
 * Main class for managing a group of animated jellyfish, supporting group animation and selection.
 */
class MyJellyfishGroup extends THREE.Group {
    /**
     * Constructs a new jellyfish group, creating and positioning each jellyfish.
     * @param {number} count - Number of jellyfish to create (default: 2-4).
     * @param {object} [options] - Optional: { positions: [THREE.Vector3, ...] }
     */
    constructor(count = (2 + Math.ceil(Math.random() * 2)), options = {}) {
        super();
        this.jellyfishList = [];
        const positions = options.positions || [];
        for (let i = 0; i < count; i++) {
            const jelly = new MyJellyfish();
            if (positions[i]) {
                jelly.position.copy(positions[i]);
            } else {
                const angle = (i / count) * Math.PI * 2;
                jelly.position.set(Math.cos(angle) * 4, Math.random() * 2, Math.sin(angle) * 4);
            }
            this.jellyfishList.push(jelly);
            this.add(jelly);
        }
    }

    /**
     * Animates all jellyfish in the group.
     * @param {number} time - The current animation time.
     */
    animate(time) {
        for (const jelly of this.jellyfishList) {
            if (typeof jelly.animate === 'function') {
                jelly.animate(time);
            }
        }
    }


}

export { MyJellyfishGroup };
