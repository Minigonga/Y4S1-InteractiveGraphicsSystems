import * as THREE from 'three';

/**
 * MyTerrain
 * Represents a procedurally generated circular terrain with height mapping, 
 * texture support, and object placement capabilities.
 * Inherits from THREE.Group.
 */
class MyTerrain extends THREE.Group {
    /**
     * Constructs a new MyTerrain instance.
     * @param {number} radius - Radius of the circular terrain.
     * @param {number} segments - Number of radial and angular segments for mesh resolution.
     * @param {number} minHeight - Minimum height value for terrain elevation.
     * @param {number} maxHeight - Maximum height value for terrain elevation.
     * @param {number} seed - Seed value for procedural noise generation.
     */
    constructor(
        radius = 175,
        segments = 50,
        minHeight = -10,
        maxHeight = 10,
        seed = 12345
    ) {
        super();
        /**
         * Radius of the circular terrain.
         * @type {number}
         */
        this.radius = radius;
        /**
         * Number of radial and angular segments for mesh resolution.
         * @type {number}
         */
        this.segments = segments;
        /**
         * Minimum height value for terrain elevation.
         * @type {number}
         */
        this.minHeight = minHeight;
        /**
         * Maximum height value for terrain elevation.
         * @type {number}
         */
        this.maxHeight = maxHeight;
        /**
         * Seed value for procedural noise generation.
         * @type {number}
         */
        this.seed = seed;
        /**
         * Array of placed objects on the terrain for collision detection.
         * @type {Array<THREE.Object3D>}
         */
        this.objects = [];
        /**
         * 2D array storing height values for each vertex in the terrain mesh.
         * @type {Array<Array<number>>}
         */
        this.heightMap = [];
        
        this._createTerrain();
    }

    /**
     * Creates the terrain mesh with procedural height mapping and applies textures.
     * @private
     */
    _createTerrain() {
        // Implementation details remain the same...
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const indices = [];

        const heightRange = this.maxHeight - this.minHeight;
        const noise2D = (x, z) => {
            const s = Math.sin(x * 12 + z * 78.233 + this.seed) * 43758.5453;
            return s - Math.floor(s);
        };

        const smoothNoise = (x, z) => {
            const intX = Math.floor(x);
            const intZ = Math.floor(z);
            const fracX = x - intX;
            const fracZ = z - intZ;

            const v1 = noise2D(intX, intZ);
            const v2 = noise2D(intX + 1, intZ);
            const v3 = noise2D(intX, intZ + 1);
            const v4 = noise2D(intX + 1, intZ + 1);

            const i1 = v1 * (1 - fracX) + v2 * fracX;
            const i2 = v3 * (1 - fracX) + v4 * fracX;
            return i1 * (1 - fracZ) + i2 * fracZ;
        };

        const getHeight = (x, z) => {
            let total = 0;
            let frequency = 0.04;
            let amplitude = 1.0;
            let maxValue = 0;

            for (let o = 0; o < 4; o++) {
                total += smoothNoise(x * frequency, z * frequency) * amplitude;
                maxValue += amplitude;
                amplitude *= 0.5;
                frequency *= 2.0;
            }
            return total / maxValue;
        };

        // Generate vertex positions and height map
        for (let i = 0; i <= this.segments; i++) {
            const row = [];
            const r = (i / this.segments) * this.radius;
            for (let j = 0; j <= this.segments; j++) {
                const theta = (j / this.segments) * Math.PI * 2;
                const x = r * Math.cos(theta);
                const z = r * Math.sin(theta);

                const n = getHeight(x, z);
                const y = this.minHeight + n * heightRange;

                positions.push(x, y, z);
                row.push(y);
            }
            this.heightMap.push(row);
        }

        // Generate triangle indices
        const vertsPerRing = this.segments + 1;
        for (let i = 0; i < this.segments; i++) {
            for (let j = 0; j < this.segments; j++) {
                const a = i * vertsPerRing + j;
                const b = (i + 1) * vertsPerRing + j;
                const c = (i + 1) * vertsPerRing + j + 1;
                const d = i * vertsPerRing + j + 1;

                indices.push(a, b, d);
                indices.push(b, c, d);
            }
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        // Generate UV coordinates
        const uvs = [];
        for (let i = 0; i <= this.segments; i++) {
            for (let j = 0; j <= this.segments; j++) {
                const theta = (j / this.segments) * Math.PI * 2;
                const r = (i / this.segments) * this.radius;

                const x = r * Math.cos(theta);
                const z = r * Math.sin(theta);

                const u = (x / this.radius) * 0.5 + 0.5;
                const v = (z / this.radius) * 0.5 + 0.5;

                uvs.push(u, v);
            }
        }

        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        
        this._loadTextures();
        this._createMesh(geometry);
    }

    /**
     * Loads and configures terrain textures.
     * @private
     */
    _loadTextures() {
        const loader = new THREE.TextureLoader();

        /**
         * Collection of terrain textures including albedo, normal, roughness, AO, displacement, and metalness maps.
         * @type {Object}
         * @property {THREE.Texture} albedo - Albedo/diffuse texture.
         * @property {THREE.Texture} normal - Normal map texture.
         * @property {THREE.Texture} roughness - Roughness map texture.
         * @property {THREE.Texture} ao - Ambient occlusion map texture.
         * @property {THREE.Texture} displacement - Height/displacement map texture.
         * @property {THREE.Texture} metalness - Metalness map texture.
         */
        this.textures = {
            albedo: loader.load("textures/terrainTexture/wavy-sand_albedo.jpg"),
            normal: loader.load("textures/terrainTexture/wavy-sand_normal-ogl.jpg"),
            roughness: loader.load("textures/terrainTexture/wavy-sand_roughness.jpg"),
            ao: loader.load("textures/terrainTexture/wavy-sand_ao.jpg"),
            displacement: loader.load("textures/terrainTexture/wavy-sand_height.jpg"),
            metalness: loader.load("textures/terrainTexture/wavy-sand_metallic.jpg")
        };

        // Apply texture settings
        Object.values(this.textures).forEach(tex => {
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(16, 16);
            tex.anisotropy = 8;
            tex.minFilter = THREE.LinearMipmapLinearFilter;
            tex.magFilter = THREE.LinearFilter;
        });
    }

    /**
     * Creates the terrain mesh with the Standard material and adds it to the group.
     * @param {THREE.BufferGeometry} geometry - The terrain geometry.
     * @private
     */
    _createMesh(geometry) {
        /**
         * Standard material for the terrain with PBR textures.
         * @type {THREE.MeshStandardMaterial}
         */
        this.material = new THREE.MeshStandardMaterial({
            map: this.textures.albedo,
            normalMap: this.textures.normal,
            roughnessMap: this.textures.roughness,
            aoMap: this.textures.ao,
            metalnessMap: this.textures.metalness,
            metalness: 0.1,
            roughness: 1.0,
            side: THREE.DoubleSide
        });

        /**
         * The mesh representing the terrain.
         * @type {THREE.Mesh}
         */
        this.mesh = new THREE.Mesh(geometry, this.material);
        this.mesh.receiveShadow = true;
        this.mesh.castShadow = false;
        this.add(this.mesh);
    }

    /**
     * Gets the height and surface inclination at the specified world coordinates.
     * Uses bilinear interpolation on the height map for smooth results.
     * @param {number} x - World X coordinate.
     * @param {number} z - World Z coordinate.
     * @returns {Object} An object containing height and inclination data.
     * @returns {number} return.y - Interpolated height at (x, z).
     * @returns {number} return.inclineX - Surface incline in X direction (partial derivative).
     * @returns {number} return.inclineZ - Surface incline in Z direction (partial derivative).
     */
    getHeightAt(x, z) {
        const segments = this.segments;
        const radius = this.radius;

        const r = Math.sqrt(x * x + z * z);
        const theta = Math.atan2(z, x);

        // Map to heightMap coordinates and clamp to valid cell range
        let iFloat = (r / radius) * segments;
        let jFloat = ((theta + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2) * segments;

        // Clamp to [0, segments - 1] so i0/i1, j0/j1 stay within [0, segments]
        iFloat = Math.max(0, Math.min(iFloat, segments - 1));
        jFloat = Math.max(0, Math.min(jFloat, segments - 1));

        const i0 = Math.floor(iFloat);
        const j0 = Math.floor(jFloat);
        const i1 = i0 + 1;
        const j1 = j0 + 1;

        const h00 = this.heightMap[i0][j0];
        const h10 = this.heightMap[i1][j0];
        const h01 = this.heightMap[i0][j1];
        const h11 = this.heightMap[i1][j1];

        const t = iFloat - i0;
        const s = jFloat - j0;
        const y = (1 - t) * (1 - s) * h00 + t * (1 - s) * h10 + (1 - t) * s * h01 + t * s * h11;

        // Calculate surface inclination using finite differences
        const delta = 0.01;
        const y_dx = (this.sampleHeightAt(x + delta, z) - this.sampleHeightAt(x - delta, z)) / (2 * delta);
        const y_dz = (this.sampleHeightAt(x, z + delta) - this.sampleHeightAt(x, z - delta)) / (2 * delta);

        return { y, inclineX: y_dx, inclineZ: y_dz };
    }

    /**
     * Samples the height at the specified world coordinates using bilinear interpolation.
     * Internal method used for inclination calculations.
     * @param {number} x - World X coordinate.
     * @param {number} z - World Z coordinate.
     * @returns {number} The interpolated height value.
     * @private
     */
    sampleHeightAt(x, z) {
        const r = Math.sqrt(x * x + z * z);
        const theta = Math.atan2(z, x);

        let iFloat = (r / this.radius) * this.segments;
        let jFloat = ((theta + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2) * this.segments;

        iFloat = Math.max(0, Math.min(iFloat, this.segments - 1));
        jFloat = Math.max(0, Math.min(jFloat, this.segments - 1));

        const i0 = Math.floor(iFloat);
        const j0 = Math.floor(jFloat);
        const i1 = i0 + 1;
        const j1 = j0 + 1;

        const h00 = this.heightMap[i0][j0];
        const h10 = this.heightMap[i1][j0];
        const h01 = this.heightMap[i0][j1];
        const h11 = this.heightMap[i1][j1];

        const t = iFloat - i0;
        const s = jFloat - j0;

        return (1 - t) * (1 - s) * h00 + t * (1 - s) * h10 + (1 - t) * s * h01 + t * s * h11;
    }

    /**
     * Adds multiple instances of an object type to the terrain with spread distribution.
     * Objects are placed randomly while maintaining minimum distance from each other and avoiding center area.
     * @param {Function} ObjectType - Constructor function for the object to instantiate.
     * @param {Object} options - Configuration options passed to the object constructor.
     * @param {THREE.Group} group - Parent group to add the objects to.
     * @param {number} count - Number of instances to create.
     * @param {boolean} rotate - Whether to rotate objects to match terrain surface normal.
     */
    addSpreadedObj(ObjectType, options, group, count, rotate) {
        const radius = this.radius * 0.60;
        const minDistance = 5;

        for (let i = 0; i < count; i++) {
            let position;
            let valid = false;
            let inclineX = 0;
            let inclineZ = 0;
            let y = 0;

            // Find a valid position that meets distance constraints
            while (!valid) {
                const r = Math.sqrt(Math.random()) * radius; // Square root for uniform disk distribution
                const theta = Math.random() * Math.PI * 2;
                const x = r * Math.cos(theta);
                const z = r * Math.sin(theta);

                ({ y, inclineX, inclineZ } = this.getHeightAt(x, z));
                position = new THREE.Vector3(x, y, z);

                // Check if position is valid (minimum distance from other objects and away from center)
                valid = this.objects.every(obj => obj.position.distanceTo(position) >= minDistance)
                        && Math.abs(x) > 20
                        && Math.abs(z) > 20;
            }
            
            options.pos = position;
            options.terrain = this;
            const newObj = new ObjectType(options);
            newObj.position.setX(position.x);
            newObj.position.setZ(position.z);
            
            if (rotate) {
                // Calculate surface normal from inclines and rotate object to match
                const normal = new THREE.Vector3(-inclineX, 1, -inclineZ).normalize();
                const up = new THREE.Vector3(0, 1, 0);
                const quat = new THREE.Quaternion().setFromUnitVectors(up, normal);
                newObj.quaternion.copy(quat);
                newObj.rotateY(Math.random() * Math.PI * 2); // Add random rotation around Y axis
            }
            
            group.add(newObj);
            this.objects.push(newObj);
        }
    }
    
    /**
     * Resizes a texture to the specified dimensions using canvas resizing.
     * Useful for optimizing texture memory usage.
     * @param {THREE.Texture} texture - The texture to resize.
     * @param {number} newSize - The new width and height for the texture (default: 1024).
     * @returns {THREE.Texture} The resized texture.
     */
    resizeTexture(texture, newSize = 1024) {
        const img = texture.image;

        const canvas = document.createElement('canvas');
        canvas.width = newSize;
        canvas.height = newSize;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, newSize, newSize);

        texture.image = canvas;
        texture.needsUpdate = true;

        return texture;
    }
}

export { MyTerrain };