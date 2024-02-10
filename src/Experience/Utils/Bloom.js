import * as THREE from 'three'
import Experience from '../Experience.js'
import gsap from "gsap";

import MathUtils from './MathUtils.js'
const math = new MathUtils()

import PostEffect from '../Utils/PostEffect.js'

import convolutionSrcFrag from '../Shaders/Bloom/convolutionSrcFrag.glsl'
import highPassFrag from '../Shaders/Bloom/highPassFrag.glsl'
import fftFrag from '../Shaders/Bloom/fftFrag.glsl'
import convolutionMixFrag from '../Shaders/Bloom/convolutionMixFrag.glsl'
import convolutionCacheFrag from '../Shaders/Bloom/convolutionCacheFrag.glsl'
import convolutionFrag from '../Shaders/Bloom/convolutionFrag.glsl'
import blurFrag from '../Shaders/Bloom/blurFrag.glsl'
import frag from '../Shaders/Bloom/frag.glsl'


export default class Bloom extends PostEffect   {
    experience = new Experience()
    debug = this.experience.debug
    scene = this.experience.scene
    time = this.experience.time
    camera = this.experience.camera
    renderer = this.experience.renderer.instance
    resources = this.experience.resources
    fboHelper = this.experience.world.fboHelper
    properties = this.experience.world.properties

    ITERATION = 5;
    USE_CONVOLUTION = !1;
    USE_HD = !0;
    USE_LENS_DIRT = !1;
    amount = 1;
    radius = 0;
    threshold = .1;
    smoothWidth = 1;
    haloWidth = .8;
    haloRGBShift = .03;
    haloStrength = .21;
    haloMaskInner = .3;
    haloMaskOuter = .5;
    highPassMaterial;
    highPassRenderTarget;
    fftMaterial;
    srcMaterial;
    convolutionSrcFrag = convolutionSrcFrag;
    srcSize = 256;
    srcRT;
    fftCacheRT1;
    fftCacheRT2;
    fftSrcRT;
    fftBloomOutCacheMaterial;
    fftBloomOutCacheRT;
    convolutionMixMaterial;
    convolutionMixDownScale = 1;
    convolutionBuffer = .1;
    renderTargetsHorizontal = [];
    renderTargetsVertical = [];
    blurMaterials = [];
    directionX = new THREE.Vector2(1, 0);
    directionY = new THREE.Vector2(0, 1);

    init(e) {
        Object.assign(this, e), super.init();
        let t = this.USE_HD ? THREE.HalfFloatType : !1;
        if (this.highPassRenderTarget = this.fboHelper.createRenderTarget(1, 1, !this.USE_HD, t), this.highPassMaterial = this.fboHelper.createRawShaderMaterial({
            uniforms: {
                u_texture: {value: null},
                u_luminosityThreshold: {value: 1},
                u_smoothWidth: {value: 1},
                u_haloWidth: {value: 1},
                u_haloRGBShift: {value: 1},
                u_haloStrength: {value: 1},
                u_haloMaskInner: {value: 1},
                u_haloMaskOuter: {value: 1},
                u_texelSize: null,
                u_aspect: {value: new THREE.Vector2},
                u_dirtTexture: {value: null},
                u_dirtAspect: {value: new THREE.Vector2}
            }, fragmentShader: highPassFrag
        }), this.highPassMaterial.defines.USE_LENS_DIRT = this.USE_LENS_DIRT, this.USE_CONVOLUTION) this.highPassMaterial.defines.USE_CONVOLUTION = !0, this.highPassMaterial.uniforms.u_convolutionBuffer = {value: .15}, this.fftSrcRT = this.fboHelper.createRenderTarget(1, 1, !0, t), this.fftCacheRT1 = this.fboHelper.createRenderTarget(1, 1, !0, t), this.fftCacheRT2 = this.fftCacheRT1.clone(), this.fftBloomOutCacheRT = this.fboHelper.createRenderTarget(1, 1), this.srcMaterial = this.fboHelper.createRawShaderMaterial({
            uniforms: {u_aspect: {value: new THREE.Vector2}},
            fragmentShader: this.convolutionSrcFrag
        }), this.fftMaterial = this.fboHelper.createRawShaderMaterial({
            uniforms: {
                u_texture: {value: null},
                u_texelSize: {value: new THREE.Vector2},
                u_subtransformSize: {value: 0},
                u_normalization: {value: 0},
                u_isHorizontal: {value: 0},
                u_isForward: {value: 0}
            }, fragmentShader: fftFrag
        }), this.convolutionMixMaterial = this.fboHelper.createRawShaderMaterial({
            uniforms: {
                u_texture: {value: null},
                u_kernelTexture: {value: this.fftSrcRT.texture}
            }, fragmentShader: convolutionMixFrag
        }), this.fftBloomOutCacheMaterial = this.fboHelper.createRawShaderMaterial({
            uniforms: {
                u_texture: {value: null},
                u_amount: {value: 0}
            }, fragmentShader: convolutionCacheFrag
        }), this.material = this.fboHelper.createRawShaderMaterial({
            uniforms: {
                u_texture: {value: null},
                u_bloomTexture: {value: this.fftBloomOutCacheRT.texture},
                u_convolutionBuffer: this.highPassMaterial.uniforms.u_convolutionBuffer
            }, fragmentShader: convolutionFrag, blending: THREE.NoBlending
        }); else {
            for (let i = 0; i < this.ITERATION; i++) {
                this.renderTargetsHorizontal.push(this.fboHelper.createRenderTarget(1, 1, !1, t)), this.renderTargetsVertical.push(this.fboHelper.createRenderTarget(1, 1, !1, t));
                const n = 3 + i * 2;
                this.blurMaterials[i] = this.fboHelper.createRawShaderMaterial({
                    uniforms: {
                        u_texture: { value: null },
                        u_resolution: { value: new THREE.Vector2 },
                        u_direction: { value: null }
                    }, fragmentShader: blurFrag, defines: {KERNEL_RADIUS: n, SIGMA: n}
                })
            }
            this.material = this.fboHelper.createRawShaderMaterial({
                uniforms: {
                    u_texture: {value: null},
                    u_bloomStrength: {value: 1},
                    u_bloomWeights: {value: []}
                }, fragmentShader: frag, blending: THREE.NoBlending, defines: {ITERATION: this.ITERATION}
            });
            for (let i = 0; i < this.ITERATION; i++) this.material.uniforms["u_blurTexture" + i] = {value: this.renderTargetsVertical[i].texture}
        }
    }

    setDirtTexture(e) {
        this.highPassMaterial.uniforms.u_dirtTexture.value = e
    }

    setPostprocessing(e) {
        const t = e.width, i = e.height;
        if (this.USE_CONVOLUTION) {
            let n = math.powerTwoCeiling(t / 2) >> this.convolutionMixDownScale,
                r = math.powerTwoCeiling(i / 2) >> this.convolutionMixDownScale;
            if (this.highPassRenderTarget.setSize(n, r), n !== this.fftCacheRT1.width || r !== this.fftCacheRT1.height) {
                this.fftSrcRT.setSize(n, r), this.fftCacheRT1.setSize(n, r), this.fftCacheRT2.setSize(n, r), this.fftBloomOutCacheRT.setSize(n, r);
                let a = i / Math.max(t, i);
                this.srcMaterial.uniforms.u_aspect.value.set(t / i * a, a), this.fboHelper.render(this.srcMaterial, this.fftCacheRT1), this.renderFFT(this.fftCacheRT1, this.fftSrcRT, !0)
            }
        } else {
            let n = Math.ceil(t / 2), r = Math.ceil(i / 2);
            this.highPassRenderTarget.setSize(n, r), super.setPostprocessing(e);
            for (let a = 0; a < this.ITERATION; a++) this.renderTargetsHorizontal[a].setSize(n, r), this.renderTargetsVertical[a].setSize(n, r), this.blurMaterials[a].uniforms.u_resolution.value.set(n, r), n = Math.ceil(n / 2), r = Math.ceil(r / 2)
        }
    }

    dispose() {
        if (!this.USE_CONVOLUTION) {
            this.highPassRenderTarget && this.highPassRenderTarget.dispose();
            for (let e = 0; e < this.ITERATION; e++) this.renderTargetsHorizontal[e] && this.renderTargetsHorizontal[e].dispose(), this.renderTargetsVertical[e] && this.renderTargetsVertical[e].dispose()
        }
    }

    needsRender() {
        return !!this.amount
    }

    renderFFT(e, t, i) {
        let n = e.width, r = e.height, a = Math.round(Math.log(n) / Math.log(2)),
            l = Math.round(Math.log(r) / Math.log(2)), u = a + l, c = u % 2 === 0, f = this.fftMaterial, p = f.uniforms;
        for (let _ = 0; _ < u; _++) {
            let v = _ < a;
            p.u_texture.value = e.texture, p.u_normalization.value = _ === 0 ? 1 / Math.sqrt(n * r) : 1, p.u_isHorizontal.value = !!v, p.u_isForward.value = !!i, p.u_texelSize.value.set(1 / n, 1 / r), p.u_subtransformSize.value = Math.pow(2, (v ? _ : _ - a) + 1), this.fboHelper.render(f, t);
            let S = e;
            e = t, t = S
        }
        c && this.fboHelper.copy(e.texture, t)
    }

    render(e, t = !1) {
        let i = this.properties.postprocessing.width, n = this.properties.postprocessing.height;
        this.highPassMaterial.uniforms.u_texture.value = e.fromTexture, this.highPassMaterial.uniforms.u_luminosityThreshold.value = this.threshold, this.highPassMaterial.uniforms.u_smoothWidth.value = this.smoothWidth, this.highPassMaterial.uniforms.u_haloWidth.value = this.haloWidth, this.highPassMaterial.uniforms.u_haloRGBShift.value = this.haloRGBShift * i, this.highPassMaterial.uniforms.u_haloStrength.value = this.haloStrength, this.highPassMaterial.uniforms.u_haloMaskInner.value = this.haloMaskInner, this.highPassMaterial.uniforms.u_haloMaskOuter.value = this.haloMaskOuter, this.highPassMaterial.uniforms.u_texelSize = e.sharedUniforms.u_texelSize, this.highPassMaterial.uniforms.u_aspect = e.sharedUniforms.u_aspect;
        let r = this.haloStrength > 0, a = n / Math.sqrt(i * i + n * n) * 2;
        if (this.highPassMaterial.uniforms.u_aspect.value.set(i / n * a, a), a = n / Math.max(i, n), this.highPassMaterial.uniforms.u_dirtAspect.value.set(i / n * a, a), this.highPassMaterial.defines.USE_HALO !== r && (this.highPassMaterial.defines.USE_HALO = r, this.highPassMaterial.needsUpdate = !0), this.USE_CONVOLUTION && (this.highPassMaterial.uniforms.u_convolutionBuffer.value = this.convolutionBuffer), e.renderMaterial(this.highPassMaterial, this.highPassRenderTarget), this.USE_CONVOLUTION) {
            this.fboHelper.copy(this.highPassRenderTarget.texture, this.fftCacheRT1), this.renderFFT(this.fftCacheRT1, this.fftCacheRT2, !0), this.convolutionMixMaterial.uniforms.u_texture.value = this.fftCacheRT2.texture, this.fboHelper.render(this.convolutionMixMaterial, this.fftCacheRT1), this.renderFFT(this.fftCacheRT1, this.fftCacheRT2, !1);
            let l = this.amount * 1024;
            l /= Math.pow(math.powerTwoCeilingBase(this.fftCacheRT1.width * this.fftCacheRT1.height), 4), this.fftBloomOutCacheMaterial.uniforms.u_amount.value = l, this.fftBloomOutCacheMaterial.uniforms.u_texture.value = this.fftCacheRT2.texture, e.renderMaterial(this.fftBloomOutCacheMaterial, this.fftBloomOutCacheRT), super.render(e, t)
        } else {
            let l = this.highPassRenderTarget;
            for (let u = 0; u < this.ITERATION; u++) {
                const c = this.blurMaterials[u];
                c.uniforms.u_texture.value = l.texture, c.uniforms.u_direction.value = this.directionX, e.renderMaterial(c, this.renderTargetsHorizontal[u]), c.uniforms.u_texture.value = this.renderTargetsHorizontal[u].texture, c.uniforms.u_direction.value = this.directionY, e.renderMaterial(c, this.renderTargetsVertical[u]), l = this.renderTargetsVertical[u]
            }
            this.material.uniforms.u_texture.value = e.fromTexture;
            for (let u = 0; u < this.ITERATION; u++) {
                const c = (this.ITERATION - u) / this.ITERATION;
                this.material.uniforms.u_bloomWeights.value[u] = this.amount * (c + (1.2 - c * 2) * this.radius) / Math.pow(2, this.ITERATION - u - 1)
            }
            super.render(e, t)
        }
    }
}
