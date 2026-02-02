
// MyTurtle.js
// Implements a stylized turtle model for the underwater scene.
// All classes and methods are documented for clarity and maintainability.

import * as THREE from 'three';


/**
 * MyTurtle
 * Stylized turtle model built from spheres and cylinders, with animated fins.
 * Used as a marine animal in the underwater scene.
 */
class MyTurtle extends THREE.Group {
    constructor() {
        super();
        
        this.modelRoot = new THREE.Group();
        this.add(this.modelRoot);
        
        // Materials for turtle body and shell
        this.turtleMaterial = new THREE.MeshPhongMaterial({
            color: "#307040", 
            specular: "#000000", 
            emissive: "#000000", 
            shininess: 90 
        })

        this.turtleShellMaterial = new THREE.MeshPhongMaterial({
            color: "#184623", 
            specular: "#000000", 
            emissive: "#000000", 
            shininess: 90 
        })

        // Build all turtle parts (body, head, shell, fins)
        this.turtleBase = new THREE.SphereGeometry(1,8,8,0,Math.PI*2,80 * Math.PI / 180, 100 * Math.PI / 180);
        this.turtleBaseMesh = new THREE.Mesh(this.turtleBase, this.turtleMaterial);
        this.turtleBaseMesh.scale.set(1.2,0.3, 0.8);
        this.modelRoot.add(this.turtleBaseMesh);

        this.turtleHead = new THREE.SphereGeometry(0.25,4,4);
        this.turtleHeadMesh = new THREE.Mesh(this.turtleHead, this.turtleMaterial);
        this.turtleHeadMesh.scale.set(1.2,0.9, 0.8);
        this.turtleHeadMesh.position.set(1.4, 0.2, 0);
        this.modelRoot.add(this.turtleHeadMesh);
        
        this.turtleShell = new THREE.SphereGeometry(1,8,8,0 , Math.PI*2, -30 * Math.PI / 180, 240 * Math.PI / 180);
        this.turtleShellMesh = new THREE.Mesh(this.turtleShell, this.turtleShellMaterial);
        this.turtleShellMesh.scale.set(1.3,0.3, 0.85);
        this.turtleShellMesh.position.set(0,0.15,0);
        this.modelRoot.add(this.turtleShellMesh);

                // big fin
        this.bigfin0 = new THREE.CylinderGeometry(0.2, 0.3, 0.5, 6);
        this.bigfin0Mesh = new THREE.Mesh(this.bigfin0, this.turtleShellMaterial);
        this.bigfin0Mesh.scale.set(1,1,0.3);
        this.bigfin0Mesh.position.set(0.67,-0.2,1.11);
        this.bigfin0Mesh.rotateX(Math.PI/1.5);

        this.bigfin1 = new THREE.CylinderGeometry(0.2, 0.3, 0.5, 6);
        this.bigfin1Mesh = new THREE.Mesh(this.bigfin1, this.turtleShellMaterial);
        this.bigfin1Mesh.scale.set(1,1,0.3);
        this.bigfin1Mesh.position.set(0.67,-0.2,-1.11);
        this.bigfin1Mesh.rotateX(-Math.PI/1.5);

        this.endfin0 = new THREE.CylinderGeometry(0.1,0.2,0.4,6);
        this.endfin0Mesh = new THREE.Mesh(this.endfin0, this.turtleShellMaterial);
        this.endfin0Mesh.scale.set(1,1,0.3);
        this.endfin0Mesh.position.set(0.67,0.45-Math.sin(Math.PI/1.5),1 - Math.cos(Math.PI/1.5));
        this.endfin0Mesh.rotateX(Math.PI/1.5);


        this.endfin1 = new THREE.CylinderGeometry(0.1,0.2,0.4,6);
        this.endfin1Mesh = new THREE.Mesh(this.endfin1, this.turtleShellMaterial);
        this.endfin1Mesh.scale.set(1,1,0.3);
        this.endfin1Mesh.position.set(0.67,0.45-Math.sin(Math.PI/1.5),-1 +Math.cos(Math.PI/1.5));
        this.endfin1Mesh.rotateX(-Math.PI/1.5);

        this.startfin0 = new THREE.CylinderGeometry(0.3,0.1,0.4,6);
        this.startfin0Mesh = new THREE.Mesh(this.startfin0, this.turtleShellMaterial);
        this.startfin0Mesh.scale.set(1,1,0.3);
        this.startfin0Mesh.position.set(0.67,-0.025,1.2 + Math.cos(Math.PI/1.5));
        this.startfin0Mesh.rotateX(Math.PI/1.7);


        this.startfin1 = new THREE.CylinderGeometry(0.3,0.1,0.4,6);
        this.startfin1Mesh = new THREE.Mesh(this.startfin1, this.turtleShellMaterial);
        this.startfin1Mesh.scale.set(1,1,0.3);
        this.startfin1Mesh.position.set(0.67,-0.025,-1.2 - Math.cos(Math.PI/1.5));
        this.startfin1Mesh.rotateX(-Math.PI/1.7);

        this.frontFinGroup0 = new THREE.Group();
        this.frontFinGroup0.add(this.bigfin0Mesh, this.startfin0Mesh, this.endfin0Mesh);
        this.modelRoot.add(this.frontFinGroup0);

        this.frontFinGroup1 = new THREE.Group();
        this.frontFinGroup1.add(this.bigfin1Mesh, this.startfin1Mesh, this.endfin1Mesh);
        this.modelRoot.add(this.frontFinGroup1);

        //small fin
        this.firstfin0 = new THREE.CylinderGeometry(0.2,0.1,0.4,6);
        this.firstfin0Mesh = new THREE.Mesh(this.firstfin0, this.turtleShellMaterial);
        this.firstfin0Mesh.scale.set(1,1,0.3);
        this.firstfin0Mesh.position.set(-1.3,-0.025,0.3);
        this.firstfin0Mesh.rotateX(Math.PI/1.7);
        this.firstfin0Mesh.rotateZ(Math.PI/2.8);
        this.modelRoot.add(this.firstfin0Mesh);

        this.firstfin1 = new THREE.CylinderGeometry(0.2,0.1,0.4,6);
        this.firstfin1Mesh = new THREE.Mesh(this.firstfin1, this.turtleShellMaterial);
        this.firstfin1Mesh.scale.set(1,1,0.3);
        this.firstfin1Mesh.position.set(-1.3,-0.025,-0.3);
        this.firstfin1Mesh.rotateX(-Math.PI/1.7);
        this.firstfin1Mesh.rotateZ(Math.PI/2.8);
        this.modelRoot.add(this.firstfin1Mesh);

        this.secondfin0 = new THREE.CylinderGeometry(0.15,0.2,0.6,6);
        this.secondfin0Mesh = new THREE.Mesh(this.secondfin0, this.turtleShellMaterial);
        this.secondfin0Mesh.scale.set(1,1,0.3);
        this.secondfin0Mesh.position.set(-1.75,-0.15,0.4);
        this.secondfin0Mesh.rotateX(Math.PI/1.7);
        this.secondfin0Mesh.rotateZ(Math.PI/2.2);
        this.secondfin0Mesh.rotateX(Math.PI/8)
        this.modelRoot.add(this.secondfin0Mesh);

        this.secondfin1 = new THREE.CylinderGeometry(0.15,0.2,0.6,6);
        this.secondfin1Mesh = new THREE.Mesh(this.secondfin1, this.turtleShellMaterial);
        this.secondfin1Mesh.scale.set(1,1,0.3);
        this.secondfin1Mesh.position.set(-1.75,-0.15,-0.4);
        this.secondfin1Mesh.rotateX(-Math.PI/1.7);
        this.secondfin1Mesh.rotateZ(Math.PI/2.2);
        this.secondfin1Mesh.rotateX(-Math.PI/8)
        this.modelRoot.add(this.secondfin1Mesh);

        this.backFinGroup0 = new THREE.Group();
        this.backFinGroup0.add(this.firstfin0Mesh, this.secondfin0Mesh);
        this.modelRoot.add(this.backFinGroup0);

        this.backFinGroup1 = new THREE.Group();
        this.backFinGroup1.add(this.firstfin1Mesh, this.secondfin1Mesh);
        this.modelRoot.add(this.backFinGroup1);

        this.traverse(child => {
            if (child !== this.shieldMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        // Rotate the whole turtle model so that its "forward"
        // axis matches the movement direction used by MyShoal.
        this.modelRoot.rotateY(Math.PI / 2);
    }

    /**
     * Animates the turtle's fins for swimming motion.
     * @param {number} delta - Time delta in seconds since last frame
     */
    animate(delta) {
        if (this.animationTime === undefined) {
            this.animationTime = 0;
        }
        
        this.animationTime += delta;
        const time = this.animationTime;
        
        this.frontFinGroup0.rotation.x = Math.sin(time * 3) * 0.1;
        this.frontFinGroup1.rotation.x = -Math.sin(time * 3) * 0.1;

        this.frontFinGroup0.rotation.y = -Math.sin(time * 3) * 0.1;
        this.frontFinGroup1.rotation.y = Math.sin(time * 3) * 0.1;

        this.frontFinGroup0.children.forEach(element => {
            element.rotation.y = -Math.PI/8 - Math.sin(time * 3.5) * 0.2;
        });

        this.frontFinGroup1.children.forEach(element => {
            element.rotation.y = Math.PI/8 + Math.sin(time * 3.5) * 0.2;
        });

        this.backFinGroup0.rotation.z = -Math.sin(time * 1.5) * 0.1;
        this.backFinGroup1.rotation.z = Math.sin(time * 1.5) * 0.1;
    }

    /**
     * Highlights or unhighlights the turtle when selected.
     * @param {boolean} selected
     */
    onSelect(selected) {
        const emissiveColor = selected ? 0xffaa00 : 0x000000;
        this.traverse(child => {
            if (child.isMesh && child.material) {
                const materials = Array.isArray(child.material)
                    ? child.material
                    : [child.material];

                materials.forEach(mat => {
                    if (mat.emissive) {
                        mat.emissive.setHex(emissiveColor);
                        mat.needsUpdate = true;
                    }
                });
            }
        });
    }
}

export { MyTurtle };
