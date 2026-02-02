import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MyTable } from './MyTable.js';
import { MyLamp } from './MyLamp.js';
import { MyChair } from './MyChair.js';
import { MyBookshelf } from './MyBookshelf.js';
import { MyFrame } from './MyFrame.js';
import { MyBook } from './MyBook.js';
import { MyClosedBook } from './MyClosedBook.js';
import { MyCandle } from './MyCandle.js';
import { MyDoor } from './MyDoor.js';

/**
 *  This class contains the contents of out application
 */
class MyContents  {

    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app
        this.axis = null
        this.table = null
        this.lamp = null
        this.chair = null
        this.frame = null
        this.book1 = null
        this.book2 = null
        // box related attributes
        this.boxMesh = null
        this.boxMeshSize = 1.0
        this.boxEnabled = true
        this.lastBoxEnabled = null
        this.boxDisplacement = new THREE.Vector3(0,2,0)
    
        // plane related attributes
        this.diffusePlaneColor = "#fbbb83"
        this.specularPlaneColor = "#777777"
        this.planeShininess = 30
        
        const textureLoader = new THREE.TextureLoader();
        const floorTexture = textureLoader.load('./textures/floor.png');

        floorTexture.wrapS = THREE.RepeatWrapping;
        floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set(5, 5);

        this.planeMaterial = new THREE.MeshPhongMaterial({
            map: floorTexture,
            specular: "#777777",
            emissive: "#000000",
            shininess: 30
        });

        const woodTexture = textureLoader.load('./textures/wood_text.jpg');
        this.woodMaterial = new THREE.MeshPhongMaterial({
            map: woodTexture,
            color: 0xaaaaaa
        });

        const wallTexture = textureLoader.load('./textures/wall.jpg');
        wallTexture.wrapS = THREE.MirroredRepeatWrapping;
        wallTexture.wrapT = THREE.MirroredRepeatWrapping;
        wallTexture.repeat.set(5, 5);

        this.mirroredMaterial = new THREE.MeshPhongMaterial({
            map: wallTexture,
            color: 0xffffff,
            specular: "#222222",
            shininess: 50
        });

        this.axisVisible = false
        this.lampLightVisible = true

    }

    buildFloorFrames() {
        if (!this.app) return;
        
        const frameThickness = 0.1;
        const frameHeight = frameThickness;
        const frameLength = 10;

        // Front frame
        const frontFrame = new THREE.Mesh(
            new THREE.BoxGeometry(frameLength, frameHeight, frameThickness),
            this.woodMaterial
        );
        frontFrame.position.set(0, frameHeight / 2, -5);
        this.app.scene.add(frontFrame);

        // Back frame
        const backFrame1 = new THREE.Mesh(
            new THREE.BoxGeometry(1, frameHeight, frameThickness),
            this.woodMaterial
        );
        backFrame1.position.set(4.5, frameHeight / 2, 5);
        this.app.scene.add(backFrame1);

        const backFrame2 = new THREE.Mesh(
            new THREE.BoxGeometry(7, frameHeight, frameThickness),
            this.woodMaterial
        );
        backFrame2.position.set(-1.5, frameHeight / 2, 5);
        this.app.scene.add(backFrame2);

        // Left frame
        const leftFrame = new THREE.Mesh(
            new THREE.BoxGeometry(frameThickness, frameHeight, frameLength),
            this.woodMaterial
        );
        leftFrame.position.set(-5, frameHeight / 2, 0);
        this.app.scene.add(leftFrame);

        // Right frame
        const rightFrame = new THREE.Mesh(
            new THREE.BoxGeometry(frameThickness, frameHeight, frameLength),
            this.woodMaterial
        );
        rightFrame.position.set(5, frameHeight / 2, 0);
        this.app.scene.add(rightFrame);
    }
    /**
     * builds the box mesh with material assigned
     */
    buildBox() {    
        let boxMaterial = new THREE.MeshPhongMaterial({ color: "#ffff77", 
        specular: "#000000", emissive: "#000000", shininess: 90 })

        let box = new THREE.BoxGeometry(  this.boxMeshSize,  this.boxMeshSize,  this.boxMeshSize );
        this.boxMesh = new THREE.Mesh( box, boxMaterial );
        this.boxMesh.position.y = this.boxDisplacement.y;
        this.boxMesh.rotateX(Math.PI / 6);
        this.boxMesh.rotateX(Math.PI / 6);
        this.boxMesh.scale.set(3, 2, 1);
    }

    buildWindow() {
        const textureLoader = new THREE.TextureLoader();
        const windowTexture = textureLoader.load('./textures/wf_landscape.png');
        let windowGeo = new THREE.PlaneGeometry(5, 3);
        let windowMat = new THREE.MeshBasicMaterial({ 
            map: windowTexture, 
            color: 0xAAAAAA
        });
        let windowMesh = new THREE.Mesh(windowGeo, windowMat);
        windowMesh.position.set(0, 5, -4.99);
        this.app.scene.add(windowMesh);

        const lampLight = new THREE.SpotLight(0x4a6fa5);
        lampLight.position.set(0, 7, -8);
        lampLight.intensity = 100;
        lampLight.distance = 20;
        lampLight.penumbra = 1;
        lampLight.angle = Math.PI / 5;
        lampLight.target.position.set(0, 0, 3);
        let lampLightHelper = new THREE.SpotLightHelper(lampLight);
        this.app.scene.add(lampLight);

    }

    buildWalls() {

        let wall1 = new THREE.PlaneGeometry( 10, 10 );
        let wallMesh1 = new THREE.Mesh( wall1, this.mirroredMaterial );
        wallMesh1.position.set(0, 5, -5);
        this.app.scene.add( wallMesh1 );

        let wall2 = new THREE.PlaneGeometry( 10, 10 );
        let wallMesh2 = new THREE.Mesh( wall2, this.mirroredMaterial );
        wallMesh2.position.set(-5, 5, 0);
        wallMesh2.rotateY(Math.PI / 2);
        this.app.scene.add( wallMesh2 ); 

        this.wall3 = new THREE.PlaneGeometry( 10, 10 );
        let wallMesh3 = new THREE.Mesh( this.wall3, this.mirroredMaterial );
        wallMesh3.position.set(5, 5, 0);
        wallMesh3.rotateY(-Math.PI / 2);
        this.app.scene.add( wallMesh3 );

        let wall4 = new THREE.PlaneGeometry( 10, 10 );
        let wallMesh4 = new THREE.Mesh( wall4, this.mirroredMaterial );
        wallMesh4.position.set(0, 5, 5);
        wallMesh4.rotateY(Math.PI);
        this.app.scene.add( wallMesh4 );
    }

    /**
     * initializes the contents
     */
    init() {
       
        // create once 
        if (this.axis === null) {
            this.axis = new MyAxis(this);
            this.app.scene.add(this.axis);
        }
        this.axis.visible = this.axisVisible;
        
        this.buildFloorFrames();


        // add an ambient light
        const ambientLight = new THREE.AmbientLight( 0x555555);
        this.app.scene.add( ambientLight );


        this.buildWalls();
        this.buildWindow();

        this.door = new MyDoor();
        this.door.position.set(3, 0, 5);
        this.door.scale.set(2.5, 2.5, 2.5);
        this.door.rotateY(Math.PI);
        this.app.scene.add(this.door);

        this.table = new MyTable();
        this.table.position.set(0, 0, 0);
        this.app.scene.add(this.table);
        
        this.bookshelf = new MyBookshelf();
        this.bookshelf.position.set(-1.2, 0, 3);
        this.bookshelf.rotateY(Math.PI / 2);
        this.bookshelf.scale.set(1.2, 1.2, 1.2);
        this.app.scene.add(this.bookshelf);

        this.lamp = new MyLamp();
        this.lamp.position.set(-1, 2.15, 0.5);
        this.app.scene.add(this.lamp);

        this.chair = new MyChair();
        this.app.scene.add(this.chair);

        this.candle = new MyCandle();
        this.candle.position.set(4.5, 4, -2.5);
        this.app.scene.add(this.candle);
        this.candle.candleLight.visible = this.candleLightVisible;

        this.book = new MyBook();
        this.book.position.set(1.2, 2.15, 0.4);
        this.book.rotateX(-Math.PI / 2);
        this.book.rotateZ(Math.PI / 2.2);
        this.book.scale.set(0.7, 0.7, 0.7);
        this.app.scene.add(this.book);

        this.frame = new MyFrame();
        this.frame.position.set(4.95, 5, 0);
        this.app.scene.add(this.frame);
        
        // Livro 1 (azul, terceira parteleira)
        this.book1 = new MyClosedBook( {
            coverColor: 0x2a3b4c,
            pagesColor: 0xf5f5dc,
            width: 0.80,
            height: 0.9,
            thickness: 0.4
        });
        this.book1.position.set(-4.3, 3.13, 3.94);
        this.book1.rotateY(Math.PI);
        this.app.scene.add(this.book1);

        // Livro 2 (vermelho, terceira parteleira)
        this.book2 = new MyClosedBook( {
            coverColor: 0x8b0000,
            pagesColor: 0xffffff,
            width: 1,
            height: 1,
            thickness: 0.5
        });
        this.book2.position.set(-4.2, 3.13, 4.4);
        this.book2.rotateY(Math.PI); 
        this.app.scene.add(this.book2);

        // Livro 3 (roxo, terceira parteleira)
        this.book3 = new MyClosedBook( {
            coverColor: 0x8b009A,
            pagesColor: 0xffffff,
            width: 0.7,
            height: 0.8,
            thickness: 0.2
        });
        this.book3.position.set(-4.2, 3.15, 1.59);
        this.book3.rotateY(Math.PI);
        this.book3.rotateX(Math.PI / 14);
        this.app.scene.add(this.book3);

        // Livro 4 (amarelo, segunda parteleira)
        this.book4 = new MyClosedBook( {
            coverColor: 0xCbC400,
            pagesColor: 0xffffff,
            width: 0.6,
            height: 0.8,
            thickness: 0.2
        });
        this.book4.position.set(-4.2, 1.79, 2.4);
        this.book4.rotateY(Math.PI);
        this.book4.rotateX(Math.PI / 2);
        this.app.scene.add(this.book4);

        // Create a Plane Mesh with basic material
        let plane = new THREE.PlaneGeometry( 10, 10 );
        this.planeMesh = new THREE.Mesh( plane, this.planeMaterial );
        this.planeMesh.rotation.x = -Math.PI / 2;
        this.planeMesh.position.y = -0;
        this.app.scene.add( this.planeMesh );
    }
    
    /**
     * updates the diffuse plane color and the material
     * @param {THREE.Color} value 
     */
    updateDiffusePlaneColor(value) {
        this.diffusePlaneColor = value
        this.planeMaterial.color.set(this.diffusePlaneColor)
    }
    /**
     * updates the specular plane color and the material
     * @param {THREE.Color} value 
     */
    updateSpecularPlaneColor(value) {
        this.specularPlaneColor = value
        this.planeMaterial.specular.set(this.specularPlaneColor)
    }
    /**
     * updates the plane shininess and the material
     * @param {number} value 
     */
    updatePlaneShininess(value) {
        this.planeShininess = value
        this.planeMaterial.shininess = this.planeShininess
    }
    
    /**
     * rebuilds the box mesh if required
     * this method is called from the gui interface
     */
    rebuildBox() {
        // remove boxMesh if exists
        if (this.boxMesh !== undefined && this.boxMesh !== null) {  
            this.app.scene.remove(this.boxMesh)
        }
        this.buildBox();
        this.lastBoxEnabled = null
    }
    
    /**
     * updates the box mesh if required
     * this method is called from the render method of the app
     * updates are trigered by boxEnabled property changes
     */
    updateBoxIfRequired() {
        if (this.boxEnabled !== this.lastBoxEnabled) {
            this.lastBoxEnabled = this.boxEnabled
            if (this.boxEnabled) {
                this.app.scene.add(this.boxMesh)
            }
            else {
                this.app.scene.remove(this.boxMesh)
            }
        }
    }

    /**
     * updates the contents
     * this method is called from the render method of the app
     * 
     */
    update() {
        // check if box mesh needs to be updated
        /* this.updateBoxIfRequired()

        // sets the box mesh position based on the displacement vector
        this.boxMesh.position.x = this.boxDisplacement.x
        this.boxMesh.position.y = this.boxDisplacement.y
        this.boxMesh.position.z = this.boxDisplacement.z */

        if (this.spotLight && this.spotLightHelper) {
            this.spotLight.target.updateMatrixWorld();
            this.spotLightHelper.update();
        }
        
    }
    updateFrameWrapMode(mode) {
        if (this.frame) {
            this.frame.setWrapMode(mode);
        }
    }

    updateFrameRotation(degrees) {
        if (this.frame) {
            this.frame.rotateTexture(THREE.MathUtils.degToRad(degrees));
        }
    }

    toggleLampLight(value) {
        if (this.lamp) {
            this.lamp.lampLight.visible = value;

            this.lamp.lampBulbMesh.material.color.set(value ? 0xffff00 : 0x333333);
        }
    }
}

export { MyContents };