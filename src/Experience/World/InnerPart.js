import * as THREE from 'three'
import Experience from '../Experience.js'

import vert from '../Shaders/InnerPart/vertex.glsl'
import frag from '../Shaders/InnerPart/fragment.glsl'

export default class InnerPart {
    container = new THREE.Object3D;

    constructor() {
        this.experience = new Experience()
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.camera = this.experience.camera
        this.renderer = this.experience.renderer.instance
        this.resources = this.experience.resources
        this.properties = this.experience.world.properties
        this.softBodyInner = this.experience.world.softBodyInner

    }

    preInit() {
    }

    init() {
        const material = new THREE.ShaderMaterial({
            uniforms: {},
            vertexShader: vert,
            fragmentShader: frag
        })

        this.mesh = new THREE.Mesh(this.softBodyInner.geometry, material)
        this.container.add(this.mesh)
    }

    resize(e, t) {

    }

    update(delta) {
    }

}
