import * as THREE from 'three'
import Experience from '../Experience.js'

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
        this.lightField = this.experience.world.lightField
        this.blueNoise = this.experience.world.blueNoise

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
            this.lightField.sharedUniforms,
            this.blueNoise.sharedUniforms),
            vertexShader: vert,
            fragmentShader: frag
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material)

        this.scene.add(this.mesh)
    }

    resize() {
        this.mesh.material.uniforms.u_resolution.value.x = this.sizes.width;
        this.mesh.material.uniforms.u_resolution.value.y = this.sizes.height;
    }

    setDebug() {

    }

    update(delta) {
        this.mesh && (this.mesh.material.uniforms.u_time.value += delta)
    }
}
