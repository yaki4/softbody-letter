import * as THREE from 'three'
import Experience from '../Experience.js'
import gsap from "gsap";

export default class Letter {
    constructor() {
        this.experience = new Experience()
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.camera = this.experience.camera
        this.renderer = this.experience.renderer.instance
        this.resources = this.experience.resources

        this.timeline = this.experience.timeline;


        //create cube
        //this.geometry = new THREE.BoxGeometry(1, 1, 1);
        this.geometry = this.resources.items.bufferTerrain;

        this.material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );
        this.cube = new THREE.Mesh( this.geometry, this.material );
        this.scene.add( this.cube );


    }

    animateTextPosition() {

    }

    resize() {

    }

    setDebug() {

    }

    update() {

    }
}
