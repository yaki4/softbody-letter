import * as THREE from 'three'
import Experience from '../Experience.js'
import gsap from "gsap";
import MinSignal from "min-signal";

let _geom;

export default class Postprocessing {
    width = 1;
    height = 1;
    scene = null;
    camera = null;
    resolution = new THREE.Vector2(0, 0);
    texelSize = new THREE.Vector2(0, 0);
    aspect = new THREE.Vector2(1, 1);
    onBeforeSceneRendered = new MinSignal;
    onAfterSceneRendered = new MinSignal;
    onAfterRendered = new MinSignal;
    sceneRenderTarget = null;
    fromRenderTarget = null;
    toRenderTarget = null;
    useDepthTexture = true;
    depthTexture = null;
    fromTexture = null;
    toTexture = null;
    sceneTexture = null;
    mesh = null;
    queue = [];
    sharedUniforms = {};
    geom;
    hasSizeChanged = true;

    constructor() {
        this.experience = new Experience()
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.camera = this.experience.camera
        this.renderer = this.experience.renderer.instance
        this.resources = this.experience.resources
        this.fboHelper = this.experience.world.fboHelper
        this.properties = this.experience.world.properties

        this.init({
            scene: this.properties.scene,
            camera: this.properties.camera
        })

        this.properties.postprocessing = this
    }

    init(e) {
        if (Object.assign(this, e), _geom ? this.geom = _geom : (this.geom = _geom = new THREE.BufferGeometry, this.geom.setAttribute("position", new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 4, -1, 0, -1, 4, 0]), 3)), this.geom.setAttribute("a_uvClamp", new THREE.BufferAttribute(new Float32Array([0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1]), 4))), this.sceneRenderTarget = this.fboHelper.createMultisampleRenderTarget(1, 1), this.sceneRenderTarget.depthBuffer = !0, this.fromRenderTarget = this.fboHelper.createRenderTarget(1, 1), this.toRenderTarget = this.fromRenderTarget.clone(), this.useDepthTexture = !!this.useDepthTexture && this.fboHelper.renderer && (this.fboHelper.renderer.capabilities.isWebGL2 || this.fboHelper.renderer.extensions.get("WEBGL_depth_texture")), this.fromTexture = this.fromRenderTarget.texture, this.toTexture = this.toRenderTarget.texture, this.sceneTexture = this.sceneRenderTarget.texture, this.mesh = new THREE.Mesh, this.sharedUniforms = Object.assign(this.sharedUniforms, {
            u_sceneTexture: {value: this.sceneRenderTarget.texture},
            u_fromTexture: {value: null},
            u_toTexture: {value: null},
            u_sceneDepthTexture: {value: null},
            u_cameraNear: {value: 0},
            u_cameraFar: {value: 1},
            u_cameraFovRad: {value: 1},
            u_resolution: {value: this.resolution},
            u_texelSize: {value: this.texelSize},
            u_aspect: {value: this.aspect}
        }), this.useDepthTexture && this.fboHelper.renderer) {
            const t = new THREE.DepthTexture(this.resolution.width, this.resolution.height);
            this.fboHelper.renderer.capabilities.isWebGL2 ? t.type = THREE.UnsignedIntType : (t.format = THREE.DepthStencilFormat, t.type = THREE.UnsignedInt248Type), t.minFilter = THREE.NearestFilter, t.magFilter = THREE.NearestFilter, this.sceneRenderTarget.depthTexture = t, this.depthTexture = this.sharedUniforms.u_sceneDepthTexture.value = t
        }
    }

    swap() {
        const e = this.fromRenderTarget;
        this.fromRenderTarget = this.toRenderTarget, this.toRenderTarget = e, this.fromTexture = this.fromRenderTarget.texture, this.toTexture = this.toRenderTarget.texture, this.sharedUniforms.u_fromTexture.value = this.fromTexture, this.sharedUniforms.u_toTexture.value = this.toTexture
    }

    setSize(e, t) {
        if (this.width !== e || this.height !== t) {
            this.hasSizeChanged = !0, this.width = e, this.height = t, this.resolution.set(e, t), this.texelSize.set(1 / e, 1 / t);
            const i = t / Math.sqrt(e * e + t * t) * 2;
            this.aspect.set(e / t * i, i), this.sceneRenderTarget.setSize(e, t), this.fromRenderTarget.setSize(e, t), this.toRenderTarget.setSize(e, t)
        }
    }

    dispose() {
        this.fromRenderTarget && this.fromRenderTarget.dispose(), this.toRenderTarget && this.toRenderTarget.dispose(), this.sceneRenderTarget && this.sceneRenderTarget.dispose()
    }

    _filterQueue(e) {
        return e.enabled && e.needsRender()
    }

    renderMaterial(e, t) {
        this.mesh.material = e, this.fboHelper.renderMesh(this.mesh, t)
    }

    render(e, t, i) {
        if (!this.fboHelper.renderer) return;
        this.scene = e, this.camera = t, this.mesh.geometry = this.geom;
        const n = this.queue.filter(this._filterQueue), r = this.sharedUniforms;
        if (n.sort((a, l) => a.renderOrder == l.renderOrder ? 0 : a.renderOrder - l.renderOrder), r.u_sceneTexture.value = this.sceneRenderTarget.texture, r.u_cameraNear.value = t.near, r.u_cameraFar.value = t.far, r.u_cameraFovRad.value = t.fov / 180 * Math.PI, this.onBeforeSceneRendered.dispatch(), n.length) {
            this.fboHelper.renderer.setRenderTarget(this.sceneRenderTarget), this.fboHelper.renderer.render(e, t), this.fboHelper.renderer.setRenderTarget(null), this.fboHelper.copy(this.sceneRenderTarget.texture, this.fromRenderTarget), this.onAfterSceneRendered.dispatch(this.sceneRenderTarget);
            const a = this.fboHelper.getColorState();
            this.fboHelper.renderer.autoClear = !1;
            for (let l = 0, u = n.length; l < u; l++) {
                const c = l === u - 1 && i, f = n[l];
                f.setPostprocessing(this), f.render(this, c)
            }
            this.fboHelper.setColorState(a)
        }
    }

}
