import * as THREE from 'three'
import Experience from '../Experience.js'
import gsap from "gsap";

export default class PostEffect {
    sharedUniforms = {};
    enabled = true;
    material = null;
    renderOrder = 0;
    _hasShownWarning = false;

    constructor() {
        this.experience = new Experience()
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.camera = this.experience.camera
        this.renderer = this.experience.renderer.instance
        this.resources = this.experience.resources
        this.fboHelper = this.experience.fboHelper
        this.properties = this.experience.world.properties

    }

    init(e) {
        Object.assign(this, e)
    }

    needsRender() {
        return !0
    }

    warn(e) {
        this._hasShownWarning || (console.warn(e), this._hasShownWarning = !0)
    }

    setPostprocessing(e) {
    }

    render(e, t = !1) {
        this.material.uniforms.u_texture && (this.material.uniforms.u_texture.value = e.fromTexture), this.fboHelper.render(this.material, t ? null : e.toRenderTarget), e.swap()
    }

}
