import * as THREE from 'three'
import Experience from '../Experience.js'
import gsap from "gsap";

import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { ConvexHull } from 'three/addons/math/ConvexHull.js';

function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

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
        //this.geometry = this.resources.items.bufferParticlesLD;
        this.geometrySplines = this.resources.items.bufferSplines;
        //this.geometry = this.resources.items.bufferTets;
        this.geometryInner = this.resources.items.bufferSolid;
        this.geometry = this.resources.items.bufferPoints;
        // this.geometry.deleteAttribute('bary')
        // this.geometry.deleteAttribute('tet')
        //this.geometry.deleteAttribute('dist')

        console.log(this.geometryInner)


        //this.material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );
        this.material = new THREE.MeshStandardMaterial( {
            color: 0x00ff00,
            roughness: 0.5,
            metalness: 0.5

        })
        this.cube = new THREE.Mesh( this.geometry, this.material );
        //this.scene.add( this.cube );

        // let exporter = new GLTFExporter();
        // exporter.parse( this.cube, function ( gltf ) {
        //     console.log(gltf)
        // } );

        // add directional light
        this.light = new THREE.DirectionalLight( 0xffffff, 1 );
        this.light.position.set( 0, 0, 1 );
        this.scene.add( this.light );


        // this.defaultPosition = this.resources.items.bufferPoints.attributes.position.array.slice();
        // this.positions = this.resources.items.bufferPoints.attributes.position.array;
        // this.innerPositions = this.geometryInner.attributes.position.array;
        //this.innerPositions = this.geometrySplines.attributes.position.array;


        this.points = new THREE.Points( this.geometry, new THREE.PointsMaterial( {
            color: 0xff0000,
            size: 0.005
        } ));
        this.scene.add( this.points );

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
