import * as THREE from 'three';

/**
 * MyShipwreck
 * Represents a procedurally generated shipwreck with customizable features.
 * Includes curved hull, broken mast, scattered debris, and optional chains.
 * Inherits from THREE.Group.
 */
class MyShipwreck extends THREE.Group {
    /**
     * Constructs a new MyShipwreck instance.
     * @param {number} x - X coordinate position.
     * @param {number} y - Y coordinate position.
     * @param {number} z - Z coordinate position.
     * @param {number} scale - Uniform scale factor for the entire shipwreck.
     * @param {Object} options - Configuration options for shipwreck features.
     * @param {number} options.planks - Number of scattered plank debris pieces.
     * @param {number} options.holes - Number of holes in the hull (currently unused).
     * @param {number} options.tilt - Hull tilt angle in radians.
     * @param {boolean} options.hasChains - Whether to include anchor chains.
     */
    constructor(x = 0, y = 0, z = 0, scale = 1, options = {}) {
        super();
        /**
         * Base scale factor for the shipwreck.
         * @type {number}
         */
        this.scaleNumber = scale;
        
        /**
         * Configuration options for shipwreck features.
         * @type {Object}
         */
        this.options = {
            planks: options.planks ?? 18,
            holes: options.holes ?? 7,
            tilt: options.tilt ?? 0.12,
            hasChains: options.hasChains ?? true
        };
        
        // Set position and initialize components
        this.position.set(x, y, z);
        this.createMaterials();
        this.createCurvedHull();
        this.createRibs();
        this.createBrokenMast();
        this.createPlanksAndDebris();
        this.createSteeringWheel();
        if (this.options.hasChains) this.createChains();
        
        // Apply scale and shadow properties
        this.scale.setScalar(this.scaleNumber);
        this.traverse(child => {
            child.castShadow = true;
            child.receiveShadow = true;
        });
    }

    /**
     * Creates and stores material definitions for various shipwreck components.
     * Includes wood, hull, metal, barnacle, seaweed, and sail materials.
     * @private
     */
    createMaterials() {
        /**
         * Wood material for planks, mast, and structural elements.
         * @type {THREE.MeshStandardMaterial}
         */
        this.woodMaterial = new THREE.MeshStandardMaterial({
            color: 0x6e4b2a,
            roughness: 0.9
        });
        
        /**
         * Hull material for the main ship body.
         * @type {THREE.MeshStandardMaterial}
         */
        this.hullMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3125,
            roughness: 0.95,
            metalness: 0.15
        });
        
        /**
         * Metal material for chains, bolts, and metal fittings.
         * @type {THREE.MeshStandardMaterial}
         */
        this.metalMaterial = new THREE.MeshStandardMaterial({
            color: 0x444444,
            roughness: 0.7,
            metalness: 0.8
        });
        
        /**
         * Barnacle material for underwater growth (currently unused).
         * @type {THREE.MeshStandardMaterial}
         */
        this.barnacleMaterial = new THREE.MeshStandardMaterial({
            color: 0xcfcfcf,
            roughness: 0.8
        });
        
        /**
         * Seaweed material for underwater vegetation (currently unused).
         * @type {THREE.MeshStandardMaterial}
         */
        this.seaweedMaterial = new THREE.MeshStandardMaterial({
            color: 0x2e8b57,
            roughness: 0.7
        });
        
        /**
         * Sail material for tattered sails (currently unused).
         * @type {THREE.MeshStandardMaterial}
         */
        this.sailMaterial = new THREE.MeshStandardMaterial({
            color: 0xe0e0e0,
            roughness: 1,
            transparent: true,
            opacity: 0.7
        });
    }

    /**
     * Creates the curved hull using LatheGeometry.
     * Generates a half-cylinder shape representing the ship's broken hull.
     * @private
     */
    createCurvedHull() {
        const points = [];
        // Generate points for the hull profile
        for (let i = 0; i < 10; i++) {
            points.push(new THREE.Vector2(
                Math.sin(i * 0.18) * 5 + 2,  // X coordinate with sine wave for curvature
                i * 1.5                       // Y coordinate for height
            ));
        }
        
        // Create lathe geometry (half circle for broken hull)
        const geometry = new THREE.LatheGeometry(points, 32, 0, Math.PI);
        
        // Create double-sided material for hull interior/exterior
        this.hullMaterialDouble = this.hullMaterial.clone();
        this.hullMaterialDouble.side = THREE.DoubleSide;
        
        /**
         * The main hull mesh of the shipwreck.
         * @type {THREE.Mesh}
         */
        this.hull = new THREE.Mesh(geometry, this.hullMaterialDouble);
        
        // Position and rotate hull to simulate wrecked orientation
        this.hull.rotation.z = -Math.PI * this.options.tilt - Math.PI / 2;
        this.hull.rotation.y = Math.PI / 2;
        this.hull.position.y = 4;
        this.add(this.hull);
    }

    /**
     * Adds structural ribs (frames) inside the hull for detail.
     * Creates torus shapes representing the ship's internal framing.
     * @private
     */
    createRibs() {
        // Create 5 ribs with decreasing size from center outward
        const ribPositions = [2, 3.5, 5, 6.5, 8]; // Y positions along the hull
        const ribSizes = [4.8, 5.0, 5.2, 5.2, 5.2]; // Corresponding radii
        
        for (let i = 0; i < ribPositions.length; i++) {
            const radius = ribSizes[i];
            const positionY = ribPositions[i];
            
            // Create half-circle torus for each rib
            const ribGeom = new THREE.TorusGeometry(radius, 0.12, 8, 24, Math.PI);
            const rib = new THREE.Mesh(ribGeom, this.woodMaterial);
            rib.position.y = positionY + 5;
            rib.rotation.x = Math.PI / 2;  // Rotate to vertical orientation
            rib.position.x = 0.8;          // Offset from hull center
            
            this.hull.add(rib);
        }
    }

    /**
     * Creates a broken mast with attached rope.
     * Includes a tilted cylinder for the mast and a curved tube for the rope.
     * @private
     */
    createBrokenMast() {
        // Create main mast cylinder
        const mastGeom = new THREE.CylinderGeometry(0.25, 0.35, 13, 8);
        const mast = new THREE.Mesh(mastGeom, this.woodMaterial);

        // Position and rotate mast to appear broken and fallen
        mast.rotation.x = Math.PI * 0.08;
        mast.rotation.z = Math.PI * 0.13;
        mast.position.z = -2.5;
        this.add(mast);
        
        // Create rope using CatmullRom curve
        const ropeCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 8, -2.5),
            new THREE.Vector3(2, 5, -2.5),
            new THREE.Vector3(3, 0, -2.5)
        ]);
        
        const ropeGeom = new THREE.TubeGeometry(ropeCurve, 20, 0.07, 8, false);
        const rope = new THREE.Mesh(ropeGeom, this.metalMaterial);
        this.add(rope);
    }

    /**
     * Creates scattered wooden planks and metal debris around the wreck.
     * Randomly positions and rotates plank and bolt meshes.
     * @private
     */
    createPlanksAndDebris() {
        // Create scattered wooden planks
        for (let i = 0; i < this.options.planks; i++) {
            const plank = new THREE.Mesh(
                new THREE.BoxGeometry(
                    Math.random() * 2.5 + 0.7,  // Random length
                    0.18,                        // Constant thickness
                    0.4 + Math.random() * 0.2    // Random width
                ),
                this.woodMaterial
            );
            
            // Random position within area around wreck
            plank.position.set(
                Math.random() * 14 - 7,
                0.1,
                Math.random() * 10 - 5
            );
            
            // Random rotation for natural scattering
            plank.rotation.set(
                Math.random() * 0.7,
                Math.random() * 2 * Math.PI,
                Math.random() * 0.7
            );
            
            this.add(plank);
        }
        
        // Create metal bolts/nails debris
        for (let i = 0; i < 12; i++) {
            const bolt = new THREE.Mesh(
                new THREE.CylinderGeometry(0.07, 0.07, 0.3, 8),
                this.metalMaterial
            );
            
            bolt.position.set(
                Math.random() * 10 - 5,
                0.1,
                Math.random() * 8 - 4
            );
            
            bolt.rotation.x = Math.random() * Math.PI;
            this.add(bolt);
        }
    }

    /**
     * Creates a broken steering wheel with spokes.
     * Uses a torus for the wheel rim and cylinders for spokes.
     * @private
     */
    createSteeringWheel() {
        // Create wheel rim
        const wheelGeom = new THREE.TorusGeometry(0.7, 0.12, 8, 16);
        const wheel = new THREE.Mesh(wheelGeom, this.woodMaterial);
        
        wheel.position.set(7.5, 0.65, 0);
        wheel.rotation.x = Math.PI / 2;  // Rotate to horizontal orientation
        this.add(wheel);
        
        // Add 6 spokes radiating from center
        for (let i = 0; i < 6; i++) {
            const spokeGeom = new THREE.CylinderGeometry(0.05, 0.05, 1.1, 6);
            const spoke = new THREE.Mesh(spokeGeom, this.woodMaterial);
            
            spoke.position.copy(wheel.position);
            spoke.rotation.x = Math.PI / 2;
            spoke.rotation.z = (i / 6) * Math.PI * 2;  // Evenly spaced around circle
            
            this.add(spoke);
        }
    }

    /**
     * Creates anchor chains near the wreck (optional feature).
     * Creates a series of linked torus shapes.
     * @private
     */
    createChains() {
        for (let i = 0; i < 8; i++) {
            const link = new THREE.Mesh(
                new THREE.TorusGeometry(0.25, 0.07, 8, 16),
                this.metalMaterial
            );            
            
            // Position in a line
            link.position.set(-6 + i * 0.5, 0.1, 5.5);
            link.rotation.x = Math.PI / 2;
            this.add(link);
        }
    }

    /**
     * Highlights or unhighlights the shipwreck by setting emissive color.
     * Can be used for selection feedback in the UI.
     * @param {boolean} selected - Whether the shipwreck is selected.
     */
    onSelect(selected) {
        const emissiveColor = selected ? 0xffaa00 : 0x000000;

        this.traverse(obj => {
            if (obj.isMesh && obj.material && obj.material.emissive) {
                obj.material.emissive.setHex(emissiveColor);
            }
        });
    }
}

export { MyShipwreck };