import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MyTerrain } from './seabed/MyTerrain.js';
import { MyCoralGroup } from './corals/MyCoralGroup.js';
import { MyBubbleParticles } from './seabed/MyBubbleParticles.js';
import { MyMarineSnow } from './seabed/MyMarineSnow.js';
import { MySandPuff } from './seabed/MySandPuff.js';
import { MyTurtle } from './animals/MyTurtle.js';
import { MyRock } from './seabed/MyRock.js';
import { MyAlgaGroup } from './seabed/MyAlgaGroup.js';
import { MyCrab } from './animals/MyCrab.js';
import { MyShark } from './animals/MyShark.js';
import { MyStarFish } from './animals/MyStarFish.js';
import { MyShoal } from './animals/MyShoal.js';
import { MyBreamFish } from './animals/MyBreamFish.js';
import { MySlimFish } from './animals/MySlimFish.js';
import { MySubmarine } from './MySubmarine.js';
import { MeshBVH, acceleratedRaycast, MeshBVHHelper } from 'three-mesh-bvh';
import { MyHorizon } from './seabed/MyHorizon.js';
import { MyShipwreck } from './MyShipwreck.js';
import { MyTemple } from './mainScene/MyTemple.js';
import { MyJellyfishGroup } from './animals/MyJellyfishGroup.js';
import { MyWaterCeiling } from './seabed/MyWaterCeiling.js';

/**
 * MyContents
 * Main content manager for the underwater scene. Handles initialization, updates,
 * and management of all scene entities including terrain, animals, particle systems,
 * and interactive elements. Implements BVH (Bounding Volume Hierarchy) for efficient
 * collision detection and raycasting.
 */
class MyContents  {
    /**
     * Set the number of a given terrain entity type.
     * Dynamically adjusts the count of various scene entities like bubbles, crabs, algae, etc.
     * @param {string} type - Entity type: 'bubbles', 'crabs', 'algae', 'starfish', 'rocks', 'coral0', 'coral1'.
     * @param {number} count - Target number of entities.
     */
    setTerrainEntityCount(type, count) {
        let group, ObjectType, options = {}, rotate = false, filterFn = null;
        switch(type) {
            case 'bubbles':
                group = this.bubbleGroup;
                ObjectType = MyBubbleParticles;
                break;
            case 'crabs':
                group = this.crabGroup;
                ObjectType = MyCrab;
                rotate = true;
                break;
            case 'algae':
                group = this.algaGroups;
                ObjectType = MyAlgaGroup;
                break;
            case 'starfish':
                group = this.starFishGroup;
                ObjectType = MyStarFish;
                rotate = true;
                break;
            case 'rocks':
                group = this.rockGroup;
                ObjectType = MyRock;
                break;
            case 'coral0':
                group = this.coralGroups;
                ObjectType = MyCoralGroup;
                options = {type: 0};
                filterFn = obj => obj.type === 0;
                rotate = true;
                break;
            case 'coral1':
                group = this.coralGroups;
                ObjectType = MyCoralGroup;
                options = {type: 1};
                filterFn = obj => obj.type === 1;
                rotate = true;
                break;
            default:
                return;
        }

        // Remove all objects of this type from group and terrain.objects
        let toRemove = [];
        if (filterFn) {
            toRemove = group.children.filter(filterFn);
        } else {
            toRemove = [...group.children];
        }
        toRemove.forEach(obj => {
            group.remove(obj);
            if (this.Terrain && this.Terrain.objects) {
                const idx = this.Terrain.objects.indexOf(obj);
                if (idx !== -1) this.Terrain.objects.splice(idx, 1);
            }
        });

        // Add new objects up to count
        for (let i = 0; i < count; i++) {
            this.Terrain.addSpreadedObj(ObjectType, {...options}, group, 1, rotate);
        }
    }

    /**
     * Constructs a new MyContents instance.
     * @param {MyApp} app - The main application object.
     */
    constructor(app) {
        this.app = app
        this.axis = null
        this.marineSnow = null;
        this.sandPuffs = [];
        this.objects = [];
        this.submarine = null;
        this.diffusePlaneColor = "#00ffff"
        this.specularPlaneColor = "#777777"
        this.planeShininess = 30
        this.planeMaterial = new THREE.MeshPhongMaterial({ color: this.diffusePlaneColor, 
            specular: this.specularPlaneColor, emissive: "#000000", shininess: this.planeShininess })

        this.clock = new THREE.Clock();
        this.clock.start(); // Explicitly start the clock

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this._selectedEntity = null;

        this.bvhHelpers = new THREE.Group();
        this.bvhHelpers.visible = false;
        this._bvhHelpersDepth = 10;
        this._bvhEnabled = false;
    }

    /**
     * Toggles wireframe rendering mode for all scene entities.
     * Useful for debugging geometry and performance analysis.
     * @param {boolean} enabled - Whether to enable wireframe mode.
     */
    toggleWireframeMode(enabled) {
        this.rockGroup.traverse(child => {
            if (child.isMesh && child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => mat.wireframe = enabled);
                } else {
                    child.material.wireframe = enabled;
                }
            }
        });
        this.crabGroup.traverse(child => {
            if (child.isMesh && child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => mat.wireframe = enabled);
                } else {
                    child.material.wireframe = enabled;
                }
            }
        });
        this.breamFishShoal.traverse(child => {
            if (child.isMesh && child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => mat.wireframe = enabled);
                } else {
                    child.material.wireframe = enabled;
                }
            }
        });
        this.slimFishShoal.traverse(child => {
            if (child.isMesh && child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => mat.wireframe = enabled);
                } else {
                    child.material.wireframe = enabled;
                }
            }
        });
        this.turtleShoal.traverse(child => {
            if (child.isMesh && child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => mat.wireframe = enabled);
                } else {
                    child.material.wireframe = enabled;
                }
            }
        });
        this.algaGroups.traverse(child => {
            if (child.isMesh && child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => mat.wireframe = enabled);
                } else {
                    child.material.wireframe = enabled;
                }
            }
        });

        this.coralGroups.traverse(child => {
            if (child.isMesh && child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => mat.wireframe = enabled);
                } else {
                    child.material.wireframe = enabled;
                }
            }
        });

        if (this.jellyfishGroups) {
            for (const group of this.jellyfishGroups) {
                if (group.jellyfishList) {
                    for (const jelly of group.jellyfishList) {
                        jelly.traverse(child => {
                            if (child.isMesh && child.material) {
                                if (Array.isArray(child.material)) {
                                    child.material.forEach(mat => mat.wireframe = enabled);
                                } else {
                                    child.material.wireframe = enabled;
                                }
                            }
                        });
                    }
                }
            }
        }

        
        this.Terrain.material.wireframe = enabled;
        this.shark.material.wireframe = enabled;
        this.submarine.material.wireframe = enabled;
        
        this.temple.traverse(child => {
            if (child.isMesh && child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => mat.wireframe = enabled);
                } else {
                    child.material.wireframe = enabled;
                }
            }
        });
        
        this.starFishGroup.traverse(child => {
            if (child.isMesh && child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => mat.wireframe = enabled);
                } else {
                    child.material.wireframe = enabled;
                }
            }
        });
        
        if (this.shipwreck) {
            this.shipwreck.traverse(child => {
                if (child.isMesh && child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => mat.wireframe = enabled);
                    } else {
                        child.material.wireframe = enabled;
                    }
                }
            });
        }
    }
    
    /**
     * Initializes all scene content including terrain, animals, particle systems,
     * lighting, and interactive elements. Sets up the complete underwater environment.
     */
    init() {
        // Water ceiling with video texture
        this.waterCeiling = new MyWaterCeiling(175, 0.5, 95, './textures/ceiling.mp4');
        this.app.scene.add(this.waterCeiling);
    
        if (this.axis === null) {
            this.axis = new MyAxis(this)
            this.axis.visible = false
            this.app.scene.add(this.axis)
        }

        this.app.scene.add(this.bvhHelpers);

        const sunLight = new THREE.DirectionalLight(0x66bbff, 1.2);
        sunLight.position.set(100, 100, 75);
        sunLight.castShadow = true;
        // Reduce shadow resolution for performance
        sunLight.shadow.mapSize.width = 1024;
        sunLight.shadow.mapSize.height = 1024;
        sunLight.shadow.camera.near = 1;
        sunLight.shadow.camera.far = 300;
        sunLight.shadow.camera.left = -150;
        sunLight.shadow.camera.right = 150;
        sunLight.shadow.camera.top = 150;
        sunLight.shadow.camera.bottom = -150;

        this.app.scene.add(sunLight);

        this.Terrain = new MyTerrain();

        this.temple = new MyTemple();
        this.app.scene.add(this.temple);
        
        this.breamFishShoal = new MyShoal(MyBreamFish, {
            separationDistance: 15.0,
            alignmentDistance: 40.0,
            cohesionDistance: 60.0,
            separationWeight: 3.0,
            alignmentWeight: 3.0,
            cohesionWeight: 5.0,
            fishCount: 50,
            areaSize: 1000,
            height: 200,
            boundaryMargin: 80,
            boundaryForce: 2.0,
            dangerDistance: 30,
            panicDistance: 15,
            color: '#506f6c',
            terrain: this.Terrain,
            temple: this.temple,
        });
        this.breamFishShoal.position.set(0, 25, 0);
        this.app.scene.add(this.breamFishShoal);
        
        this.slimFishShoal = new MyShoal(MySlimFish, {
            fishCount: 40,
            areaSize: 1000,
            height: 200,
            boundaryMargin: 80,
            boundaryForce: 2.0,
            dangerDistance: 30,
            panicDistance: 15,
            color: '#8dcec7',
            terrain: this.Terrain,
            temple: this.temple,
            fishScale: 3.5,
        });
        this.slimFishShoal.position.set(0, 25, 0);
        this.app.scene.add(this.slimFishShoal);
        
        this.turtleShoal = new MyShoal(MyTurtle, {
            fishCount: 12,
            areaSize: 1000,
            height: 200,
            boundaryMargin: 80,
            boundaryForce: 2.0,
            dangerDistance: 30,
            panicDistance: 15,
            color: '#20622a',
            terrain: this.Terrain,
            temple: this.temple,
            fishScale: 5,
        });
        this.turtleShoal.position.set(0, 25, 0);
        this.app.scene.add(this.turtleShoal);

        this.turtleShoal.setFishScale(10);

        // Fewer particles to keep GPU usage moderate
        this.marineSnow = new MyMarineSnow(700, 350, 95, 0);
        this.app.scene.add(this.marineSnow);
        
        this.shark = new MyShark();
        this.shark.scale.set(0.8,0.8,0.8);
        this.app.scene.add(this.shark);
        this.breamFishShoal.addDangerousEntity(this.shark);
        this.slimFishShoal.addDangerousEntity(this.shark);
        this.turtleShoal.addDangerousEntity(this.shark);

        this.starFishGroup = new THREE.Group();
        this.algaGroups = new THREE.Group();
        this.rockGroup = new THREE.Group();
        this.coralGroups = new THREE.Group();
        this.crabGroup = new THREE.Group();
        this.bubbleGroup = new THREE.Group();

        this.Terrain = new MyTerrain();
        // Slightly fewer spawned instances per group to reduce draw/CPU load
        this.Terrain.addSpreadedObj(MyBubbleParticles, {}, this.bubbleGroup, 10, false);
        this.Terrain.addSpreadedObj(MyCrab, {}, this.crabGroup, 7, true);
        this.Terrain.addSpreadedObj(MyAlgaGroup, {}, this.algaGroups, 14, false);
        this.Terrain.addSpreadedObj(MyStarFish, {}, this.starFishGroup, 10, true);
        this.Terrain.addSpreadedObj(MyRock, {}, this.rockGroup, 10, false);
        this.Terrain.addSpreadedObj(MyCoralGroup, {type:0}, this.coralGroups, 7, true);
        this.Terrain.addSpreadedObj(MyCoralGroup, {type:1}, this.coralGroups, 7, true);
        
        this.app.scene.add(this.bubbleGroup);
        this.app.scene.add(this.algaGroups);
        this.app.scene.add(this.rockGroup);
        this.app.scene.add(this.starFishGroup);
        this.app.scene.add(this.coralGroups);
        this.app.scene.add(this.crabGroup);

        this.submarine = new MySubmarine(this.app.cameras['Submarine view'], this.app.controls, -75, 30, 0, 4, this.app.cameras['Free-Fly'], this.Terrain, this.temple);
        this.app.scene.add(this.submarine);
        this.breamFishShoal.addDangerousEntity(this.submarine);
        this.slimFishShoal.addDangerousEntity(this.submarine);
        this.turtleShoal.addDangerousEntity(this.submarine);

        this.app.scene.add(this.Terrain);
        
        const video = document.getElementById('horizon');
        video.muted = true;
        video.loop = true;
        video.playsinline = true;
        video.play().catch(err => {
            console.warn("Video failed to play automatically:", err);
        });
        this.horizon = new MyHorizon(175, 50, 100, video);
        this.horizon.position.setY(-5)
        this.app.scene.add(this.horizon);

        const shipwreckPos = new THREE.Vector3(-100, 0, -80);
        const terrainHeight = this.Terrain.getHeightAt(shipwreckPos.x, shipwreckPos.z);
        this.shipwreck = new MyShipwreck(-100, terrainHeight.y, -80, 1, {}, terrainHeight);
        this.shipwreck.rotateY(-Math.PI / 2);
        this.app.scene.add(this.shipwreck);

        this.jellyfishGroups = [];
        for (let i = 0; i < 3; i++) {
            const group = new MyJellyfishGroup();
            const x = (Math.random() - 0.5) * 80; 
            const y = 50 + Math.random() * 10;
            const z = (Math.random() - 0.5) * 80;
            group.position.set(x, y, z);
            this.app.scene.add(group);
            this.jellyfishGroups.push(group);
        }

        this.objects = [
            ...this.starFishGroup.children,
            ...this.algaGroups.children,
            ...this.coralGroups.children,
            ...this.rockGroup.children,
            ...this.crabGroup.children,
            ...this.jellyfishGroups,
            this.shark,
            this.breamFishShoal,
            this.slimFishShoal,
            this.turtleShoal,
            this.submarine,
            this.temple,
            this.Terrain,
            this.shipwreck
        ].filter(obj => obj);

        // Set terrain reference for both shoals
        this.breamFishShoal.terrain = this.Terrain;
        this.slimFishShoal.terrain = this.Terrain;
        this.turtleShoal.terrain = this.Terrain;

        this.breamFishShoal.temple = this.temple;
        this.slimFishShoal.temple = this.temple;
        this.turtleShoal.temple = this.temple;

        this.toggleBVH();

        this._initSelectionHandlers();

    }

    /**
     * Updates all dynamic scene elements each frame.
     * Handles animations, physics, particle systems, and entity behaviors.
     */
    update() {
        this.shark.update();
        const elapsedTime = this.clock.getElapsedTime(); 
        const deltaTime = this.clock.getDelta();
        const safeDeltaTime = Math.max(deltaTime, 0.016);
        this.shark.swimAnimation(); 
        if (this.jellyfishGroups) {
            const camera = this.app.activeCamera || this.app.camera;
            for (const group of this.jellyfishGroups) {
                if (typeof group.animate === 'function') {
                    group.animate(elapsedTime);
                }
                // Update LOD for each jellyfish in the group
                if (group.jellyfishList) {
                    for (const jelly of group.jellyfishList) {
                        if (typeof jelly.update === 'function') {
                            jelly.update(camera);
                        }
                    }
                }
            }
        }
        
        this.algaGroups.children.forEach(algaGroup => {
            algaGroup.children.forEach(child => {
                if (typeof child.update === 'function') {
                    child.update();
                }
            });
        });
        this.coralGroups.children.forEach(coralGroup => {
            coralGroup.children.forEach(child => {
                if (typeof child.update === 'function') {
                    child.animate(elapsedTime);
                }
            });
        });

        const camera = this.app.activeCamera;
        this.bubbleGroup.children.forEach(bubbleParticle => {
            if (typeof bubbleParticle.updateLOD === 'function') {
                bubbleParticle.updateLOD(camera);
            }
            if (typeof bubbleParticle.update === 'function') {
                bubbleParticle.update(safeDeltaTime);
            }
        });
   
        this.breamFishShoal.update(elapsedTime);
        this.slimFishShoal.update(elapsedTime);
        this.turtleShoal.update(elapsedTime);
        this.submarine.update(this.app.activeCamera);
        
        if (this.marineSnow) {
            this.marineSnow.update(safeDeltaTime);
        }
        
        // Update sand puffs and remove inactive ones
        for (let i = this.sandPuffs.length - 1; i >= 0; i--) {
            this.sandPuffs[i].update(safeDeltaTime);
            if (!this.sandPuffs[i].isActive()) {
                this.app.scene.remove(this.sandPuffs[i]);
                this.sandPuffs[i].dispose();
                this.sandPuffs.splice(i, 1);
            }
        }
    }

    /**
     * Toggles BVH visualization helpers on/off.
     * @param {boolean} visible - Whether to show BVH debug visualization.
     */
    toggleBVHVisualization(visible) {
        this.bvhHelpers.visible = visible;
    }

    /**
     * Enables or disables BVH (Bounding Volume Hierarchy) acceleration for raycasting.
     * Significantly improves performance for collision detection and selection.
     */
    toggleBVH() {
        if (this._bvhEnabled === undefined) this._bvhEnabled = false;

        this._bvhEnabled = !this._bvhEnabled;
        const enable = this._bvhEnabled;

        THREE.Mesh.prototype.raycast = enable ? acceleratedRaycast : THREE.Mesh.prototype.raycast;

        const bvhTargets = [
            this.breamFishShoal,
            this.slimFishShoal,
            this.turtleShoal,
            this.Terrain,
            this.temple,
            this.shark,
            this.submarine
        ].filter(obj => obj);

        const applyBVH = (obj) => {
            if (obj.isMesh && obj.geometry && obj.geometry.isBufferGeometry) {
                if (!obj.geometry.boundsTree) {
                    obj.geometry.boundsTree = new MeshBVH(obj.geometry);
                }

                if (enable) {
                    const helper = new MeshBVHHelper(obj, this._bvhHelpersDepth);
                    helper.name = `bvhHelper_${obj.uuid}`;
                    this.bvhHelpers.add(helper);
                }
            }

            if (obj.children) obj.children.forEach(child => applyBVH(child));
        };

        const disposeBVH = (obj) => {
            if (obj.isMesh && obj.geometry && obj.geometry.boundsTree) {
                delete obj.geometry.boundsTree;
            }

            const helper = this.bvhHelpers.getObjectByName(`bvhHelper_${obj.uuid}`);
            if (helper) {
                this.bvhHelpers.remove(helper);
            }

            if (obj.children) obj.children.forEach(child => disposeBVH(child));
        };

        while (this.bvhHelpers.children.length > 0) {
            this.bvhHelpers.remove(this.bvhHelpers.children[0]);
        }

        for (const target of bvhTargets) {
            if (!target) continue;
            if (enable) applyBVH(target);
            else disposeBVH(target);
        }
    }

    /**
     * Shows or hides BVH bounding boxes for debugging purposes.
     * Toggles visualization of collision detection structures.
     */
    showBVHBoxes() {
        if (this.bvhHelpers.visible) {
            this.bvhHelpers.visible = false;
            return;
        }
        this.bvhHelpers.visible = true;
    }

    /**
     * Initializes mouse/touch selection handlers for interactive scene elements.
     * Sets up pointer event listeners for entity selection.
     * @private
     */
    _initSelectionHandlers() {
        const dom = this.app.renderer.domElement;
        dom.addEventListener('pointerdown', this._onPointerDown.bind(this));
    }

    /**
     * Handles pointer down events for entity selection and interaction.
     * Implements raycasting to detect clicked objects and triggers appropriate responses.
     * @param {PointerEvent} event - Pointer event data.
     * @private
     */
    _onPointerDown(event) {
        const rect = this.app.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        const camera = this.app.activeCamera || this.app.camera;
        this.raycaster.setFromCamera(this.mouse, camera);

        const intersects = this.raycaster.intersectObjects(this.objects, true);

        const filtered = intersects.filter(i => {
            let obj = i.object;
            while (obj) {
                if (obj.userData.ignoreSelection) return false;
                obj = obj.parent;
            }
            return true;
        });

        if (filtered.length > 0) {
            const hit = filtered.find(i => i.object && i.object.isMesh);
            if (hit) {
                // Check if we hit the terrain (seabed)
                if (this._isSeabedHit(hit.object)) {
                    this._spawnSandPuff(hit.point);
                } 
                this._handleSelection(hit.object);
                return;
            }
        }

        this._handleSelection(null);
    }
    
    /**
     * Checks if a raycast hit object is part of the seabed terrain.
     * Used for triggering sand puff effects when clicking on the seabed.
     * @param {THREE.Object3D} object - The object to check.
     * @returns {boolean} True if object is part of the seabed terrain.
     * @private
     */
    _isSeabedHit(object) {
        let current = object;
        while (current) {
            if (current === this.Terrain) {
                return true;
            }
            current = current.parent;
        }
        return false;
    }
    
    /**
     * Spawns a sand puff particle effect at the specified position.
     * Creates visual feedback for interactions with the seabed.
     * @param {THREE.Vector3} position - World position to spawn the effect.
     * @private
     */
    _spawnSandPuff(position) {
        const sandPuff = new MySandPuff(position, 100);
        this.app.scene.add(sandPuff);
        this.sandPuffs.push(sandPuff);
    }

    /**
     * Handles entity selection logic when an object is clicked.
     * Manages selection highlighting and triggers appropriate callbacks.
     * @param {THREE.Object3D} object - The selected object (or null for deselection).
     * @private
     */
    _handleSelection(object) {
        if (this._selectedEntity && this._selectedEntity.onSelect) {
            this._selectedEntity.onSelect(false);
        }
        this._selectedEntity = null;

        if (!object) return;

        let entity = object;
        while (entity) {
            if (entity.userData.ignoreSelection) {
                entity = entity.parent;
                continue;
            }
            if (entity.isMyBreamFish || entity.isMyJellyfish) {
                this._selectedEntity = entity;
                break;
            }
            if (entity.onSelect && typeof entity.onSelect === 'function' && entity !== object && entity !== this.app.scene) {
                this._selectedEntity = entity;
                break;
            }
            entity = entity.parent;
        }

        if (this._selectedEntity && this._selectedEntity.onSelect) {
            this._selectedEntity.onSelect(true);
        }
    }

}

export { MyContents };