import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MyApp } from './MyApp.js';
import { MyContents } from './MyContents.js';
import * as THREE from 'three';

/**
    This class customizes the gui interface for the app
*/
class MyGuiInterface  {

    /**
     * 
     * @param {MyApp} app The application object 
     */
    constructor(app) {
        this.app = app
        this.datgui =  new GUI();
        this.contents = null
    }

    /**
     * Set the contents object
     * @param {MyContents} contents the contents objects 
     */
    setContents(contents) {
        this.contents = contents
    }

    /**
     * Initialize the gui interface
     */
    init() {
        
        const data = {  
            'diffuse color': this.contents.diffusePlaneColor,
            'specular color': this.contents.specularPlaneColor,
        };

        const frameFolder = this.datgui.addFolder('Frame');

        // Wrap mode: ClampToEdge vs Repeat
        frameFolder.add({wrapMode: 'clamp'}, 'wrapMode', ['clamp', 'repeat'])
            .name("wrap mode")
            .onChange((value) => { this.contents.updateFrameWrapMode(value); });

        // Rotation in degrees (0–360)
        frameFolder.add({rotation: 0}, 'rotation', 0, 360)
            .name("rotation (deg)")
            .onChange((value) => { this.contents.updateFrameRotation(value); });

        frameFolder.open();

        // adds a folder to the gui interface for the camera
        const cameraFolder = this.datgui.addFolder('Camera')
        cameraFolder.add(this.app, 'activeCameraName', [ 'Perspective', 'Left', 'Right', 'Top', 'Front', 'Back' ] ).name("active camera");
        // note that we are using a property from the app 
        cameraFolder.add(this.app.activeCamera.position, 'x', 0, 10).name("x coord")
        cameraFolder.open()

        const lampFolder = this.datgui.addFolder('Lamp');
        lampFolder.add(this.contents, 'lampLightVisible').name("Lamp Light").onChange((value) => {
            this.contents.toggleLampLight(value);
        });
        lampFolder.open();

    }
}

export { MyGuiInterface };