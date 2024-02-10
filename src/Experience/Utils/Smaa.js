import * as THREE from 'three'
import Experience from '../Experience.js'
import gsap from "gsap";
import PostEffect from '../Utils/PostEffect.js'

import smaaEdgesVert from '../Shaders/Smaa/smaaEdgesVert.glsl'
import smaaEdgesFrag from '../Shaders/Smaa/smaaEdgesFrag.glsl'

import smaaWeightsVert from '../Shaders/Smaa/smaaWeightsVert.glsl'
import smaaWeightsFrag from '../Shaders/Smaa/smaaWeightsFrag.glsl'

import smaaBlendVert from '../Shaders/Smaa/smaaBlendVert.glsl'
import smaaBlendFrag from '../Shaders/Smaa/smaaBlendFrag.glsl'

export default class Smaa extends PostEffect   {
    experience = new Experience()
    debug = this.experience.debug
    scene = this.experience.scene
    time = this.experience.time
    camera = this.experience.camera
    renderer = this.experience.renderer.instance
    resources = this.experience.resources
    fboHelper = this.experience.world.fboHelper

    edgesRenderTarget = null;
    weightsRenderTarget = null;
    edgesMaterial = null;
    weightsMaterial = null;

    init(e) {
        Object.assign(this, {
            sharedUniforms: {
                u_areaTexture: { value: null },
                u_searchTexture: { value: null }
            }
        }, e), super.init(), this.weightsRenderTarget = this.fboHelper.createRenderTarget(1, 1), this.edgesRenderTarget = this.fboHelper.createRenderTarget(1, 1), this.edgesMaterial = new THREE.RawShaderMaterial({
            uniforms: {
                u_texture: { value: null },
                u_texelSize: null
            },
            vertexShader: this.fboHelper.precisionPrefix + smaaEdgesVert,
            fragmentShader: this.fboHelper.precisionPrefix + smaaEdgesFrag,
            defines: { SMAA_THRESHOLD: "0.1" },
            blending: THREE.NoBlending,
            depthTest: false,
            depthWrite: false
        }), this.weightsMaterial = new THREE.RawShaderMaterial({
            uniforms: {
                u_edgesTexture: { value: this.edgesRenderTarget.texture },
                u_areaTexture: this.sharedUniforms.u_areaTexture,
                u_searchTexture: this.sharedUniforms.u_searchTexture,
                u_texelSize: null
            },
            vertexShader: this.fboHelper.precisionPrefix + smaaWeightsVert,
            fragmentShader: this.fboHelper.precisionPrefix + smaaWeightsFrag,
            defines: {
                SMAA_MAX_SEARCH_STEPS: "8",
                SMAA_AREATEX_MAX_DISTANCE: "16",
                SMAA_AREATEX_PIXEL_SIZE: "( 1.0 / vec2( 160.0, 560.0 ) )",
                SMAA_AREATEX_SUBTEX_SIZE: "( 1.0 / 7.0 )"
            },
            transparent: true,
            blending: THREE.NoBlending,
            depthTest: false,
            depthWrite: false
        }), this.material = this.fboHelper.createRawShaderMaterial({
            uniforms: {
                u_texture: { value: null },
                u_weightsTexture: { value: this.weightsRenderTarget.texture },
                u_texelSize: null
            },
            vertexShader: this.fboHelper.precisionPrefix + smaaBlendVert,
            fragmentShader: this.fboHelper.precisionPrefix + smaaBlendFrag
        })
    }

    setTextures(e, t) {
        const i = this.sharedUniforms.u_areaTexture.value = this._createTexture(e);
        i.minFilter = THREE.LinearFilter;
        const n = this.sharedUniforms.u_searchTexture.value = this._createTexture(t);
        n.magFilter = THREE.NearestFilter, n.minFilter = THREE.NearestFilter
    }

    updateTextures() {
        this.sharedUniforms.u_areaTexture.value.needsUpdate = !0, this.sharedUniforms.u_searchTexture.value.needsUpdate = !0
    }

    setPostprocessing(e) {
        super.setPostprocessing(e);
        const t = e.width, i = e.height;
        this.edgesRenderTarget.setSize(t, i), this.weightsRenderTarget.setSize(t, i)
    }

    dispose() {
        this.edgesRenderTarget && this.edgesRenderTarget.dispose(), this.weightsRenderTarget && this.weightsRenderTarget.dispose()
    }

    needsRender() {
        return !this.sharedUniforms.u_areaTexture.value.needsUpdate
    }

    render(e, t) {
        const i = this.fboHelper.getColorState();
        this.sharedUniforms.u_searchTexture.value || console.warn("You need to use Smaa.setImages() to set the smaa textures manually and assign to this class.");
        const n = this.fboHelper.renderer;
        n && (n.autoClear = !0, n.setClearColor(0, 0)), this.edgesMaterial.uniforms.u_texelSize = this.weightsMaterial.uniforms.u_texelSize = this.material.uniforms.u_texelSize = e.sharedUniforms.u_texelSize, this.edgesMaterial.uniforms.u_texture.value = e.fromTexture, e.renderMaterial(this.edgesMaterial, this.edgesRenderTarget), e.renderMaterial(this.weightsMaterial, this.weightsRenderTarget), this.fboHelper.setColorState(i), this.material.uniforms.u_texture.value = e.fromTexture, super.render(e, t)
    }

    _createTexture(e) {
        const t = new THREE.Texture(e);
        return t.generateMipmaps = !1, t.flipY = !1, t
    }
}
