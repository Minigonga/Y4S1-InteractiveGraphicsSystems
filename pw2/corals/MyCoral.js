// MyCoral.js
import * as THREE from 'three';

class MyCoral extends THREE.LOD {
    constructor(options) {
        super();

        this.rules = options.rules;
        this.iterations = options.complexity || 3;

        this.highDetail = 0;
        this.lowDetail = 20;

        this.highMaterial = options.highMaterial;
        this.lowMaterial = options.lowMaterial;

        this.waveIntensity = options.waveIntensity || 0.3;
        this.waveFrequency = options.waveFrequency || 0.006;

        this.animationTime = 0;
        this.originalBranchData = [];

        // L-system generation
        const baseAngle = 50 * THREE.MathUtils.DEG2RAD;
        const variableAngle = 15 * THREE.MathUtils.DEG2RAD;
        const randomAngle = (base) => base + (Math.random() * 2 - 1) * variableAngle;
        const axiom = 'X';
        let currentString = axiom;

        for (let i = 0; i < this.iterations; i++) {
            let nextString = '';
            for (const char of currentString) {
                nextString += this.rules[char] || char;
            }
            currentString = nextString;
        }

        // Turtle graphics
        const stack = [];
        let turtle = { position: new THREE.Vector3(), quaternion: new THREE.Quaternion() };
        let branchLength = 2;
        const lengthFactor = 1.4;

        const axisX = new THREE.Vector3(1, 0, 0);
        const axisY = new THREE.Vector3(0, 1, 0);
        const axisZ = new THREE.Vector3(0, 0, 1);
        const q = new THREE.Quaternion();

        // LOD groups
        const highDetailGroup = new THREE.Group();
        const lowDetailGroup = new THREE.Group();

        // Generate branches
        for (const char of currentString) {
            switch (char) {
                case 'F': {
                    const startPosition = turtle.position.clone();
                    const forward = new THREE.Vector3(0, 1, 0)
                        .applyQuaternion(turtle.quaternion)
                        .multiplyScalar(branchLength);
                    turtle.position.add(forward);

                    const orientation = new THREE.Quaternion().setFromUnitVectors(axisY, forward.clone().normalize());
                    const scale = new THREE.Vector3(1, branchLength, 1);

                    // High-detail mesh
                    const geoHigh = new THREE.CylinderGeometry(1, 0.5, branchLength, 6);
                    geoHigh.translate(0, branchLength / 2, 0);
                    const meshHigh = new THREE.Mesh(geoHigh, this.highMaterial);
                    meshHigh.position.copy(startPosition);
                    meshHigh.quaternion.copy(orientation);
                    meshHigh.castShadow = true;
                    meshHigh.receiveShadow = true;
                    highDetailGroup.add(meshHigh);

                    // Low-detail mesh
                    const geoLow = new THREE.CylinderGeometry(1, 0.5, branchLength, 3);
                    geoLow.translate(0, branchLength / 2, 0);
                    const meshLow = new THREE.Mesh(geoLow, this.lowMaterial);
                    meshLow.position.copy(startPosition);
                    meshLow.quaternion.copy(orientation);
                    meshLow.castShadow = true;
                    meshLow.receiveShadow = true;
                    lowDetailGroup.add(meshLow);

                    // Store branch data
                    this.originalBranchData.push({
                        startPosition: startPosition.clone(),
                        orientation: orientation.clone(),
                        scale: scale.clone(),
                        height: startPosition.y,
                        phaseOffset: Math.random() * Math.PI * 2,
                        highMesh: meshHigh,
                        lowMesh: meshLow
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
                case ']': {
                    const state = stack.pop();
                    if (state) {
                        turtle.position.copy(state.position);
                        turtle.quaternion.copy(state.quaternion);
                        branchLength = state.length;
                    }
                    break;
                }
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

    animate(deltaTime) {
        if (this.getCurrentLevel() === 1) return;
        const amp = this.waveIntensity;
        const freq = this.waveFrequency;

        for (const branch of this.originalBranchData) {
            const time = deltaTime + branch.phaseOffset;
            const y = branch.height;
            const swayFactor = THREE.MathUtils.clamp(y / this.maxHeight, 0.2, 1.0);
            const sway = Math.sin(time + y * freq) * amp * 0.4 * swayFactor;
            const swayRot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), sway);

            branch.highMesh.quaternion.copy(branch.orientation).multiply(swayRot);
            branch.lowMesh.quaternion.copy(branch.highMesh.quaternion);
        }

        this.rotation.z = Math.sin(deltaTime * 0.5) * 0.05;
        this.rotation.x = Math.sin(deltaTime * 0.3) * 0.03;
    }
}

export { MyCoral };
