import * as THREE from 'three'
import Experience from '../Experience.js'
import gsap from "gsap";
import MathUtils from './MathUtils.js'
const math = new MathUtils()
import PostEffect from '../Utils/PostEffect.js'
import transitionFragmentShader from '../Shaders/Final/transitionFragmentShader.glsl'
import fragmentShader from '../Shaders/Final/fragmentShader.glsl'

export default class Final extends PostEffect   {
    experience = new Experience()
    debug = this.experience.debug
    scene = this.experience.scene
    time = this.experience.time
    camera = this.experience.camera
    renderer = this.experience.renderer.instance
    resources = this.experience.resources
    fboHelper = this.experience.world.fboHelper
    blueNoise = this.experience.world.blueNoise
    blurClass = this.experience.world.blur
    properties = this.experience.world.properties

    vignetteFrom = .6;
    vignetteTo = 1.6;
    vignetteAspect = new THREE.Vector2;
    vignetteColor = new THREE.Color;
    saturation = 1;
    contrast = 0;
    brightness = 1;
    tintColor = new THREE.Color;
    tintOpacity = 1;
    bgColor = new THREE.Color;
    opacity = 1;
    transitionRatio = 1;
    cacheRenderTarget = null;
    sceneBlurRT = null;
    blur = 0;

    init(e) {
        this.properties.final = this

        Object.assign(this, e), super.init(), this.sceneBlurRT = this.fboHelper.createRenderTarget(1, 1), this.material = this.fboHelper.createRawShaderMaterial({
            uniforms: {
                u_texture: {value: null},
                u_vignetteFrom: {value: 0},
                u_vignetteTo: {value: 0},
                u_vignetteAspect: {value: this.vignetteAspect},
                u_vignetteColor: {value: this.vignetteColor},
                u_saturation: {value: 0},
                u_contrast: {value: 0},
                u_brightness: {value: 0},
                u_tintColor: {value: this.tintColor},
                u_tintOpacity: {value: 0},
                u_bgColor: {value: this.bgColor},
                u_opacity: {value: 0},
                u_ditherSeed: {value: 0},
                u_blurFactor: {value: 0},
                u_showRatio: {value: 0}
            }, fragmentShader
        }), this.cacheRenderTarget = this.fboHelper.createRenderTarget(1, 1), this.transitionMaterial = this.fboHelper.createRawShaderMaterial({
            uniforms: Object.assign({
                u_texture: {value: null},
                u_cacheTexture: {value: this.cacheRenderTarget.texture},
                u_transitionRatio: {value: 0},
                u_aspect: {value: new THREE.Vector2}
            }, this.blueNoise.sharedUniforms), fragmentShader: transitionFragmentShader
        })
    }

    startTransition(e) {
        let t = e.width, i = e.height;
        this.cacheRenderTarget.setSize(t, i), this.fboHelper.copy(e.fromRenderTarget.texture, this.cacheRenderTarget), e.swap(), this.transitionRatio = 0
    }

    render(e, t = !1) {
        const i = e.width, n = e.height;
        let r = this.material.uniforms;
        r.u_vignetteFrom.value = this.vignetteFrom, r.u_vignetteTo.value = this.vignetteTo;
        const a = n / Math.sqrt(i * i + n * n);
        this.vignetteAspect.set(i / n * a, a), r.u_saturation.value = this.saturation - 1, r.u_contrast.value = this.contrast, r.u_brightness.value = this.brightness - 1, r.u_tintOpacity.value = this.tintOpacity, r.u_opacity.value = this.opacity, r.u_ditherSeed.value = Math.random() * 1e3;
        let l = this.transitionRatio, u = l < 1;
        this.blur = this.material.uniforms.u_blurFactor.value = math.fit(this.properties.waitlistSectionRatio, 0, .5, 0, 1), this.blur > 0 && (this.blurClass.blur(16 * this.blur, 1, e.fromRenderTarget, this.sceneBlurRT), this.blurClass.blur(8 * this.blur, 1, e.fromRenderTarget, this.sceneBlurRT), this.blurClass.blur(4 * this.blur, 1, e.fromRenderTarget, this.sceneBlurRT)), this.material.uniforms.u_texture.value = e.fromTexture, u ? (e.renderMaterial(this.material, e.toRenderTarget), e.swap(), this.transitionMaterial.uniforms.u_texture.value = e.fromTexture, this.transitionMaterial.uniforms.u_transitionRatio.value = l, this.transitionMaterial.uniforms.u_aspect.value.copy(this.vignetteAspect), e.renderMaterial(this.transitionMaterial, t ? null : e.toRenderTarget)) : (e.renderMaterial(this.material, t ? null : e.toRenderTarget), e.swap())
    }

}
