import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MyApp } from './MyApp.js';
import { MyContents } from './MyContents.js';
import * as THREE from 'three';

/**
 * MyGuiInterface
 * Customizes the GUI interface for the application using lil-gui.
 * Provides controls for cameras, scene display, visual effects, submarine settings,
 * fish shoal behaviors, particle systems, and various scene entities.
 */
class MyGuiInterface  {

    /**
     * Constructs a new MyGuiInterface instance.
     * @param {MyApp} app - The main application object containing scene and controls.
     */
    constructor(app) {
        /**
         * Reference to the main application.
         * @type {MyApp}
         */
        this.app = app;
        
        /**
         * lil-gui instance for creating interactive controls.
         * @type {GUI}
         */
        this.datgui = new GUI();
        
        /**
         * Reference to the contents manager containing scene objects.
         * @type {MyContents|null}
         */
        this.contents = null;
    }

    /**
     * Sets the contents object for the GUI to interact with.
     * @param {MyContents} contents - The contents manager containing scene objects.
     */
    setContents(contents) {
        this.contents = contents
    }

    /**
     * Initializes the GUI interface with all control folders and settings.
     * Creates organized sections for cameras, scene display, visual effects, 
     * submarine controls, fish shoals, particle systems, and terrain entities.
     */
    init() {
 
        // adds a folder to the gui interface for the camera
        const cameraFolder = this.datgui.addFolder('Camera')
        cameraFolder.add(this.app, 'activeCameraName', [ 'Free-Fly', 'Submarine view', 'Swim view', 'Fixed aquarium view' ] ).name("active camera");
        cameraFolder.close()
        
        const sceneFolder = this.datgui.addFolder('Scene Display');
        const displaySettings = {
            wireframe: false
        };
        sceneFolder.add(displaySettings, 'wireframe').name("Wireframe Mode").onChange((value) => {
            if (this.contents) {
                this.contents.toggleWireframeMode(value);
            }
        });
        sceneFolder.close();

        const axisFolder = this.datgui.addFolder('Axis Display');
        const axisSettings = {
            displayAxis: false
        };
        axisFolder.add(axisSettings, 'displayAxis').name("Display Axis").onChange((value) => {
            if (this.contents) {
                if (value) {
                    if (!this.contents.axis) {
                        this.contents.axis = new THREE.AxesHelper(5);
                        this.app.scene.add(this.contents.axis);
                    }
                    this.contents.axis.visible = true;
                } else {
                    if (this.contents.axis) {
                        this.contents.axis.visible = false;
                    }
                }
            }
        });
        axisFolder.close();

        const dofFolder = this.datgui.addFolder('Depth of Field');
        const dofSettings = {
            enabled: false,
            aperture: 5.0,
            focus: 250.0,
            maxBlur: 0.01
        };

        dofFolder.add(dofSettings, 'enabled')
            .name('Enabled')
            .onChange((value) => {
                if (this.app) {
                    this.app.setDepthOfFieldEnabled(value);
                }
            });

        dofFolder.add(dofSettings, 'aperture', 0, 10, 0.1)
            .name('Aperture')
            .onChange((value) => {
                if (this.app) {
                    this.app.setDepthOfFieldAperture(value);
                }
            });

        dofFolder.add(dofSettings, 'focus', 1.0, 200.0, 10)
            .name('Focus Distance')
            .onChange((value) => {
                if (this.app) {
                    this.app.setDepthOfFieldFocus(value);
                }
            });

        dofFolder.add(dofSettings, 'maxBlur', 0.0, 0.01, 0.001)
            .name('Max Blur')
            .onChange((value) => {
                if (this.app) {
                    this.app.setDepthOfFieldMaxBlur(value);
                }
            });

        dofFolder.close();

        const terrainFolder = this.datgui.addFolder('Terrain Entities');
        const terrainSettings = {
            bubbles: this.contents?.bubbleGroup?.children.length || 10,
            crabs: this.contents?.crabGroup?.children.length || 7,
            algae: this.contents?.algaGroups?.children.length || 14,
            starfish: this.contents?.starFishGroup?.children.length || 10,
            rocks: this.contents?.rockGroup?.children.length || 10,
            coral0: (this.contents?.coralGroups?.children?.filter(c => c.type === 0)?.length) || 7,
            coral1: (this.contents?.coralGroups?.children?.filter(c => c.type === 1)?.length) || 7
        };

        terrainFolder.add(terrainSettings, 'bubbles', 0, 30, 1).name('Bubbles').onChange((value) => {
            if (this.contents && this.contents.setTerrainEntityCount) {
                this.contents.setTerrainEntityCount('bubbles', value);
            }
        });
        terrainFolder.add(terrainSettings, 'crabs', 0, 30, 1).name('Crabs').onChange((value) => {
            if (this.contents && this.contents.setTerrainEntityCount) {
                this.contents.setTerrainEntityCount('crabs', value);
            }
        });
        terrainFolder.add(terrainSettings, 'algae', 0, 30, 1).name('Algae').onChange((value) => {
            if (this.contents && this.contents.setTerrainEntityCount) {
                this.contents.setTerrainEntityCount('algae', value);
            }
        });
        terrainFolder.add(terrainSettings, 'starfish', 0, 30, 1).name('Starfish').onChange((value) => {
            if (this.contents && this.contents.setTerrainEntityCount) {
                this.contents.setTerrainEntityCount('starfish', value);
            }
        });
        terrainFolder.add(terrainSettings, 'rocks', 0, 30, 1).name('Rocks').onChange((value) => {
            if (this.contents && this.contents.setTerrainEntityCount) {
                this.contents.setTerrainEntityCount('rocks', value);
            }
        });
        terrainFolder.add(terrainSettings, 'coral0', 0, 30, 1).name('Coral Type 0').onChange((value) => {
            if (this.contents && this.contents.setTerrainEntityCount) {
                this.contents.setTerrainEntityCount('coral0', value);
            }
        });
        terrainFolder.add(terrainSettings, 'coral1', 0, 30, 1).name('Coral Type 1').onChange((value) => {
            if (this.contents && this.contents.setTerrainEntityCount) {
                this.contents.setTerrainEntityCount('coral1', value);
            }
        });
        terrainFolder.close();



        const bvhFolder = this.datgui.addFolder('BVH Optimization');
        const bvhSettings = {
            BVH: true,
            visualizer: false,
            visualizerController: null
        };

        bvhFolder.add(bvhSettings, 'BVH').name("BVH").onChange((value) => {
            this.contents?.toggleBVH();
            if (value) {
                if (!bvhSettings.visualizerController) {
                    bvhSettings.visualizerController = bvhFolder.add(bvhSettings, 'visualizer')
                        .name("BVH visualizer")
                        .onChange(() => this.contents?.showBVHBoxes());
                }
            } else {
                if (bvhSettings.visualizerController) {
                    bvhSettings.visualizerController.destroy();
                    bvhSettings.visualizerController = null;
                }
            }
        });
        bvhSettings.visualizerController = bvhFolder.add(bvhSettings, 'visualizer')
        .name("BVH visualizer")
        .onChange(() => this.contents?.showBVHBoxes());
        bvhFolder.close();

        // Submarine folder with all submarine-related controls
        const submarineFolder = this.datgui.addFolder('Submarine');

        // Periscope HUD control directly in submarine folder
        const submarineSettings = {
            periscopeHUD: false
        };

        submarineFolder.add(submarineSettings, 'periscopeHUD')
            .name('Periscope HUD')
            .onChange((value) => {
                if (this.app) {
                    this.app.setPeriscopeHUDEnabled(value);
                }
            });

        // Submarine Lights subfolder
        const submarineLightsFolder = submarineFolder.addFolder('Lights');
        const submarineLightSettings = {
            leftLightColor: '#ffff99',
            rightLightColor: '#ffff99',
            leftLightAngle: -Math.PI / 8,
            rightLightAngle: Math.PI / 8,
            flashingFreq: 1.5,
            leftLightIntensity: 50,
            rightLightIntensity: 50,
            applyLightSettings: () => {
                if (this.contents && this.contents.submarine) {
                    this.contents.submarine.updateLightSettings({
                        leftLightColor: submarineLightSettings.leftLightColor,
                        rightLightColor: submarineLightSettings.rightLightColor,
                        leftLightAngle: submarineLightSettings.leftLightAngle,
                        rightLightAngle: submarineLightSettings.rightLightAngle,
                        flashingFreq: submarineLightSettings.flashingFreq,
                        leftLightIntensity: submarineLightSettings.leftLightIntensity,
                        rightLightIntensity: submarineLightSettings.rightLightIntensity
                    });
                }
            }
        };

        const leftLightSubfolder = submarineLightsFolder.addFolder('Left Light');
        leftLightSubfolder
            .addColor(submarineLightSettings, 'leftLightColor')
            .name("Color")
            .onChange(() => submarineLightSettings.applyLightSettings());
        leftLightSubfolder
            .add(submarineLightSettings, 'leftLightIntensity', 0, 100)
            .name("Intensity")
            .step(1)
            .onChange(() => submarineLightSettings.applyLightSettings());
        leftLightSubfolder
            .add(submarineLightSettings, 'leftLightAngle', -Math.PI / 4, 0)
            .name("Angle")
            .step(0.01)
            .onChange(() => submarineLightSettings.applyLightSettings());
        leftLightSubfolder.close();

        const rightLightSubfolder = submarineLightsFolder.addFolder('Right Light');
        rightLightSubfolder
            .addColor(submarineLightSettings, 'rightLightColor')
            .name("Color")
            .onChange(() => submarineLightSettings.applyLightSettings());
        rightLightSubfolder
            .add(submarineLightSettings, 'rightLightIntensity', 0, 100)
            .name("Intensity")
            .step(1)
            .onChange(() => submarineLightSettings.applyLightSettings());
        rightLightSubfolder
            .add(submarineLightSettings, 'rightLightAngle', 0, Math.PI / 4)
            .name("Angle")
            .step(0.01)
            .onChange(() => submarineLightSettings.applyLightSettings());
        rightLightSubfolder.close();

        const warningLightSubfolder = submarineLightsFolder.addFolder('Warning Light');
        warningLightSubfolder
            .add(submarineLightSettings, 'flashingFreq', 0.5, 5)
            .name("Flashing Speed")
            .step(0.1)
            .onChange(() => submarineLightSettings.applyLightSettings());
        warningLightSubfolder.close();
        submarineLightsFolder.close();

        // Submarine Shield subfolder
        const shieldFolder = submarineFolder.addFolder('Shield');
        const shieldSettings = {
            color: '#66ccff',
            c: 1.0,
            p: 1.4,
            toggleSubmarineShield: false
        };

        shieldFolder.add(shieldSettings, 'toggleSubmarineShield')
            .name('Toggle Shield')
            .onChange((value) => {
                if (this.app) {
                    this.app.toggleSubmarineShield(value);
                }
            });

        shieldFolder.addColor(shieldSettings, 'color').name("Shield Color").onChange((value) => {
            this.contents.submarine.shieldMaterial.uniforms.glowColor.value.set(value);
        });
        shieldFolder.add(shieldSettings, 'c', 0, 1).step(0.01).name("c").onChange((value) => {
            this.contents.submarine.shieldMaterial.uniforms.c.value = value;
        });
        shieldFolder.add(shieldSettings, 'p', 0, 6).step(0.01).name("p").onChange((value) => {
            this.contents.submarine.shieldMaterial.uniforms.p.value = value;
        });
        shieldFolder.close();

        submarineFolder.close();

        // Bream Fish Shoal folder
        const breamShoalFolder = this.datgui.addFolder('Bream Fish Shoal');
        const breamShoalSettings = {
            fishCount: 50,
            separationDistance: 15.0,
            alignmentDistance: 40.0,
            cohesionDistance: 50.0,
            separationWeight: 3.0,
            alignmentWeight: 1.0,
            cohesionWeight: 3.0,
            maxSpeed: 80,
            maxForce: 5,
            areaSize: 1000,
            height: 200,
            boundaryMargin: 80,
            boundaryForce: 2.0,
            dangerDistance: 30,
            panicDistance: 25,
            color: '#506f6c',
            
            applySettings: () => {
                if (this.contents && this.contents.breamFishShoal) {
                    const shoal = this.contents.breamFishShoal;
                    
                    // Handle fish count changes
                    const currentFishCount = shoal.fishes.length;
                    const targetFishCount = breamShoalSettings.fishCount;
                    if (targetFishCount > currentFishCount) {
                        const fishToAdd = targetFishCount - currentFishCount;
                        if (shoal.addFish) shoal.addFish(fishToAdd);
                    } else if (targetFishCount < currentFishCount) {
                        const fishToRemove = currentFishCount - targetFishCount;
                        if (shoal.removeFish) shoal.removeFish(fishToRemove);
                    }
                    
                    shoal.options.separationDistance = breamShoalSettings.separationDistance;
                    shoal.options.alignmentDistance = breamShoalSettings.alignmentDistance;
                    shoal.options.cohesionDistance = breamShoalSettings.cohesionDistance;
                    shoal.options.separationWeight = breamShoalSettings.separationWeight;
                    shoal.options.alignmentWeight = breamShoalSettings.alignmentWeight;
                    shoal.options.cohesionWeight = breamShoalSettings.cohesionWeight;
                    shoal.options.maxSpeed = breamShoalSettings.maxSpeed;
                    shoal.options.maxForce = breamShoalSettings.maxForce;
                    shoal.options.areaSize = breamShoalSettings.areaSize;
                    shoal.options.height = breamShoalSettings.height;
                    shoal.options.boundsMargin = breamShoalSettings.boundaryMargin;
                    shoal.options.boundsWeight = breamShoalSettings.boundaryForce;
                    shoal.options.dangerDetectionDistance = breamShoalSettings.dangerDistance;
                    shoal.options.dangerEvasionDistance = breamShoalSettings.panicDistance;
                    
                    // Update color for all fish
                    shoal.fishMaterial.color.set(breamShoalSettings.color);
                    shoal.fishes.forEach(fish => {
                        fish.traverse((child) => {
                            if (child.isMesh && child.material) {
                                child.material.color.set(breamShoalSettings.color);
                            }
                        });
                    });
                    
                }
            }
        };

        const breamSeparationFolder = breamShoalFolder.addFolder('Separation');
        breamSeparationFolder.add(breamShoalSettings, 'separationDistance', 10, 200).name('Distance').step(0.5)
            .onChange((value) => {
                if (this.contents && this.contents.breamFishShoal) {
                    this.contents.breamFishShoal.options.separationDistance = value;
                    // Force immediate recalculation
                    if (this.contents.breamFishShoal.bvhEnabled && this.contents.breamFishShoal.updateBVHGeometry) {
                        this.contents.breamFishShoal.updateBVHGeometry();
                    }
                }
            });
        breamSeparationFolder.add(breamShoalSettings, 'separationWeight', 0, 10).name('Weight').step(0.1)
            .onChange((value) => {
                if (this.contents && this.contents.breamFishShoal) {
                    this.contents.breamFishShoal.options.separationWeight = value;
                }
            });
        breamSeparationFolder.close();

        const breamAlignmentFolder = breamShoalFolder.addFolder('Alignment');
        breamAlignmentFolder.add(breamShoalSettings, 'alignmentDistance', 10, 200).name('Distance').step(0.5)
            .onChange((value) => {
                if (this.contents && this.contents.breamFishShoal) {
                    this.contents.breamFishShoal.options.alignmentDistance = value;
                }
            });
        breamAlignmentFolder.add(breamShoalSettings, 'alignmentWeight', 0, 10).name('Weight').step(0.1)
            .onChange((value) => {
                if (this.contents && this.contents.breamFishShoal) {
                    this.contents.breamFishShoal.options.alignmentWeight = value;
                }
            });
        breamAlignmentFolder.close();

        const breamCohesionFolder = breamShoalFolder.addFolder('Cohesion');
        breamCohesionFolder.add(breamShoalSettings, 'cohesionDistance', 10, 200).name('Distance').step(0.5)
            .onChange((value) => {
                if (this.contents && this.contents.breamFishShoal) {
                    this.contents.breamFishShoal.options.cohesionDistance = value;
                }
            });
        breamCohesionFolder.add(breamShoalSettings, 'cohesionWeight', 0, 10).name('Weight').step(0.1)
            .onChange((value) => {
                if (this.contents && this.contents.breamFishShoal) {
                    this.contents.breamFishShoal.options.cohesionWeight = value;
                }
            });
        breamCohesionFolder.close();

        const breamMovementFolder = breamShoalFolder.addFolder('Movement');
        breamMovementFolder.add(breamShoalSettings, 'maxSpeed', 40, 100).name('Max Speed').step(0.1)
            .onChange((value) => {
                if (this.contents && this.contents.breamFishShoal) {
                    this.contents.breamFishShoal.options.maxSpeed = value;
                }
            });
        breamMovementFolder.add(breamShoalSettings, 'maxForce', 0.1, 10).name('Max Force').step(0.01)
            .onChange((value) => {
                if (this.contents && this.contents.breamFishShoal) {
                    this.contents.breamFishShoal.options.maxForce = value;
                }
            });
        breamMovementFolder.close();

        const breamBoundaryFolder = breamShoalFolder.addFolder('Boundaries');
        breamBoundaryFolder.add(breamShoalSettings, 'areaSize', 200, 2000).name('Area Size').step(50)
            .onChange((value) => {
                if (this.contents && this.contents.breamFishShoal) {
                    this.contents.breamFishShoal.options.areaSize = value;
                }
            });
        breamBoundaryFolder.add(breamShoalSettings, 'height', 50, 400).name('Height').step(10)
            .onChange((value) => {
                if (this.contents && this.contents.breamFishShoal) {
                    this.contents.breamFishShoal.options.height = value;
                }
            });
        breamBoundaryFolder.add(breamShoalSettings, 'boundaryMargin', 20, 150).name('Margin').step(5)
            .onChange((value) => {
                if (this.contents && this.contents.breamFishShoal) {
                    this.contents.breamFishShoal.options.boundsMargin = value;
                }
            });
        breamBoundaryFolder.add(breamShoalSettings, 'boundaryForce', 0.5, 10).name('Force').step(0.1)
            .onChange((value) => {
                if (this.contents && this.contents.breamFishShoal) {
                    this.contents.breamFishShoal.options.boundsWeight = value;
                }
            });
        breamBoundaryFolder.close();

        const breamDangerFolder = breamShoalFolder.addFolder('Danger Settings');
        breamDangerFolder.add(breamShoalSettings, 'dangerDistance', 10, 60).name('Detection Distance').step(2)
            .onChange((value) => {
                if (this.contents && this.contents.breamFishShoal) {
                    this.contents.breamFishShoal.options.dangerDetectionDistance = value;
                }
            });
        breamDangerFolder.add(breamShoalSettings, 'panicDistance', 5, 30).name('Panic Distance').step(1)
            .onChange((value) => {
                if (this.contents && this.contents.breamFishShoal) {
                    this.contents.breamFishShoal.options.dangerEvasionDistance = value;
                }
            });
        breamDangerFolder.close();

        const breamVisualFolder = breamShoalFolder.addFolder('Visual');
        breamVisualFolder.addColor(breamShoalSettings, 'color').name('Color')
            .onChange((value) => {
                if (this.contents && this.contents.breamFishShoal) {
                    const shoal = this.contents.breamFishShoal;
                    shoal.fishMaterial.color.set(value);
                    shoal.fishes.forEach(fish => {
                        fish.traverse((child) => {
                            if (child.isMesh && child.material) {
                                child.material.color.set(value);
                            }
                        });
                    });
                }
            });
        breamVisualFolder.add(breamShoalSettings, 'fishCount', 1, 300).name('Fish Count').step(1)
            .onChange((value) => {
                if (this.contents && this.contents.breamFishShoal) {
                    const shoal = this.contents.breamFishShoal;
                    const currentFishCount = shoal.fishes.length;
                    if (value > currentFishCount) {
                        const fishToAdd = value - currentFishCount;
                        if (shoal.addFish) shoal.addFish(fishToAdd);
                    } else if (value < currentFishCount) {
                        const fishToRemove = currentFishCount - value;
                        if (shoal.removeFish) shoal.removeFish(fishToRemove);
                    }
                }
            });
        breamVisualFolder.close();

        breamShoalFolder.close();

        // Slim Fish Shoal folder
        const slimShoalFolder = this.datgui.addFolder('Slim Fish Shoal');
        const slimShoalSettings = {
            fishCount: 40,
            separationDistance: 15.0,
            alignmentDistance: 40.0,
            cohesionDistance: 50.0,
            separationWeight: 3,
            alignmentWeight: 1,
            cohesionWeight: 3.0,
            maxSpeed: 80,
            maxForce: 5,
            areaSize: 1000,
            height: 200,
            boundaryMargin: 50,
            boundaryForce: 5.0,
            dangerDistance: 30,
            panicDistance: 35,
            scale: 3.5,
            color: '#8dcec7',
            
            applySettings: () => {
                if (this.contents && this.contents.slimFishShoal) {
                    const shoal = this.contents.slimFishShoal;
                    
                    // Handle fish count changes
                    const currentFishCount = shoal.fishes.length;
                    const targetFishCount = slimShoalSettings.fishCount;
                    if (targetFishCount > currentFishCount) {
                        const fishToAdd = targetFishCount - currentFishCount;
                        if (shoal.addFish) shoal.addFish(fishToAdd);
                    } else if (targetFishCount < currentFishCount) {
                        const fishToRemove = currentFishCount - targetFishCount;
                        if (shoal.removeFish) shoal.removeFish(fishToRemove);
                    }
                    
                    shoal.options.separationDistance = slimShoalSettings.separationDistance;
                    shoal.options.alignmentDistance = slimShoalSettings.alignmentDistance;
                    shoal.options.cohesionDistance = slimShoalSettings.cohesionDistance;
                    shoal.options.separationWeight = slimShoalSettings.separationWeight;
                    shoal.options.alignmentWeight = slimShoalSettings.alignmentWeight;
                    shoal.options.cohesionWeight = slimShoalSettings.cohesionWeight;
                    shoal.options.maxSpeed = slimShoalSettings.maxSpeed;
                    shoal.options.maxForce = slimShoalSettings.maxForce;
                    shoal.options.areaSize = slimShoalSettings.areaSize;
                    shoal.options.height = slimShoalSettings.height;
                    shoal.options.boundsMargin = slimShoalSettings.boundaryMargin;
                    shoal.options.boundsWeight = slimShoalSettings.boundaryForce;
                    shoal.options.dangerDetectionDistance = slimShoalSettings.dangerDistance;
                    shoal.options.dangerEvasionDistance = slimShoalSettings.panicDistance;
                    
                    // Update color for all fish
                    shoal.fishMaterial.color.set(slimShoalSettings.color);
                    shoal.fishes.forEach(fish => {
                        fish.traverse((child) => {
                            if (child.isMesh && child.material) {
                                child.material.color.set(slimShoalSettings.color);
                            }
                        });
                    });
                    
                }
            }
        };

        const slimSeparationFolder = slimShoalFolder.addFolder('Separation');
        slimSeparationFolder.add(slimShoalSettings, 'separationDistance', 10, 200).name('Distance').step(0.5)
            .onChange((value) => {
                if (this.contents && this.contents.slimFishShoal) {
                    this.contents.slimFishShoal.options.separationDistance = value;
                    // Force immediate recalculation
                    if (this.contents.slimFishShoal.bvhEnabled && this.contents.slimFishShoal.updateBVHGeometry) {
                        this.contents.slimFishShoal.updateBVHGeometry();
                    }
                }
            });
        slimSeparationFolder.add(slimShoalSettings, 'separationWeight', 0, 10).name('Weight').step(0.1)
            .onChange((value) => {
                if (this.contents && this.contents.slimFishShoal) {
                    this.contents.slimFishShoal.options.separationWeight = value;
                }
            });
        slimSeparationFolder.close();

        const slimAlignmentFolder = slimShoalFolder.addFolder('Alignment');
        slimAlignmentFolder.add(slimShoalSettings, 'alignmentDistance', 10, 200).name('Distance').step(0.5)
            .onChange((value) => {
                if (this.contents && this.contents.slimFishShoal) {
                    this.contents.slimFishShoal.options.alignmentDistance = value;
                }
            });
        slimAlignmentFolder.add(slimShoalSettings, 'alignmentWeight', 0, 10).name('Weight').step(0.1)
            .onChange((value) => {
                if (this.contents && this.contents.slimFishShoal) {
                    this.contents.slimFishShoal.options.alignmentWeight = value;
                }
            });
        slimAlignmentFolder.close();

        const slimCohesionFolder = slimShoalFolder.addFolder('Cohesion');
        slimCohesionFolder.add(slimShoalSettings, 'cohesionDistance', 10, 200).name('Distance').step(0.5)
            .onChange((value) => {
                if (this.contents && this.contents.slimFishShoal) {
                    this.contents.slimFishShoal.options.cohesionDistance = value;
                }
            });
        slimCohesionFolder.add(slimShoalSettings, 'cohesionWeight', 0, 10).name('Weight').step(0.1)
            .onChange((value) => {
                if (this.contents && this.contents.slimFishShoal) {
                    this.contents.slimFishShoal.options.cohesionWeight = value;
                }
            });
        slimCohesionFolder.close();

        const slimMovementFolder = slimShoalFolder.addFolder('Movement');
        slimMovementFolder.add(slimShoalSettings, 'maxSpeed', 40, 100).name('Max Speed').step(0.1)
            .onChange((value) => {
                if (this.contents && this.contents.slimFishShoal) {
                    this.contents.slimFishShoal.options.maxSpeed = value;
                }
            });
        slimMovementFolder.add(slimShoalSettings, 'maxForce', 0.1, 10).name('Max Force').step(0.01)
            .onChange((value) => {
                if (this.contents && this.contents.slimFishShoal) {
                    this.contents.slimFishShoal.options.maxForce = value;
                }
            });
        slimMovementFolder.close();

        const slimBoundaryFolder = slimShoalFolder.addFolder('Boundaries');
        slimBoundaryFolder.add(slimShoalSettings, 'areaSize', 200, 2000).name('Area Size').step(50)
            .onChange((value) => {
                if (this.contents && this.contents.slimFishShoal) {
                    this.contents.slimFishShoal.options.areaSize = value;
                }
            });
        slimBoundaryFolder.add(slimShoalSettings, 'height', 50, 400).name('Height').step(10)
            .onChange((value) => {
                if (this.contents && this.contents.slimFishShoal) {
                    this.contents.slimFishShoal.options.height = value;
                }
            });
        slimBoundaryFolder.add(slimShoalSettings, 'boundaryMargin', 20, 150).name('Margin').step(5)
            .onChange((value) => {
                if (this.contents && this.contents.slimFishShoal) {
                    this.contents.slimFishShoal.options.boundsMargin = value;
                }
            });
        slimBoundaryFolder.add(slimShoalSettings, 'boundaryForce', 0.5, 5).name('Force').step(0.1)
            .onChange((value) => {
                if (this.contents && this.contents.slimFishShoal) {
                    this.contents.slimFishShoal.options.boundsWeight = value;
                }
            });
        slimBoundaryFolder.close();

        const slimDangerFolder = slimShoalFolder.addFolder('Danger Settings');
        slimDangerFolder.add(slimShoalSettings, 'dangerDistance', 10, 60).name('Detection Distance').step(2)
            .onChange((value) => {
                if (this.contents && this.contents.slimFishShoal) {
                    this.contents.slimFishShoal.options.dangerDetectionDistance = value;
                }
            });
        slimDangerFolder.add(slimShoalSettings, 'panicDistance', 5, 30).name('Panic Distance').step(1)
            .onChange((value) => {
                if (this.contents && this.contents.slimFishShoal) {
                    this.contents.slimFishShoal.options.dangerEvasionDistance = value;
                }
            });
        slimDangerFolder.close();

        const slimVisualFolder = slimShoalFolder.addFolder('Visual');
        slimVisualFolder.addColor(slimShoalSettings, 'color').name('Color')
            .onChange((value) => {
                if (this.contents && this.contents.slimFishShoal) {
                    const shoal = this.contents.slimFishShoal;
                    shoal.fishMaterial.color.set(value);
                    shoal.fishes.forEach(fish => {
                        fish.traverse((child) => {
                            if (child.isMesh && child.material) {
                                child.material.color.set(value);
                            }
                        });
                    });
                }
            });
        slimVisualFolder.add(slimShoalSettings, 'fishCount', 1, 300).name('Fish Count').step(1)
            .onChange((value) => {
                if (this.contents && this.contents.slimFishShoal) {
                    const shoal = this.contents.slimFishShoal;
                    const currentFishCount = shoal.fishes.length;
                    if (value > currentFishCount) {
                        const fishToAdd = value - currentFishCount;
                        if (shoal.addFish) shoal.addFish(fishToAdd);
                    } else if (value < currentFishCount) {
                        const fishToRemove = currentFishCount - value;
                        if (shoal.removeFish) shoal.removeFish(fishToRemove);
                    }
                }
            });
        slimVisualFolder.add(slimShoalSettings, 'scale', 1, 7).name('Scale').step(0.05)
            .onChange((value) => {
                if (this.contents && this.contents.slimFishShoal) {
                    if (this.contents.slimFishShoal.setFishScale) {
                        this.contents.slimFishShoal.setFishScale(value);
                    }
                }
            });
        slimVisualFolder.close();

        slimShoalFolder.close();
        
        // Turtle Shoal folder
        const turtleShoalFolder = this.datgui.addFolder('Turtle Shoal');
        const turtleShoalSettings = {
            fishCount: 12,
            separationDistance: 15.0,
            alignmentDistance: 40.0,
            cohesionDistance: 50.0,
            separationWeight: 3,
            alignmentWeight: 1.5,
            cohesionWeight: 3.0,
            maxSpeed: 80,
            maxForce: 5,
            areaSize: 1000,
            height: 200,
            boundaryMargin: 50,
            boundaryForce: 5.0,
            dangerDistance: 30,
            panicDistance: 25,
            scale: 10.0,
            color: '#20622a',
            
            applySettings: () => {
                if (this.contents && this.contents.turtleShoal) {
                    const shoal = this.contents.turtleShoal;
                    
                    const currentFishCount = shoal.fishes.length;
                    const targetFishCount = turtleShoalSettings.fishCount;
                    if (targetFishCount > currentFishCount) {
                        const fishToAdd = targetFishCount - currentFishCount;
                        if (shoal.addFish) shoal.addFish(fishToAdd);
                    } else if (targetFishCount < currentFishCount) {
                        const fishToRemove = currentFishCount - targetFishCount;
                        if (shoal.removeFish) shoal.removeFish(fishToRemove);
                    }
                    
                    shoal.options.separationDistance = turtleShoalSettings.separationDistance;
                    shoal.options.alignmentDistance = turtleShoalSettings.alignmentDistance;
                    shoal.options.cohesionDistance = turtleShoalSettings.cohesionDistance;
                    shoal.options.separationWeight = turtleShoalSettings.separationWeight;
                    shoal.options.alignmentWeight = turtleShoalSettings.alignmentWeight;
                    shoal.options.cohesionWeight = turtleShoalSettings.cohesionWeight;
                    shoal.options.maxSpeed = turtleShoalSettings.maxSpeed;
                    shoal.options.maxForce = turtleShoalSettings.maxForce;
                    shoal.options.areaSize = turtleShoalSettings.areaSize;
                    shoal.options.height = turtleShoalSettings.height;
                    shoal.options.boundsMargin = turtleShoalSettings.boundaryMargin;
                    shoal.options.boundsWeight = turtleShoalSettings.boundaryForce;
                    shoal.options.dangerDetectionDistance = turtleShoalSettings.dangerDistance;
                    shoal.options.dangerEvasionDistance = turtleShoalSettings.panicDistance;

                    if (shoal.setFishScale) {
                        shoal.setFishScale(turtleShoalSettings.scale);
                    }
                    
                    shoal.fishMaterial.color.set(turtleShoalSettings.color);
                    shoal.fishes.forEach(fish => {
                        fish.traverse((child) => {
                            if (child.isMesh && child.material) {
                                child.material.color.set(turtleShoalSettings.color);
                            }
                        });
                    });
                }
            }
        };

        const turtleSeparationFolder = turtleShoalFolder.addFolder('Separation');
        turtleSeparationFolder.add(turtleShoalSettings, 'separationDistance', 10, 200).name('Distance').step(0.5)
            .onChange((value) => {
                if (this.contents && this.contents.turtleShoal) {
                    this.contents.turtleShoal.options.separationDistance = value;
                    if (this.contents.turtleShoal.bvhEnabled && this.contents.turtleShoal.updateBVHGeometry) {
                        this.contents.turtleShoal.updateBVHGeometry();
                    }
                }
            });
        turtleSeparationFolder.add(turtleShoalSettings, 'separationWeight', 0, 10).name('Weight').step(0.1)
            .onChange((value) => {
                if (this.contents && this.contents.turtleShoal) {
                    this.contents.turtleShoal.options.separationWeight = value;
                }
            });
        turtleSeparationFolder.close();

        const turtleAlignmentFolder = turtleShoalFolder.addFolder('Alignment');
        turtleAlignmentFolder.add(turtleShoalSettings, 'alignmentDistance', 10, 200).name('Distance').step(0.5)
            .onChange((value) => {
                if (this.contents && this.contents.turtleShoal) {
                    this.contents.turtleShoal.options.alignmentDistance = value;
                }
            });
        turtleAlignmentFolder.add(turtleShoalSettings, 'alignmentWeight', 0, 10).name('Weight').step(0.1)
            .onChange((value) => {
                if (this.contents && this.contents.turtleShoal) {
                    this.contents.turtleShoal.options.alignmentWeight = value;
                }
            });
        turtleAlignmentFolder.close();

        const turtleCohesionFolder = turtleShoalFolder.addFolder('Cohesion');
        turtleCohesionFolder.add(turtleShoalSettings, 'cohesionDistance', 10, 200).name('Distance').step(0.5)
            .onChange((value) => {
                if (this.contents && this.contents.turtleShoal) {
                    this.contents.turtleShoal.options.cohesionDistance = value;
                }
            });
        turtleCohesionFolder.add(turtleShoalSettings, 'cohesionWeight', 0, 10).name('Weight').step(0.1)
            .onChange((value) => {
                if (this.contents && this.contents.turtleShoal) {
                    this.contents.turtleShoal.options.cohesionWeight = value;
                }
            });
        turtleCohesionFolder.close();

        const turtleMovementFolder = turtleShoalFolder.addFolder('Movement');
        turtleMovementFolder.add(turtleShoalSettings, 'maxSpeed', 40, 100).name('Max Speed').step(0.1)
            .onChange((value) => {
                if (this.contents && this.contents.turtleShoal) {
                    this.contents.turtleShoal.options.maxSpeed = value;
                }
            });
        turtleMovementFolder.add(turtleShoalSettings, 'maxForce', 0.1, 10).name('Max Force').step(0.01)
            .onChange((value) => {
                if (this.contents && this.contents.turtleShoal) {
                    this.contents.turtleShoal.options.maxForce = value;
                }
            });
        turtleMovementFolder.close();

        const turtleBoundaryFolder = turtleShoalFolder.addFolder('Boundaries');
        turtleBoundaryFolder.add(turtleShoalSettings, 'areaSize', 200, 2000).name('Area Size').step(50)
            .onChange((value) => {
                if (this.contents && this.contents.turtleShoal) {
                    this.contents.turtleShoal.options.areaSize = value;
                }
            });
        turtleBoundaryFolder.add(turtleShoalSettings, 'height', 50, 400).name('Height').step(10)
            .onChange((value) => {
                if (this.contents && this.contents.turtleShoal) {
                    this.contents.turtleShoal.options.height = value;
                }
            });
        turtleBoundaryFolder.add(turtleShoalSettings, 'boundaryMargin', 20, 150).name('Margin').step(5)
            .onChange((value) => {
                if (this.contents && this.contents.turtleShoal) {
                    this.contents.turtleShoal.options.boundsMargin = value;
                }
            });
        turtleBoundaryFolder.add(turtleShoalSettings, 'boundaryForce', 0.5, 5).name('Force').step(0.1)
            .onChange((value) => {
                if (this.contents && this.contents.turtleShoal) {
                    this.contents.turtleShoal.options.boundsWeight = value;
                }
            });
        turtleBoundaryFolder.close();

        const turtleDangerFolder = turtleShoalFolder.addFolder('Danger Settings');
        turtleDangerFolder.add(turtleShoalSettings, 'dangerDistance', 10, 60).name('Detection Distance').step(2)
            .onChange((value) => {
                if (this.contents && this.contents.turtleShoal) {
                    this.contents.turtleShoal.options.dangerDetectionDistance = value;
                }
            });
        turtleDangerFolder.add(turtleShoalSettings, 'panicDistance', 5, 30).name('Panic Distance').step(1)
            .onChange((value) => {
                if (this.contents && this.contents.turtleShoal) {
                    this.contents.turtleShoal.options.dangerEvasionDistance = value;
                }
            });
        turtleDangerFolder.close();

        const turtleVisualFolder = turtleShoalFolder.addFolder('Visual');
        turtleVisualFolder.addColor(turtleShoalSettings, 'color').name('Color')
            .onChange((value) => {
                if (this.contents && this.contents.turtleShoal) {
                    const shoal = this.contents.turtleShoal;
                    shoal.fishMaterial.color.set(value);
                    shoal.fishes.forEach(fish => {
                        fish.traverse((child) => {
                            if (child.isMesh && child.material) {
                                child.material.color.set(value);
                            }
                        });
                    });
                }
            });
        turtleVisualFolder.add(turtleShoalSettings, 'fishCount', 1, 25).name('Turtle Count').step(1)
            .onChange((value) => {
                if (this.contents && this.contents.turtleShoal) {
                    const shoal = this.contents.turtleShoal;
                    const currentFishCount = shoal.fishes.length;
                    if (value > currentFishCount) {
                        const fishToAdd = value - currentFishCount;
                        if (shoal.addFish) shoal.addFish(fishToAdd);
                    } else if (value < currentFishCount) {
                        const fishToRemove = currentFishCount - value;
                        if (shoal.removeFish) shoal.removeFish(fishToRemove);
                    }
                }
            });
        turtleVisualFolder.add(turtleShoalSettings, 'scale', 3, 20).name('Scale').step(0.5)
            .onChange((value) => {
                if (this.contents && this.contents.turtleShoal) {
                    if (this.contents.turtleShoal.setFishScale) {
                        this.contents.turtleShoal.setFishScale(value);
                    }
                }
            });
        turtleVisualFolder.close();
        turtleShoalFolder.close();

        // Particle Systems folder
        const particleSystemsFolder = this.datgui.addFolder('Particle Systems');
        const particleSettings = {
            marineSnowEnabled: true,

        };
        
        particleSystemsFolder.add(particleSettings, 'marineSnowEnabled')
            .name('Marine Snow')
            .onChange((value) => {
                if (this.contents && this.contents.marineSnow) {
                    this.contents.marineSnow.visible = value;
                }
            });
        
        particleSystemsFolder.close();
        
        // Store reference to update LOD status dynamically
        this.particleSettings = particleSettings;
    }
    
}

export { MyGuiInterface };