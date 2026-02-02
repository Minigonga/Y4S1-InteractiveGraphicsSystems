import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MyContents } from './MyContents.js';
import { MyGuiInterface } from './MyGuiInterface.js';
import { MyPeriscopeHUD } from './MyPeriscopeHUD.js';
import Stats from 'three/addons/libs/stats.module.js';

// Import post-processing libraries
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

/**
 * MyApp
 * Main application class that manages the 3D scene, cameras, rendering, and post-processing effects.
 * Coordinates all components including GUI, controls, and custom content.
 */
class MyApp {
    /**
     * Constructs a new MyApp instance.
     * Initializes scene, cameras, renderer, and post-processing systems.
     */
    constructor() {
        /**
         * The main THREE.Scene containing all 3D objects.
         * @type {THREE.Scene}
         */
        this.scene = null;
        
        /**
         * Performance statistics monitor.
         * @type {Stats}
         */
        this.stats = null;

        /**
         * Currently active camera.
         * @type {THREE.Camera}
         */
        this.activeCamera = null;
        
        /**
         * Name of the currently active camera.
         * @type {string}
         */
        this.activeCameraName = null;
        
        /**
         * Name of the previously active camera (for change detection).
         * @type {string}
         */
        this.lastCameraName = null;
        
        /**
         * Dictionary of available cameras by name.
         * @type {Object<string, THREE.Camera>}
         */
        this.cameras = [];
        
        /**
         * Frustum size used for orthographic camera calculations.
         * @type {number}
         */
        this.frustumSize = 120;

        /**
         * WebGL renderer for displaying the 3D scene.
         * @type {THREE.WebGLRenderer}
         */
        this.renderer = null;
        
        /**
         * OrbitControls for camera interaction.
         * @type {OrbitControls}
         */
        this.controls = null;
        
        /**
         * GUI interface for controlling application parameters.
         * @type {MyGuiInterface}
         */
        this.gui = null;
        
        /**
         * Coordinate axis helper (currently unused).
         * @type {THREE.AxesHelper|null}
         */
        this.axis = null;
        
        /**
         * Custom content manager containing scene objects.
         * @type {MyContents}
         */
        this.contents = null;

        /**
         * Depth of field effect instance.
         * @type {BokehPass|null}
         */
        this.depthOfField = null;
        
        /**
         * Periscope HUD display system.
         * @type {MyPeriscopeHUD|null}
         */
        this.periscopeHUD = null;
        
        /**
         * Toggle states for various visual effects.
         * @type {Object}
         * @property {boolean} depthOfField - Depth of field effect enabled state.
         * @property {boolean} periscopeHUD - Periscope HUD enabled state.
         */
        this.effectsEnabled = {
            depthOfField: false,
            periscopeHUD: false
        };
        
        /**
         * Post-processing system components.
         * @type {Object}
         * @property {EffectComposer|null} composer - Main effect composer.
         * @property {RenderPass|null} renderPass - Initial render pass.
         * @property {BokehPass|null} bokehPass - Depth of field pass.
         */
        this.postprocessing = {};
        
        /**
         * Depth of field effect parameters.
         * @type {Object}
         * @property {number} focus - Focus distance in world units.
         * @property {number} aperture - Aperture size (affects blur strength).
         * @property {number} maxblur - Maximum blur amount.
         */
        this.dofParameters = {
            focus: 50.0,
            aperture: 5,
            maxblur: 0.01
        };
    }
    
    /**
     * Initializes the application, creating scene, cameras, renderer, and controls.
     * Sets up the WebGL context and event listeners.
     */
    init() {
        // Create and configure main scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x101010);

        // Initialize performance statistics
        this.stats = new Stats();
        this.stats.showPanel(1);
        document.body.appendChild(this.stats.dom);

        // Set up cameras and rendering
        this.initCameras();
        this.setActiveCamera('Free-Fly');

        // Create WebGL renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor("#000000");
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        // Add renderer to DOM
        document.getElementById("canvas").appendChild(this.renderer.domElement);

        // Set up window resize handler
        window.addEventListener('resize', this.onResize.bind(this), false);

        // Initialize camera controls
        this.controls = new OrbitControls(this.activeCamera, this.renderer.domElement);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }

    /**
     * Initializes all camera views available in the application.
     * Creates perspective and orthographic cameras with predefined positions.
     */
    initCameras() {
        const aspect = window.innerWidth / window.innerHeight;

        // Free-fly camera (default navigation)
        const perspective1 = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        perspective1.position.set(50, 30, 50);
        this.cameras['Free-Fly'] = perspective1;

        // Calculate orthographic camera bounds
        const left = -this.frustumSize / 2 * aspect;
        const right = this.frustumSize / 2 * aspect;
        const top = this.frustumSize / 2;
        const bottom = -this.frustumSize / 2;

        // Submarine interior view (attached to submarine)
        const submarineView = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.cameras['Submarine view'] = submarineView;

        // Swimming character view
        const swimView = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        swimView.position.set(50, 96, 0);
        swimView.lookAt(new THREE.Vector3(0, 85, 0));
        this.cameras['Swim view'] = swimView;

        // Fixed orthographic aquarium overview
        const fixedView = new THREE.OrthographicCamera(left, right, top, bottom, 1, 1000);
        fixedView.up = new THREE.Vector3(0, 1, 0);
        fixedView.position.set(200, 50, 0);
        fixedView.lookAt(new THREE.Vector3(0, 1.5, 0));
        this.cameras['Fixed aquarium view'] = fixedView;
    }

    /**
     * Sets the active camera by name and updates relevant systems.
     * @param {string} cameraName - Name of the camera to activate.
     */
    setActiveCamera(cameraName) {
        this.activeCameraName = cameraName;
        this.activeCamera = this.cameras[this.activeCameraName];
    }

    /**
     * Updates the active camera if a camera change is detected.
     * Adjusts controls and post-processing systems based on the new camera.
     * Called during each render loop iteration.
     */
    updateCameraIfRequired() {
        if (this.lastCameraName !== this.activeCameraName) {
            this.lastCameraName = this.activeCameraName;
            this.activeCamera = this.cameras[this.activeCameraName];
            
            // Update UI display
            document.getElementById("camera").innerHTML = this.activeCameraName;
            
            // Handle window resize for new camera
            this.onResize();
            
            // Update controls for new camera
            this.controls.object = this.activeCamera;

            // Configure controls based on camera type
            if (this.activeCameraName === 'Fixed aquarium view') {
                this.controls.target.set(0, 15, 0);
                this.controls.enableRotate = false;
                this.controls.enableZoom = false;
                this.controls.enablePan = false;
            } else if (this.activeCameraName === 'Free-Fly') {
                this.controls.target.set(0, 0, 0);
                this.controls.enableRotate = true;
                this.controls.enableZoom = true;
                this.controls.enablePan = true;
            } else if (this.activeCameraName === 'Submarine view') {
                this.controls.enablePan = false;
                this.controls.enableZoom = false;
            } else {
                // Swim view or other cameras
                this.controls.target.set(0, 85, 0);
                this.controls.enableRotate = false;
                this.controls.enablePan = false;
                this.controls.enableZoom = false;
            }
            
            // Update post-processing for camera changes
            if (this.postprocessing.composer) {
                this.postprocessing.bokehPass.camera = this.activeCamera;
                
                if (this.postprocessing.renderPass) {
                    this.postprocessing.renderPass.camera = this.activeCamera;
                }
            }
        }
    }
    
    /**
     * Initializes the depth of field post-processing system.
     * Creates render passes and effect composer for bokeh effects.
     */
    initDepthOfField() {
        // Create render passes
        this.postprocessing.renderPass = new RenderPass(this.scene, this.activeCamera);
        
        this.postprocessing.bokehPass = new BokehPass(this.scene, this.activeCamera, {
            focus: 1.0,
            aperture: 0.025,
            maxblur: 0.01
        });
        
        const outputPass = new OutputPass();
        
        // Create and configure effect composer
        this.postprocessing.composer = new EffectComposer(this.renderer);
        this.postprocessing.composer.addPass(this.postprocessing.renderPass);
        this.postprocessing.composer.addPass(this.postprocessing.bokehPass);
        this.postprocessing.composer.addPass(outputPass);
        
        // Apply initial parameters
        this.updateBokehParameters();
    }

    /**
     * Updates the depth of field effect parameters.
     * Applies current DOF settings to the bokeh pass uniforms.
     */
    updateBokehParameters() {
        if (this.postprocessing.bokehPass) {
            this.postprocessing.bokehPass.uniforms['focus'].value = this.dofParameters.focus;
            this.postprocessing.bokehPass.uniforms['aperture'].value = this.dofParameters.aperture * 0.00001;
            this.postprocessing.bokehPass.uniforms['maxblur'].value = this.dofParameters.maxblur;
        }
    }

    /**
     * Handles window resize events.
     * Updates camera aspect ratios, renderer size, and post-processing systems.
     */
    onResize() {
        if (this.activeCamera !== undefined && this.activeCamera !== null) {
            // Update camera projection
            this.activeCamera.aspect = window.innerWidth / window.innerHeight;
            this.activeCamera.updateProjectionMatrix();
            
            // Update renderer size
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            
            // Update post-processing systems
            if (this.postprocessing.composer) {
                this.postprocessing.composer.setSize(window.innerWidth, window.innerHeight);
            }
            
            // Update HUD display
            if (this.periscopeHUD) {
                this.periscopeHUD.resize(window.innerWidth, window.innerHeight);
            }
        }
    }
    
    /**
     * Sets the custom content manager and initializes dependent systems.
     * @param {MyContents} contents - The content manager containing scene objects.
     */
    setContents(contents) {
        this.contents = contents;

        // Initialize depth of field effects
        this.initDepthOfField();
        
        // Initialize periscope HUD if submarine exists
        if (this.contents && this.contents.submarine) {
            if (this.cameras['Submarine view']) {
                this.periscopeHUD = new MyPeriscopeHUD(
                    this.renderer,
                    this.scene,
                    this.cameras['Submarine view'],
                    this.contents.submarine
                );
                
                if (this.periscopeHUD) {
                    this.periscopeHUD.setEnabled(this.effectsEnabled.periscopeHUD);
                }
            }
        }
    }

    /**
     * Sets the GUI interface for controlling application parameters.
     * @param {MyGuiInterface} gui - The GUI interface object.
     */
    setGui(gui) {
        this.gui = gui;
    }

    /**
     * Main render loop function.
     * Called recursively via requestAnimationFrame.
     * Updates scene, applies effects, and renders the view.
     */
    render() {
        this.stats.begin();
        this.updateCameraIfRequired();

        if (this.activeCamera !== undefined && this.activeCamera !== null) {
            // Update scene contents
            this.contents.update();
        
            // Update visual effects
            const time = performance.now() * 0.001;
            if (this.periscopeHUD && this.effectsEnabled.periscopeHUD) {
                this.periscopeHUD.update(time);
            }
        }

        // Update camera controls
        this.controls.update();

        if (this.effectsEnabled.depthOfField && this.postprocessing.composer) {
            this.postprocessing.composer.render();
        } else {
            this.renderer.render(this.scene, this.activeCamera);
        }
        if (this.activeCameraName === 'Submarine view' && this.periscopeHUD && this.periscopeHUD.enabled) {
            this.periscopeHUD.render();
        }

        // Continue render loop
        requestAnimationFrame(this.render.bind(this));
        this.lastCameraName = this.activeCameraName;
        this.stats.end();
    }

    /**
     * Enables or disables the depth of field effect.
     * @param {boolean} enabled - Whether to enable the depth of field effect.
     */
    setDepthOfFieldEnabled(enabled) {
        this.effectsEnabled.depthOfField = enabled;
    }

    /**
     * Sets the aperture parameter for depth of field effect.
     * @param {number} aperture - Aperture size (affects blur strength).
     */
    setDepthOfFieldAperture(aperture) {
        this.dofParameters.aperture = aperture;
        this.updateBokehParameters();
    }

    /**
     * Sets the focus distance for depth of field effect.
     * @param {number} focus - Focus distance in world units.
     */
    setDepthOfFieldFocus(focus) {
        this.dofParameters.focus = focus;
        this.updateBokehParameters();
    }

    /**
     * Sets the maximum blur amount for depth of field effect.
     * @param {number} maxblur - Maximum blur intensity.
     */
    setDepthOfFieldMaxBlur(maxblur) {
        this.dofParameters.maxblur = maxblur;
        this.updateBokehParameters();
    }

    /**
     * Enables or disables the periscope HUD display.
     * @param {boolean} enabled - Whether to enable the periscope HUD.
     */
    setPeriscopeHUDEnabled(enabled) {
        this.effectsEnabled.periscopeHUD = enabled;
        if (this.periscopeHUD) {
            this.periscopeHUD.setEnabled(enabled);
        }
    }

    /**
     * Toggles the submarine's shield effect on or off.
     * @param {boolean} active - Whether to activate the shield.
     */
    toggleSubmarineShield(active) {
        if (this.contents && this.contents.submarine) {
            this.contents.submarine.toggleShield(active);
        }
    }
}

export { MyApp };