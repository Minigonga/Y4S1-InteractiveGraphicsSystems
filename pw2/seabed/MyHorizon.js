
/**
 * MyHorizon
 * Represents the distant horizon as an inverted cylinder, optionally textured with a video.
 * Inherits from THREE.Group.
 */

import * as THREE from 'three';

class MyHorizon extends THREE.Group {
    /**
     * Constructs a new MyHorizon instance.
     * @param {number} radius - Radius of the horizon cylinder.
     * @param {number} segments - Number of segments for the cylinder geometry.
     * @param {number} height - Height of the cylinder.
     * @param {HTMLVideoElement|null} videoElement - Optional video element for video texture.
     */
    constructor(
        radius = 200,
        segments = 50,
        height = 150,
        videoElement = null
    ) {
        super();
        /**
         * Radius of the horizon cylinder.
         * @type {number}
         */
        this.radius = radius;
        /**
         * Number of segments for the cylinder geometry.
         * @type {number}
         */
        this.segments = segments;
        /**
         * Height of the cylinder.
         * @type {number}
         */
        this.height = height;
        /**
         * Optional video element for video texture.
         * @type {HTMLVideoElement|null}
         */
        this.videoElement = videoElement;
        this._createInvertedCylinder();
    }

    /**
     * Creates the inverted cylinder mesh for the horizon, with optional video texture.
     * Adds the mesh to this group.
     * @private
     */
    _createInvertedCylinder() {
        const geometry = new THREE.CylinderGeometry(
            this.radius,
            this.radius,
            this.height,
            this.segments,
            1,
            true
        );
        let material;
        if (this.videoElement) {
            const videoTexture = new THREE.VideoTexture(this.videoElement);
            videoTexture.minFilter = THREE.LinearFilter;
            videoTexture.magFilter = THREE.LinearFilter;
            videoTexture.format = THREE.RGBFormat;
            videoTexture.wrapS = THREE.RepeatWrapping;
            videoTexture.wrapT = THREE.RepeatWrapping;
            videoTexture.repeat.set(3, 1);
            material = new THREE.MeshBasicMaterial({
                color: 0x578E8B,
                map: videoTexture,
                side: THREE.BackSide
            });
        } else {
            material = new THREE.MeshBasicMaterial({
                color: 0x578E8B,
                side: THREE.BackSide,
                transparent: true,
                opacity: 0.8
            });
        }
        /**
         * The mesh representing the horizon cylinder.
         * @type {THREE.Mesh}
         */
        this.cylinder = new THREE.Mesh(geometry, material);
        this.cylinder.position.y = this.height / 2;
        this.add(this.cylinder);
    }
}

export { MyHorizon };
