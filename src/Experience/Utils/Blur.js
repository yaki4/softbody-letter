import * as THREE from 'three'
import Experience from '../Experience.js'
import gsap from "gsap";


import blur9VaryingVertexShader from '../Shaders/Blur/blur9VaryingVertexShader.glsl'
import blur9VaryingFragmentShader from '../Shaders/Blur/blur9VaryingFragmentShader.glsl'
import blur9FragmentShader from '../Shaders/Blur/blur9FragmentShader.glsl'

export default class Blur   {
    experience = new Experience()
    debug = this.experience.debug
    scene = this.experience.scene
    time = this.experience.time
    camera = this.experience.camera
    renderer = this.experience.renderer.instance
    resources = this.experience.resources
    fboHelper = this.experience.world.fboHelper

    material = null;

    getBlur9Material() {
        let e = this.fboHelper.MAX_VARYING_VECTORS > 8;
        return this.blur9Material || (this.blur9Material = new THREE.RawShaderMaterial({
            uniforms: {
                u_texture: {value: null},
                u_delta: {value: new THREE.Vector2}
            },
            vertexShader: e ? this.fboHelper.precisionPrefix + blur9VaryingVertexShader : this.fboHelper.vertexShader,
            fragmentShader: this.fboHelper.precisionPrefix + (e ? blur9VaryingFragmentShader : blur9FragmentShader),
            depthWrite: !1,
            depthTest: !1
        })), this.blur9Material
    }

    blur(e, t, i, n, r, a) {
        let l = .25, u = Math.ceil(i.width * t) || 0, c = Math.ceil(i.height * t) || 0;
        this.material || (this.material = this.getBlur9Material()), n || console.warn("You have to pass intermediateRenderTarget to blur"), (u !== n.width || c !== n.height) && n.setSize(u, c), r ? a || i !== r && r.setSize(i.width, i.height) : r = i, this.material.uniforms.u_texture.value = i.texture || i, this.material.uniforms.u_delta.value.set(e / u * l, 0), this.fboHelper.render(this.material, n), this.material.uniforms.u_texture.value = n.texture || n, this.material.uniforms.u_delta.value.set(0, e / c * l), this.fboHelper.render(this.material, r)
    }
}
