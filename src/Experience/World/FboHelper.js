import * as THREE from 'three'
import Experience from '../Experience.js'

import blitVert from '../Shaders/FboHelper/blitVert.glsl'
import blitFrag from '../Shaders/FboHelper/blitFrag.glsl'
import uvBlitVert from '../Shaders/FboHelper/uvBlitVert.glsl'
import clearFrag from '../Shaders/FboHelper/clearFrag.glsl'
import debugVert from '../Shaders/FboHelper/debugVert.glsl'

export default class FboHelper {
    isWebGL2;
    renderer;
    quadGeom;
    triGeom;
    floatType;
    precisionPrefix;
    precisionPrefix2;
    vertexShader;
    _scene;
    _camera;
    _tri;
    copyMaterial;
    uvCopyMaterial;
    clearMaterial;
    _debugScene;
    _debugMesh;
    _debugMaterial;

    constructor() {
        this.experience = new Experience()
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.camera = this.experience.camera
        this.renderer = this.experience.renderer.instance
        this.resources = this.experience.resources
        this.properties = this.experience.world.properties

        this.init(this.properties.renderer, this.properties.RENDER_TARGET_FLOAT_TYPE)
    }

    init(e, t) {
        this.renderer = e, this.floatType = t, this.isWebGL2 = this.renderer.capabilities.isWebGL2, this._scene = new THREE.Scene, this._camera = new THREE.Camera, this._camera.position.z = 1, this.triGeom = new THREE.BufferGeometry, this.triGeom.setAttribute("position", new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 4, -1, 0, -1, 4, 0]), 3)), this.quadGeom = new THREE.PlaneGeometry(2, 2), this._tri = new THREE.Mesh(this.triGeom), this._tri.frustumCulled = !1, this._scene.add(this._tri), this.precisionPrefix = `precision ${this.renderer.capabilities.precision} float;
`, this.precisionPrefix2 = `#version 300 es
			precision ${this.renderer.capabilities.precision} float;
			precision ${this.renderer.capabilities.precision} int;
			#define IS_WEBGL2 true
		`, this.isWebGL2 ? (this.vertexPrefix = `${this.precisionPrefix2}
				precision mediump sampler2DArray;
				#define attribute in
				#define varying out
				#define texture2D texture
			`, this.fragmentPrefix = `${this.precisionPrefix2}
				#define varying in
				out highp vec4 pc_fragColor;
				#define gl_FragColor pc_fragColor
				#define gl_FragDepthEXT gl_FragDepth
				#define texture2D texture
				#define textureCube texture
				#define texture2DProj textureProj
				#define texture2DLodEXT textureLod
				#define texture2DProjLodEXT textureProjLod
				#define textureCubeLodEXT textureLod
				#define texture2DGradEXT textureGrad
				#define texture2DProjGradEXT textureProjGrad
				#define textureCubeGradEXT textureGrad
			`) : (this.vertexPrefix = this.precisionPrefix, this.fragmentPrefix = this.precisionPrefix), this.renderer.getContext().getExtension("OES_standard_derivatives"), this.vertexShader = this.precisionPrefix + blitVert, this.copyMaterial = new THREE.RawShaderMaterial({
            uniforms: {u_texture: {value: null}},
            vertexShader: this.vertexShader,
            fragmentShader: this.precisionPrefix + blitFrag,
            depthTest: !1,
            depthWrite: !1,
            blending: THREE.NoBlending
        }), this.uvCopyMaterial = new THREE.RawShaderMaterial({
            uniforms: {u_texture: {value: null}},
            vertexShader: this.precisionPrefix + uvBlitVert,
            fragmentShader: this.precisionPrefix + blitFrag,
            depthTest: !1,
            depthWrite: !1,
            blending: THREE.NoBlending
        }), this.clearMaterial = new THREE.RawShaderMaterial({
            uniforms: {u_color: {value: new THREE.Vector4(1, 1, 1, 1)}},
            vertexShader: this.vertexShader,
            fragmentShader: this.precisionPrefix + clearFrag,
            depthTest: !1,
            depthWrite: !1,
            blending: THREE.NoBlending
        });
        const i = new THREE.PlaneGeometry(1, 1);
        i.translate(.5, -.5, 0), this._debugMaterial = new THREE.RawShaderMaterial({
            uniforms: {
                u_texture: {value: null},
                u_transform: {value: new THREE.Vector4(0, 0, 1, 1)}
            },
            vertexShader: this.precisionPrefix + debugVert,
            fragmentShader: this.precisionPrefix + blitFrag,
            depthTest: !1,
            depthWrite: !1,
            blending: THREE.NoBlending
        }), this._debugMesh = new THREE.Mesh(i, this._debugMaterial), this._debugScene = new THREE.Scene, this._debugScene.frustumCulled = !1, this._debugScene.add(this._debugMesh)
    }

    copy(e, t) {
        const i = this.copyMaterial;
        i && (i.uniforms.u_texture.value = e, this.render(i, t))
    }

    uvCopy(e, t) {
        const i = this.uvCopyMaterial;
        i && (i.uniforms.u_texture.value = e, this.render(i, t))
    }

    render(e, t) {
        this._tri && this.renderer && this._scene && this._camera && (this._tri.material = e, t && this.renderer.setRenderTarget(t), this.renderer.render(this._scene, this._camera), t && this.renderer.setRenderTarget(null))
    }

    renderGeometry(e, t, i) {
        this._tri && this.triGeom && (this._tri.geometry = e, this.render(t, i), this._tri.geometry = this.triGeom)
    }

    renderMesh(e, t, i = this._camera) {
        this._tri && this.renderer && this._scene && i && (this._tri.visible = !1, this._scene.add(e), t && this.renderer.setRenderTarget(t || null), this.renderer.render(this._scene, i), t && this.renderer.setRenderTarget(null), this._scene.remove(e), this._tri.visible = !0)
    }

    debugTo(e, t, i, n, r) {
        if (!(this.renderer && this._debugMaterial && this._debugScene && this._camera)) return;
        t = t || e.width || e.image.width, i = i || e.height || e.image.height, n = n || 0, r = r || 0;
        const a = this.renderer.getSize(new THREE.Vector2);
        n = n / a.width * 2 - 1, r = 1 - r / a.height * 2, t = t / a.width * 2, i = i / a.height * 2, this._debugMaterial.uniforms.u_texture.value = e, this._debugMaterial.uniforms.u_transform.value.set(n, r, t, i);
        const l = this.getColorState();
        this.renderer.autoClearColor = !1, this.renderer.setRenderTarget(null), this.renderer.render(this._debugScene, this._camera), this.setColorState(l)
    }

    parseDefines(e) {
        let t = "";
        for (const i in e) {
            const n = e[i];
            n === !0 ? t += `#define ${i}
` : t += `#define ${i} ${n}
`
        }
        return t
    }

    clearColor(e, t, i, n, r) {
        this.clearMaterial && (this.clearMaterial.uniforms.u_color.value.set(e, t, i, n), this.render(this.clearMaterial, r))
    }

    getColorState() {
        if (!this.renderer) return {
            autoClear: !0,
            autoClearColor: !0,
            autoClearStencil: !0,
            autoClearDepth: !0,
            clearColor: 0,
            clearAlpha: 1
        };
        const e = new THREE.Color;
        return this.renderer.getClearColor(e), {
            autoClear: this.renderer.autoClear,
            autoClearColor: this.renderer.autoClearColor,
            autoClearStencil: this.renderer.autoClearStencil,
            autoClearDepth: this.renderer.autoClearDepth,
            clearColor: e.getHex(),
            clearAlpha: this.renderer.getClearAlpha()
        }
    }

    setColorState(e) {
        this.renderer && (this.renderer.setClearColor(e.clearColor, e.clearAlpha), this.renderer.autoClear = e.autoClear, this.renderer.autoClearColor = e.autoClearColor, this.renderer.autoClearStencil = e.autoClearStencil, this.renderer.autoClearDepth = e.autoClearDepth)
    }

    createRawShaderMaterial(e) {
        e = Object.assign({
            depthTest: !1,
            depthWrite: !1,
            blending: THREE.NoBlending,
            vertexShader: blitVert,
            fragmentShader: blitFrag,
            derivatives: !1
        }, e), e.vertexShader = (e.vertexShaderPrefix ? e.vertexShaderPrefix : e.derivatives ? this.vertexPrefix : this.precisionPrefix) + e.vertexShader, e.fragmentShader = (e.fragmentShaderPrefix ? e.fragmentShaderPrefix : e.derivatives ? this.fragmentPrefix : this.precisionPrefix) + e.fragmentShader, delete e.vertexShaderPrefix, delete e.fragmentShaderPrefix, delete e.derivatives;
        let t = new THREE.RawShaderMaterial(e);
        return /*taskManager.add(t), */ t
    }

    createDataTexture(e, t, i, n = !1, r = !0) {
        let a = new THREE.DataTexture(e, t, i, THREE.RGBAFormat, n ? THREE.FloatType : THREE.UnsignedByteType, THREE.UVMapping, THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, r ? THREE.NearestFilter : THREE.LinearFilter, r ? THREE.NearestFilter : THREE.LinearFilter, 0);
        return a.needsUpdate = !0, a
    }

    createRenderTarget(e, t, i = !1, n = !1, r = 0) {
        return new THREE.WebGLRenderTarget(e, t, {
            wrapS: THREE.ClampToEdgeWrapping,
            wrapT: THREE.ClampToEdgeWrapping,
            magFilter: i ? THREE.NearestFilter : THREE.LinearFilter,
            minFilter: i ? THREE.NearestFilter : THREE.LinearFilter,
            type: n ? this.floatType : THREE.UnsignedByteType,
            anisotropy: 0,
            encoding: THREE.LinearEncoding,
            depthBuffer: !1,
            stencilBuffer: !1,
            samples: this.properties.isSupportMSAA ? r : 0
        })
    }

    createMultisampleRenderTarget(e, t, i = !1, n = !1, r = 8) {
        return !this.properties.USE_MSAA || !(this.renderer && this.isWebGL2) || !this.properties.isSupportMSAA ? this.createRenderTarget(e, t, i, n) : new THREE.WebGLRenderTarget(e, t, {
            wrapS: THREE.ClampToEdgeWrapping,
            wrapT: THREE.ClampToEdgeWrapping,
            magFilter: i ? THREE.NearestFilter : THREE.LinearFilter,
            minFilter: i ? THREE.NearestFilter : THREE.LinearFilter,
            type: n ? this.floatType : THREE.UnsignedByteType,
            anisotropy: 0,
            encoding: THREE.LinearEncoding,
            depthBuffer: !1,
            stencilBuffer: !1,
            samples: r
        })
    }

    clearMultisampleRenderTargetState(e) {
        if (e = e || this.renderer.getRenderTarget(), e && e.samples > 0) {
            const t = this.renderer.properties.get(e);
            let i = this.renderer.getContext();
            i.bindFramebuffer(i.READ_FRAMEBUFFER, t.__webglMultisampledFramebuffer), i.bindFramebuffer(i.DRAW_FRAMEBUFFER, t.__webglFramebuffer);
            const n = e.width, r = e.height;
            let a = i.COLOR_BUFFER_BIT;
            e.depthBuffer && (a |= i.DEPTH_BUFFER_BIT), e.stencilBuffer && (a |= i.STENCIL_BUFFER_BIT), i.blitFramebuffer(0, 0, n, r, 0, 0, n, r, a, i.NEAREST), i.bindFramebuffer(i.FRAMEBUFFER, t.__webglMultisampledFramebuffer)
        }
    }
}
