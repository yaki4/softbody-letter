import * as THREE from 'three'
import Experience from '../Experience.js'
import gsap from "gsap";

import vert from '../Shaders/Terrain/vertex.glsl'
import frag from '../Shaders/Terrain/fragment.glsl'

export default class Terrain {

    constructor() {
        this.experience = new Experience()
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.camera = this.experience.camera
        this.renderer = this.experience.renderer.instance
        this.resources = this.experience.resources
        this.sizes = this.experience.sizes

        this.timeline = this.experience.timeline;


        this.init()
    }

    init() {

        this.texture = this.resources.items.bakeTerrain;
        this.geometry = this.resources.items.bufferTerrain;

        this.material = new THREE.ShaderMaterial({
            uniforms: Object.assign({
                u_texture: new THREE.Uniform(this.texture),
                u_time: new THREE.Uniform(0),
                u_resolution: new THREE.Uniform(new THREE.Vector2(this.sizes.width, this.sizes.height)),
            },
            // lightField.sharedUniforms,
            // blueNoise.sharedUniforms),
                {}),
            vertexShader: vert,
            fragmentShader: frag
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material)

        this.scene.add(this.mesh)



        // //create cube
        // //this.geometry = new THREE.BoxGeometry(1, 1, 1);
        // this.geometry = this.resources.items.bufferTerrain;
        //
        // this.material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        // this.cube = new THREE.Mesh(this.geometry, this.material);
        // this.scene.add(this.cube);
    }

    resize() {

    }

    setDebug() {

    }

    update() {
        this.mesh && (this.mesh.material.uniforms.u_time.value += this.time.delta)
    }
}
