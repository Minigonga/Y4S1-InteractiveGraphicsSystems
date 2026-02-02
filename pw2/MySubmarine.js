import * as THREE from 'three';

/**
 * MySubmarine
 * Represents a fully controllable submarine with physics, collision detection, lighting,
 * and visual effects. Includes shield system, procedural warning lights, and terrain/temple
 * collision detection using BVH (Bounding Volume Hierarchy).
 * Inherits from THREE.Group.
 */
class MySubmarine extends THREE.Group {

    /**
     * Constructs a new MySubmarine instance.
     * @param {THREE.Camera} camera - The camera attached to the submarine view.
     * @param {OrbitControls} controls - Camera controls for the submarine view.
     * @param {number} x - Initial X position.
     * @param {number} y - Initial Y position.
     * @param {number} z - Initial Z position.
     * @param {number} scale - Uniform scale factor for the submarine.
     * @param {THREE.Camera} freeFlyCamera - Reference to the free-fly camera.
     * @param {MyTerrain} terrain - Terrain object for collision detection.
     * @param {THREE.Object3D} temple - Temple object for collision detection.
     */
    constructor(camera, controls, x, y, z, scale, freeFlyCamera, terrain, temple) {
        super();

        this.freeFlyCamera = freeFlyCamera;
        this.camera = camera;
        this.controls = controls;
        this.position.set(x, y, z);
        this.scaleNumber = scale;
        this.terrain = terrain;
        this.temple = temple;

        const loader = new THREE.TextureLoader();
        
        this.texture = loader.load("./textures/submarine.png", tex => {
            tex.wrapS = THREE.ClampToEdgeWrapping;
            tex.wrapT = THREE.ClampToEdgeWrapping;
            tex.anisotropy = 8;
            tex.minFilter = THREE.LinearMipmapLinearFilter;
            tex.magFilter = THREE.LinearFilter;
            
            if (this.material) {
                this.material.needsUpdate = true;
            }
        });

        this.material = new THREE.MeshPhongMaterial({
            color: '#555555',
            map: this.texture,
        });

        this.forwardSpeed = 0;
        this.verticalSpeed = 0;
        this.turnSpeed = 0;

        this.propellerSpeed = 0;
        this.propellerMaxSpeed = 0.2;
        
        this.maxSpeed = 0.5;
        this.maxTurn = 0.05;

        this.acceleration = 0.01;
        this.verticalAcceleration = 0.0075;
        this.turnAcceleration = 0.001;
        this.drag = 0.9;
        this.turnDrag = 0.92;

        // Boundary constraints
        this.maxY = 92;  // Maximum Y position (height/depth limit)
        this.boundaryRadius = 160;  // Circular boundary radius on X-Z plane  

        // Default flashing frequency for the warning light (scaled by GUI)
        this.flashingFreq = 1.5;

        this.createShield();
        this.createSubmarine();
        this._initCollisionShape();
        this.initControls();
    }

    /**
     * Creates a glowing shield effect around the submarine using custom shader material.
     * The shield is a capsule-shaped force field with rim lighting.
     */
    createShield() {
        const shieldGeometry = new THREE.CapsuleGeometry(1.7, 5.3, 16, 16);

        this.shieldMaterial = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            side: THREE.FrontSide,
            blending: THREE.AdditiveBlending,
            uniforms: {
                c: { type: "f", value: 1.0 },
                p: { type: "f",value: 1.4 },
                glowColor: { type: "c", value: new THREE.Color(0x66ccff) },
                viewVector: { type: "v3", value: new THREE.Vector3(100,20,0) }
            },
            vertexShader: `
                uniform vec3 viewVector;
                uniform float c;
                uniform float p;
                varying float intensity;
                void main() {
                    vec3 vNormal = normalize(normalMatrix * normal);
                    vec3 vNormel = normalize(normalMatrix * viewVector);
                    intensity = pow(c - dot(vNormal, vNormel), p);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                varying float intensity;
                void main() {
                    vec3 glow = glowColor * intensity;
                    gl_FragColor = vec4(glow, 1.0);
                }
            `
        });

        this.shieldMesh = new THREE.Mesh(shieldGeometry, this.shieldMaterial);

        this.shieldMesh.rotation.z = Math.PI / 2;

        this.shieldMesh.position.set(-0.2, 0.2, 0);
        this.shieldMesh.userData.ignoreSelection = true;
        this.shieldMesh.renderOrder = 999;
        this.shieldMesh.visible = false;
        this.add(this.shieldMesh);
    }

    /**
     * Constructs the 3D model of the submarine including body, fins, hatch, lights,
     * periscope, and propeller. Sets up materials and textures.
     */
    createSubmarine() {
        // Body
        const bodyGeometry = new THREE.CapsuleGeometry(0.751, 3, 8, 8);
        const bodyMesh = new THREE.Mesh(bodyGeometry, this.material);
        bodyMesh.rotation.z = Math.PI / 2;
        bodyMesh.position.set(1.5, 0, 0);
        this.add(bodyMesh);

        const cylinderBody = new THREE.CylinderGeometry(0.75, 0.75, 2, 8, 1, true);
        const cylinderBodyMesh = new THREE.Mesh(cylinderBody, this.material);
        cylinderBodyMesh.rotation.z = Math.PI / 2;
        cylinderBodyMesh.position.set(0, 0, 0);
        this.add(cylinderBodyMesh);
        
        const coneBody = new THREE.CylinderGeometry(0.2, 0.75, 3, 8, 8, false);
        const coneBodyMesh = new THREE.Mesh(coneBody, this.material);
        coneBodyMesh.rotation.z = Math.PI / 2;
        coneBodyMesh.position.set(-2.5, 0, 0);
        this.add(coneBodyMesh);

        // Fins
        const finGeometry = new THREE.CylinderGeometry(0.15, 0.4, 0.75, 4, 1);
        finGeometry.rotateY(Math.PI/4); 
        const fin1Mesh = new THREE.Mesh(finGeometry, this.material);
        const fin2Mesh = new THREE.Mesh(finGeometry, this.material);
        const fin3Mesh = new THREE.Mesh(finGeometry, this.material);

        fin1Mesh.rotation.x = Math.PI / 2;
        fin1Mesh.position.set(-3, 0, -0.5);
        fin1Mesh.scale.set(0.75,1,0.25)
        this.add(fin1Mesh);
        fin1Mesh.rotation.x = -Math.PI / 2;
        fin2Mesh.position.set(-3, 0.5, 0);
        fin2Mesh.scale.set(0.75,1,0.25)
        this.add(fin2Mesh);
        fin3Mesh.rotation.x = Math.PI / 2;
        fin3Mesh.position.set(-3, 0, 0.5);
        fin3Mesh.scale.set(0.75,1,0.25)
        this.add(fin3Mesh);

        // Hatch
        const hatchGeometry = new THREE.CylinderGeometry(0.15, 0.3, 0.5, 4, 1); 
        hatchGeometry.rotateY(Math.PI/4); 
        const hatchMesh = new THREE.Mesh(hatchGeometry, this.material);
        hatchMesh.position.set(1.75, 0.75, 0);
        hatchMesh.scale.set(4, 1, 1);
        this.add(hatchMesh);

        // Light Fonts
        
        const lightFontGeometry = new THREE.CylinderGeometry(0.1, 0.075, 0.5, 8, 1); 
        this.light1Mesh = new THREE.Mesh(lightFontGeometry, this.material);
        this.light2Mesh = new THREE.Mesh(lightFontGeometry, this.material);

        this.light1Mesh.position.set(3.3, -0.45, -0.45);
        this.light1Mesh.rotateZ(-Math.PI/2);
        this.light1Mesh.rotateX(-Math.PI/8);

        this.light2Mesh.position.set(3.3, -0.45, 0.45);
        this.light2Mesh.rotateZ(-Math.PI/2);
        this.light2Mesh.rotateX(Math.PI/8);

        this.add(this.light1Mesh);
        this.add(this.light2Mesh);

        this.spotLight1 = new THREE.SpotLight(0xffff99, 50, 30, Math.PI / 4, 0.5, 0.5);
        this.spotLight1.position.copy(
            new THREE.Vector3(
                this.light1Mesh.position.x + 0.3,
                this.light1Mesh.position.y - 0.025,
                this.light1Mesh.position.z - 0.1
            )
        );
        this.spotLight1.castShadow = true;
        this.spotLight1.shadow.mapSize.width = 512;
        this.spotLight1.shadow.mapSize.height = 512;

        this.target1 = new THREE.Object3D();
        this.leftLightAngle = -Math.PI / 8;
        const target1Pos = this.calculateLightTarget(
            this.spotLight1.position, 
            this.leftLightAngle
        );
        this.target1.position.copy(target1Pos);
        this.add(this.target1);
        this.spotLight1.target = this.target1;
        this.add(this.spotLight1);

        // Light 2 (RIGHT)
        this.spotLight2 = new THREE.SpotLight(0xffff99, 50, 30, Math.PI / 4, 0.5, 0.5);
        this.spotLight2.position.copy(
            new THREE.Vector3(
                this.light2Mesh.position.x + 0.3,
                this.light2Mesh.position.y - 0.025,
                this.light2Mesh.position.z + 0.1
            )
        );
        this.spotLight2.castShadow = true;
        this.spotLight2.shadow.mapSize.width = 512;
        this.spotLight2.shadow.mapSize.height = 512;

        this.target2 = new THREE.Object3D();
        this.rightLightAngle = Math.PI / 8;
        const target2Pos = this.calculateLightTarget(
            this.spotLight2.position,
            this.rightLightAngle
        );
        this.target2.position.copy(target2Pos);
        this.add(this.target2);
        this.spotLight2.target = this.target2;
        this.add(this.spotLight2);

        // Periscope
        const periscope = new THREE.Group();

        const vertTubeGeo = new THREE.CylinderGeometry(0.095, 0.1, 1, 8);
        const vertMesh = new THREE.Mesh(vertTubeGeo, this.material);
        vertMesh.position.y = 0.5;

        const horizTubeGeo = new THREE.CylinderGeometry(0.095, 0.1, 0.5, 8);
        const horizMesh = new THREE.Mesh(horizTubeGeo, this.material);
        horizMesh.rotation.z = Math.PI / 2;
        horizMesh.position.y = 1;
        horizMesh.position.x = 0.25;

        const antenaGeo = new THREE.CylinderGeometry(0.05, 0.05, 2, 3);
        const antenaMesh = new THREE.Mesh(antenaGeo, this.material);
        antenaMesh.position.y = 0.75;
        antenaMesh.position.x = -0.5;

        const warningLightGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.05, 3);
        const warningLightMat = new THREE.MeshPhongMaterial({ 
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 10
        });
        this.warningLight = new THREE.Mesh(warningLightGeo, warningLightMat);
        this.warningLight.position.set(-0.5, 1.775, 0);
        periscope.add(this.warningLight);

        this.warningPointLight = new THREE.PointLight(0xff0000, 10, 10);
        this.warningPointLight.position.copy(this.warningLight.position);
        periscope.add(this.warningPointLight);

        this.warningLightFlashDir = 1;

        periscope.add(vertMesh, horizMesh, antenaMesh);
        periscope.position.set(2, 0.75, 0);
        periscope.scale.set(0.5, 0.5, 0.5);
        this.add(periscope);

       // Propeller
        this.propeller = new THREE.Group();

        // Shape of the blades
        const bladeShape = new THREE.Shape();
        bladeShape.moveTo(0, 0);
        bladeShape.quadraticCurveTo(0.4, 0.2, 0.8, 0);
        bladeShape.quadraticCurveTo(0.4, -0.3, 0, 0);

        const extrudeSettings = {
            depth: 0.05,
            bevelEnabled: false
        };

        const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, extrudeSettings, this.material);

        for (let i = 0; i < 4; i++) {
            const blade = new THREE.Mesh(bladeGeo, this.material);

            blade.rotation.z = (i * 2 * Math.PI) / 4;
            blade.rotation.y = Math.PI / 2;

            this.propeller.add(blade);
        }

        this.propeller.position.set(-4, 0, 0);

        this.add(this.propeller);

        this.scale.set(this.scaleNumber, this.scaleNumber, this.scaleNumber);
        this.traverse(child => {
            if (child !== this.shieldMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }

    /**
     * Initializes keyboard controls for submarine movement (WASD, PL keys).
     * Sets up keydown/keyup event listeners.
     */
    initControls() {
        this.keys = {};
        window.addEventListener('keydown', (e) => { this.keys[e.key.toLowerCase()] = true; });
        window.addEventListener('keyup', (e) => { this.keys[e.key.toLowerCase()] = false; });
    }

    /**
     * Updates submarine state including movement, collision detection, lighting, and effects.
     * Called each frame to apply physics and update visual components.
     * @param {THREE.Camera} activeCamera - Currently active camera for view-dependent effects.
     */
    update(activeCamera) {
        let moved = false;

        // --- Forward / Backward ---
        if (this.keys['w']) this.forwardSpeed += this.acceleration; moved = true;
        if (this.keys['s']) this.forwardSpeed -= this.acceleration; moved = true;

        // --- Vertical ---
        if (this.keys['p']) this.verticalSpeed += this.verticalAcceleration; moved = true;
        if (this.keys['l']) this.verticalSpeed -= this.verticalAcceleration; moved = true;

        // --- Turning ---
        if (this.keys['a']) this.turnSpeed += this.turnAcceleration; moved = true;
        if (this.keys['d']) this.turnSpeed -= this.turnAcceleration; moved = true;

        // --- Clamp speeds ---
        this.forwardSpeed = THREE.MathUtils.clamp(this.forwardSpeed, -this.maxSpeed, this.maxSpeed);
        this.verticalSpeed = THREE.MathUtils.clamp(this.verticalSpeed, -this.maxSpeed, this.maxSpeed);
        this.turnSpeed = THREE.MathUtils.clamp(this.turnSpeed, -this.maxTurn, this.maxTurn);

        // --- Apply drag ---
        this.forwardSpeed *= this.drag;
        this.verticalSpeed *= this.drag;
        this.turnSpeed *= this.turnDrag;

        // Stop very small values
        if (Math.abs(this.forwardSpeed) < 0.0001) this.forwardSpeed = 0;
        if (Math.abs(this.verticalSpeed) < 0.0001) this.verticalSpeed = 0;
        if (Math.abs(this.turnSpeed) < 0.00001) this.turnSpeed = 0;

        // --- Apply movement (with BVH collision checks, per-direction) ---
        const currentRotationY = this.rotation.y;
        this.rotation.y += this.turnSpeed;

        const rotationCollision = this._checkBVHSphereCollision(this.position);

        if (rotationCollision) {
            this.rotation.y = currentRotationY;
            this.turnSpeed = 0;
        }

        const forwardDir = new THREE.Vector3(
            Math.cos(this.rotation.y),
            0,
            -Math.sin(this.rotation.y)
        );

        const currentPosition = this.position.clone();

        const horizontalNext = currentPosition.clone().addScaledVector(forwardDir, this.forwardSpeed);
        const verticalNext = currentPosition.clone();
        verticalNext.y += this.verticalSpeed;

        const horizontalCollision = this._checkBVHSphereCollision(horizontalNext);
        const verticalCollision = this._checkBVHSphereCollision(verticalNext);

        let finalPosition = currentPosition.clone();

        if (!horizontalCollision) {
            finalPosition.copy(horizontalNext);
        } else {
            this.forwardSpeed = 0;
        }

        if (!verticalCollision) {
            finalPosition.y = verticalNext.y;
        } else {
            this.verticalSpeed = 0;
        }

        this.position.copy(finalPosition);

        this._applyBoundaryConstraints();

        this.propellerSpeed = this.forwardSpeed * 5;
        this.propeller.rotation.x += this.propellerSpeed;

        if (this.camera === activeCamera) {

            const cameraOffset = new THREE.Vector3(3, 0.5, 0);  
            const worldCameraPos = cameraOffset.clone().applyMatrix4(this.matrixWorld);

            this.camera.position.copy(worldCameraPos);

            const lookAtOffset = new THREE.Vector3(5, 0, 0)
                .applyMatrix4(this.matrixWorld);

            this.camera.lookAt(lookAtOffset);
            this.controls.target.copy(lookAtOffset);
        }

        if (this.warningLight) {
            const baseChange = 1.5;
            const freq = (this.flashingFreq !== undefined && this.flashingFreq !== null)
                ? this.flashingFreq
                : 1.5;
            const intensityChange = baseChange * freq * this.warningLightFlashDir;
            this.warningLight.material.emissiveIntensity += intensityChange;
            
            if (this.warningPointLight) {
                this.warningPointLight.intensity += intensityChange;
            }

            if (this.warningLight.material.emissiveIntensity >= 20) this.warningLightFlashDir = -1;
            if (this.warningLight.material.emissiveIntensity <= 0) this.warningLightFlashDir = 1;
        }

        if (this.shieldMaterial && activeCamera) {
            const localCameraPos = this.shieldMesh.worldToLocal(activeCamera.position.clone());
            this.shieldMaterial.uniforms.viewVector.value.copy(localCameraPos);
            this.shieldMaterial.uniforms.viewVector.needsUpdate = true;
        }
    }

    /**
     * Toggles selection highlighting on the submarine.
     * Changes emissive color to indicate selection state.
     * @param {boolean} selected - Whether the submarine is selected.
     */
    onSelect(selected) {
        const emissiveColor = selected ? 0xffaa00 : 0x000000;

        this.material.emissive.setHex(emissiveColor);
    }

    /**
     * Calculates target position for submarine spotlights based on angle and distance.
     * @param {THREE.Vector3} lightPosition - Current position of the light.
     * @param {number} angle - Angle in radians for light direction.
     * @param {number} distance - Target distance from light.
     * @returns {THREE.Vector3} Target position for the light to aim at.
     */
    calculateLightTarget(lightPosition, angle, distance = 30) {
        const targetX = lightPosition.x + Math.cos(angle) * distance;
        const targetY = -1.5;
        const targetZ = lightPosition.z + Math.sin(angle) * distance;
        
        return new THREE.Vector3(targetX, targetY, targetZ);
    }

    /**
     * Updates all submarine light settings including colors, intensities, angles,
     * and flashing frequency. Applies changes to spotlights and point lights.
     * @param {Object} settings - Light configuration settings.
     * @param {THREE.Color} settings.leftLightColor - Color of left spotlight.
     * @param {number} settings.leftLightIntensity - Intensity of left spotlight.
     * @param {number} settings.leftLightAngle - Angle of left spotlight.
     * @param {THREE.Color} settings.rightLightColor - Color of right spotlight.
     * @param {number} settings.rightLightIntensity - Intensity of right spotlight.
     * @param {number} settings.rightLightAngle - Angle of right spotlight.
     * @param {number} settings.flashingFreq - Frequency of warning light flashing.
     */
    updateLightSettings(settings) {
        const distance = 30;

        // LEFT LIGHT
        if (this.spotLight1) {
            this.spotLight1.color.set(settings.leftLightColor);
            this.spotLight1.intensity = settings.leftLightIntensity;

            this.leftLightAngle = settings.leftLightAngle;
            
            const target1Pos = this.calculateLightTarget(
                this.spotLight1.position,
                this.leftLightAngle,
                distance
            );
            this.target1.position.copy(target1Pos);
            this.spotLight1.target.updateMatrixWorld();
        }

        // RIGHT LIGHT
        if (this.spotLight2) {
            this.spotLight2.color.set(settings.rightLightColor);
            this.spotLight2.intensity = settings.rightLightIntensity;

            this.rightLightAngle = settings.rightLightAngle;
            
            const target2Pos = this.calculateLightTarget(
                this.spotLight2.position,
                this.rightLightAngle,
                distance
            );
            this.target2.position.copy(target2Pos);
            this.spotLight2.target.updateMatrixWorld();
        }

        // FLASHING
        this.flashingFreq = settings.flashingFreq;

        this.light1Mesh.rotation.x = this.leftLightAngle;
        this.light2Mesh.rotation.x = this.rightLightAngle;
    }

    /**
     * Toggles the shield visibility on/off.
     * @param {boolean} active - Whether to show the shield.
     */
    toggleShield(active) {
        if (this.shieldMesh) {
            this.shieldMesh.visible = active;
        }
    }

    /**
     * Applies boundary constraints to keep submarine within play area.
     * Restricts vertical movement and maintains circular boundary on X-Z plane.
     * @private
     */
    _applyBoundaryConstraints() {
        if (this.position.y > this.maxY) {
            this.position.y = this.maxY;
            this.verticalSpeed = 0;
        }

        const distanceFromCenter = Math.sqrt(this.position.x ** 2 + this.position.z ** 2);
        
        if (distanceFromCenter > this.boundaryRadius) {
            const angle = Math.atan2(this.position.z, this.position.x);
            this.position.x = Math.cos(angle) * this.boundaryRadius;
            this.position.z = Math.sin(angle) * this.boundaryRadius;
            this.forwardSpeed = 0;
        }
    }

    /**
     * Initializes collision detection shape based on shield geometry.
     * Sets up capsule parameters for BVH collision testing.
     * @private
     */
    _initCollisionShape() {
        if (!this.shieldMesh || !this.shieldMesh.geometry) return;

        const capsuleRadius = 1.7;
        const capsuleLength = 5.3;

        this._capsuleRadius = capsuleRadius * this.scaleNumber;
        this._capsuleHalfLength = (capsuleLength * 0.5) * this.scaleNumber;

        this._capsuleSampleOffsets = [
            -this._capsuleHalfLength,
            -this._capsuleHalfLength * 0.5,
            0,
            this._capsuleHalfLength * 0.5,
            this._capsuleHalfLength
        ];
    }

    /**
     * Checks for collisions between submarine capsule and terrain/temple using BVH.
     * Tests multiple sample points along capsule axis for sphere-triangle intersections.
     * @param {THREE.Vector3} worldPosition - Position to test collision at.
     * @returns {boolean} True if collision detected, false otherwise.
     * @private
     */
    _checkBVHSphereCollision(worldPosition) {
        if (!this._capsuleRadius || !this._capsuleSampleOffsets) return false;

        const radius = this._capsuleRadius;
        const tmpVec = new THREE.Vector3();

        // Compute shield center and capsule axis direction in world space
        const shieldLocalPos = this.shieldMesh.position.clone().multiplyScalar(this.scaleNumber);
        const rotationQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, this.rotation.y, 0));

        const shieldCenterWorld = worldPosition.clone().add(shieldLocalPos.clone().applyQuaternion(rotationQuat));

        // Capsule axis is along +X in shield local (due to rotation.z = PI/2),
        // so in world space it's the group's +X rotated by Y.
        const axisDirWorld = new THREE.Vector3(1, 0, 0).applyQuaternion(rotationQuat).normalize();

        const checkMeshCollision = (mesh) => {
            if (!mesh || !mesh.isMesh || !mesh.geometry || !mesh.geometry.boundsTree) return false;

            // Precompute capsule sample centers in this mesh's local space
            const localCenters = this._capsuleSampleOffsets.map(offset => {
                const worldSample = shieldCenterWorld.clone().addScaledVector(axisDirWorld, offset);
                return mesh.worldToLocal(worldSample);
            });

            let hit = false;

            mesh.geometry.boundsTree.shapecast({
                intersectsBounds: (box) => {
                    // Box intersects capsule if it's close to any of the sample spheres
                    for (const c of localCenters) {
                        if (box.distanceToPoint(c) <= radius) return true;
                    }
                    return false;
                },
                intersectsTriangle: (tri) => {
                    for (const c of localCenters) {
                        tri.closestPointToPoint(c, tmpVec);
                        if (tmpVec.distanceToSquared(c) <= radius * radius) {
                            hit = true;
                            return true; // stop shapecast for this mesh
                        }
                    }
                    return false;
                }
            });

            return hit;
        };

        if (this.terrain) {
            if (checkMeshCollision(this.terrain.mesh)) {
                return true;
            }
        }

        if (this.temple) {
            let templeHit = false;
            this.temple.traverse(child => {
                if (templeHit) return;
                if (checkMeshCollision(child)) {
                    templeHit = true;
                }
            });
            if (templeHit) return true;
        }

        return false;
    }


  
}

export { MySubmarine };