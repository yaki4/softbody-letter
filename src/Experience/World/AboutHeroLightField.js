import * as THREE from 'three'
import Experience from '../Experience.js'
import gsap from "gsap";

import sliceShader from '../Shaders/AboutHeroLightField/sliceShader.glsl'
import sliceBlendFrag from '../Shaders/AboutHeroLightField/sliceBlendFrag.glsl'

export default class AboutHeroLightField {
    GRID_COUNT = new THREE.Vector3(64, 64, 32);
    ORIGIN = new THREE.Vector3(0, 0, 0);
    VOLUME_SIZE = new THREE.Vector3(2, 0, 0);
    container = new THREE.Object3D;
    prevSliceRenderTarget = null;
    currSliceRenderTarget = null;
    drawnSliceRenderTarget = null;
    sliceTo3DMesh = null;
    sliceBlendMaterial;
    sliceColumnCount = 0;
    sliceRowCount = 0;
    gridSize = 0;
    SHOW_TEST_VOXELS = !1;
    sharedUniforms = {
        u_lightFieldTexture3D: {value: null},
        u_lightFieldMaxLod: {value: 0},
        u_lightFieldSlicedTexture: {value: null},
        u_lightFieldSlicedTextureSize: {value: new THREE.Vector2},
        u_lightFieldSliceColRowCount: {value: new THREE.Vector2},
        u_lightFieldGridSize: {value: 0},
        u_lightFieldGridCount: {value: this.GRID_COUNT},
        u_lightFieldVolumeOffset: {value: new THREE.Vector3},
        u_lightFieldVolumeSize: {value: new THREE.Vector3}
    };


    constructor() {
        this.experience = new Experience()
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.camera = this.experience.camera
        this.renderer = this.experience.renderer.instance
        this.resources = this.experience.resources
        this.properties = this.experience.world.properties
        this.fboHelper = this.experience.world.fboHelper

        this.init()
    }

    init() {
        /*shaderHelper.addChunk("lightFieldSlice", sliceShader), */ this.gridSize = this.VOLUME_SIZE.x / (this.GRID_COUNT.x - 1), this.sharedUniforms.u_lightFieldGridSize.value = this.gridSize, this.VOLUME_SIZE.y = this.gridSize * (this.GRID_COUNT.y - 1), this.VOLUME_SIZE.z = this.gridSize * (this.GRID_COUNT.z - 1), this.sharedUniforms.u_lightFieldVolumeSize.value.setScalar(this.gridSize).add(this.VOLUME_SIZE), this.sharedUniforms.u_lightFieldMaxLod.value = Math.log2(Math.min(this.GRID_COUNT.x, this.GRID_COUNT.y, this.GRID_COUNT.z));
        let e = this.GRID_COUNT.x * this.GRID_COUNT.y * this.GRID_COUNT.z,
            t = this.sliceColumnCount = Math.ceil(Math.sqrt(e) / this.GRID_COUNT.x),
            i = this.sliceRowCount = Math.ceil(this.GRID_COUNT.z / t);
        this.sharedUniforms.u_lightFieldSliceColRowCount.value.set(t, i);
        let n = this.GRID_COUNT.x * t, r = this.GRID_COUNT.y * i;
        this.sharedUniforms.u_lightFieldSlicedTextureSize.value.set(n, r), this.currSliceRenderTarget = this.fboHelper.createRenderTarget(n, r), this.prevSliceRenderTarget = this.currSliceRenderTarget.clone(), this.drawnSliceRenderTarget = this.currSliceRenderTarget.clone(), this.fboHelper.clearColor(0, 0, 0, 0, this.currSliceRenderTarget), this.sliceBlendMaterial = this.fboHelper.createRawShaderMaterial({
            uniforms: {
                u_lightFieldSlicedTextureSize: this.sharedUniforms.u_lightFieldSlicedTextureSize,
                u_lightFieldSliceColRowCount: this.sharedUniforms.u_lightFieldSliceColRowCount,
                u_lightFieldGridCount: this.sharedUniforms.u_lightFieldGridCount,
                u_lightFieldVolumeOffset: this.sharedUniforms.u_lightFieldVolumeOffset,
                u_lightFieldVolumeSize: this.sharedUniforms.u_lightFieldVolumeSize,
                u_prevSliceTexture: {value: null},
                u_drawnSliceTexture: {value: this.drawnSliceRenderTarget.texture}
            }, fragmentShader: sliceBlendFrag
        })
    }

    update(e) {
        let t = this.VOLUME_SIZE.clone().multiplyScalar(.5).sub(this.ORIGIN).multiplyScalar(-1);
        this.sharedUniforms.u_lightFieldVolumeOffset.value.setScalar(-this.gridSize / 2).add(t);
        let i = this.properties.renderer, n = this.fboHelper.getColorState(), r = i.getRenderTarget();
        i.setRenderTarget(this.drawnSliceRenderTarget), i.setClearColor(0, 0), i.clear(), i.setRenderTarget(r), this.fboHelper.setColorState(n)
    }

    renderMesh(e) {
        let t = this.properties.renderer, i = this.fboHelper.getColorState(), n = t.getRenderTarget();
        t.autoClearColor = !1, this.fboHelper.renderMesh(e, this.drawnSliceRenderTarget), t.setRenderTarget(n), this.fboHelper.setColorState(i)
    }

    postUpdate(e) {
        let t = this.properties.renderer, i = this.fboHelper.getColorState(), n = t.getRenderTarget();
        this.properties.gl, t.autoClear = !1;
        let r = this.prevSliceRenderTarget;
        this.prevSliceRenderTarget = this.currSliceRenderTarget, this.currSliceRenderTarget = r, this.sharedUniforms.u_lightFieldSlicedTexture.value = this.currSliceRenderTarget.texture, this.sliceBlendMaterial.uniforms.u_prevSliceTexture.value = this.prevSliceRenderTarget.texture, this.fboHelper.render(this.sliceBlendMaterial, this.currSliceRenderTarget), t.setRenderTarget(n), this.fboHelper.setColorState(i)
    }

}
