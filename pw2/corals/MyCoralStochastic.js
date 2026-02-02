
// MyCoralStochastic.js
// Defines the MyCoralStochastic class, a procedural stochastic L-system coral with LOD and animation.
// All methods and classes are documented for clarity and maintainability.

import * as THREE from 'three';

/**
 * MyCoralStochastic
 * Represents a procedural coral generated using stochastic L-system rules, with LOD and waving animation.
 * Inherits from THREE.LOD.
 */
class MyCoralStochastic extends THREE.LOD {
    /**
     * Constructs a new MyCoralStochastic instance, generates geometry and LOD branches.
     * @param {Object} options - Configuration for rules, stochastic rules, complexity, materials, and position.
     */
    constructor(options) {
        super();

        /**
         * L-system rules for coral generation.
         * @type {Object}
         */
        this.rules = options.rules;
        /**
         * Stochastic rules for random L-system expansion.
         * @type {Object}
         */
        this.stochasticRules = options.stochasticRules;
        /**
         * Number of L-system iterations (complexity).
         * @type {number}
         */
        this.iterations = options.complexity || 3;
        /**
         * LOD distance for high detail.
         * @type {number}
         */
        this.highDetail = 0;
        /**
         * LOD distance for low detail.
         * @type {number}
         */
        this.lowDetail = 20;
        /**
         * Material for high detail meshes.
         * @type {THREE.Material}
         */
        this.highMaterial = options.highMaterial;
        /**
         * Material for low detail meshes.
         * @type {THREE.Material}
         */
        this.lowMaterial = options.lowMaterial;

        /**
         * Intensity of waving animation.
         * @type {number}
         */
        this.waveIntensity = options.waveIntensity || 0.3;
        /**
         * Frequency of waving animation.
         * @type {number}
         */
        this.waveFrequency = options.waveFrequency || 0.006;
        /**
         * Animation time accumulator.
         * @type {number}
         */
        this.animationTime = 0;

        /**
         * Array of original branch data for animation.
         * @type {Array}
         */
        this.originalBranchData = [];

        // L-system string generation with stochastic rules
        const baseAngle = 25 * THREE.MathUtils.DEG2RAD;
        const variableAngle = 10 * THREE.MathUtils.DEG2RAD;
        const axiom = 'X';
        let currentString = axiom;

        for (let i = 0; i < this.iterations; i++) {
            let nextString = '';
            for (const char of currentString) {
                if (this.stochasticRules[char]) {
                    nextString += this.chooseNextRule(this.stochasticRules[char]);
                } else if (this.rules[char]) {
                    nextString += this.rules[char];
                } else {
                    nextString += char;
                }
            }
            currentString = nextString;
        }

        // Turtle graphics for branch placement
        const stack = [];
        let turtle = { position: new THREE.Vector3(), quaternion: new THREE.Quaternion() };
        let branchLength = 3;
        const lengthFactor = 0.9;

        const axisX = new THREE.Vector3(1, 0, 0);
        const axisY = new THREE.Vector3(0, 1, 0);
        const axisZ = new THREE.Vector3(0, 0, 1);
        const q = new THREE.Quaternion();
        const randomAngle = (base) => base + (Math.random() * 2 - 1) * (10 * THREE.MathUtils.DEG2RAD);

        const highDetailGroup = new THREE.Group();
        const lowDetailGroup = new THREE.Group();

        for (const char of currentString) {
            switch (char) {
                case 'F': {
                    const startPosition = turtle.position.clone();
                    const forward = new THREE.Vector3(0, 1, 0)
                        .applyQuaternion(turtle.quaternion)
                        .multiplyScalar(branchLength);
                    turtle.position.add(forward);

                    // High-detail mesh
                    const branchGeo = new THREE.CylinderGeometry(0.5, 0.4, branchLength, 8);
                    branchGeo.translate(0, branchLength / 2, 0);
                    const orientation = new THREE.Quaternion().setFromUnitVectors(axisY, forward.clone().normalize());
                    const branchMesh = new THREE.Mesh(branchGeo, this.highMaterial);
                    branchMesh.position.copy(startPosition);
                    branchMesh.quaternion.copy(orientation);
                    highDetailGroup.add(branchMesh);

                    // Low-detail mesh
                    const branchGeoLow = new THREE.CylinderGeometry(0.5, 0.4, branchLength, 3);
                    branchGeoLow.translate(0, branchLength / 2, 0);
                    const branchMeshLow = new THREE.Mesh(branchGeoLow, this.lowMaterial);
                    branchMeshLow.position.copy(startPosition);
                    branchMeshLow.quaternion.copy(orientation);
                    lowDetailGroup.add(branchMeshLow);

                    this.originalBranchData.push({
                        mesh: branchMesh,
                        startPosition: startPosition.clone(),
                        orientation: orientation.clone(),
                        scale: new THREE.Vector3(1, 1, 1),
                        height: startPosition.y,
                        phaseOffset: Math.random() * Math.PI * 2,
                    });

                    break;
                }
                case '+': turtle.quaternion.multiply(q.setFromAxisAngle(axisZ, randomAngle(baseAngle))); break;
                case '-': turtle.quaternion.multiply(q.setFromAxisAngle(axisZ, -randomAngle(baseAngle))); break;
                case '&': turtle.quaternion.multiply(q.setFromAxisAngle(axisX, randomAngle(baseAngle))); break;
                case '^': turtle.quaternion.multiply(q.setFromAxisAngle(axisX, -randomAngle(baseAngle))); break;
                case '[':
                    stack.push({ position: turtle.position.clone(), quaternion: turtle.quaternion.clone(), length: branchLength });
                    branchLength *= lengthFactor;
                    break;
                case ']':
                    const state = stack.pop();
                    if (state) {
                        turtle.position.copy(state.position);
                        turtle.quaternion.copy(state.quaternion);
                        branchLength = state.length;
                    }
                    break;
                default: break;
            }
        }

        /**
         * Maximum height of any branch (for animation scaling).
         * @type {number}
         */
        this.maxHeight = Math.max(...this.originalBranchData.map(b => b.height));

        highDetailGroup.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        lowDetailGroup.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        this.addLevel(highDetailGroup, this.highDetail);
        this.addLevel(lowDetailGroup, this.lowDetail);

        this.position.setY(options.pos.y);
    }

    /**
     * Animates the waving motion of the coral branches.
     * @param {number} deltaTime - Current time or frame count.
     */
    animate(deltaTime) {
        if (this.getCurrentLevel() == 1) return;
        const amplitude = this.waveIntensity;
        const frequency = this.waveFrequency;

        for (let i = 0; i < this.originalBranchData.length; i++) {
            const branch = this.originalBranchData[i];
            const time = deltaTime + branch.phaseOffset;
            const y = branch.height;

            const swayFactor = THREE.MathUtils.clamp(y / this.maxHeight, 0.2, 1.0);
            const sway = Math.sin(time + y * frequency) * amplitude * 0.4 * swayFactor;
            const swayRot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), sway);
            branch.mesh.quaternion.copy(branch.orientation).multiply(swayRot);
        }

        this.rotation.z = Math.sin(deltaTime * 0.5) * 0.05;
        this.rotation.x = Math.sin(deltaTime * 0.3) * 0.03;
    }

    /**
     * Chooses the next rule for stochastic L-system expansion based on probabilities.
     * @param {Array} options - Array of rule objects with 'prob' and 'rule' properties.
     * @returns {string} The selected rule string.
     */
    chooseNextRule(options) {
        const total = options.reduce((sum, o) => sum + o.prob, 0);
        let randomValue = Math.random() * total;
        for (const opt of options) {
            randomValue -= opt.prob;
            if (randomValue <= 0) return opt.rule;
        }
        return options[options.length - 1].rule;
    }
}

// Export the MyCoralStochastic class for use in other modules.
export { MyCoralStochastic };
