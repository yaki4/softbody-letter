import * as THREE from 'three'
import Experience from '../Experience.js'
import gsap from "gsap";
import MathUtils from '../Utils/MathUtils.js'
const math = new MathUtils()
import particleSoftBodySim from '../Shaders/SoftBodyParticles/particleSoftBodySim.glsl'


export default class SoftBodyParticles {

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
        this.softBodyTets = this.experience.world.softBodyTets
        this.particlesSim = this.experience.world.particlesSim
    }

    preInit() {
    }

    init() {
        this.computeVisualData()
    }

    postInit() {
        const e = this.particlesSim.textureSize.x, t = this.particlesSim.textureSize.y, i = e * t;
        this.particlesDataForTexture = new Float32Array(i * 4), this.particlesSoftBodyPositionDataTexture = this.fboHelper.createDataTexture(this.particlesDataForTexture, e, t, !0, !0), this.positionRenderTarget = this.fboHelper.createRenderTarget(1, 1, !0, !0), this.positionRenderTarget.setSize(e, t), this.fboHelper.copy(this.particlesSoftBodyPositionDataTexture, this.positionRenderTarget), this.baryWeightsArray = new Float32Array(i * 4), this.tetsUvX = new Float32Array(i * 4), this.tetsUvY = new Float32Array(i * 4);
        let n = 0;
        for (let r = 0; r < this.particleCount; r++) {
            const a = this.baryWeights[n++], l = this.baryWeights[n++], u = this.baryWeights[n++], c = 1 - a - l - u;
            this.baryWeightsArray[4 * r] = a, this.baryWeightsArray[4 * r + 1] = l, this.baryWeightsArray[4 * r + 2] = u, this.baryWeightsArray[4 * r + 3] = c;
            let f = this.tetIndices[r] * 4;
            for (let p = 0; p < 4; p++) {
                const _ = this.softBodyTets.tetIds[f];
                this.tetsUvX[4 * r + p] = (_ % this.softBodyTets.posTextureSize.x + .5) / this.softBodyTets.posTextureSize.x, this.tetsUvY[4 * r + p] = (Math.floor(_ / this.softBodyTets.posTextureSize.x) + .5) / this.softBodyTets.posTextureSize.y, f++
            }
        }
        this.tetsUvXTexture = this.fboHelper.createDataTexture(this.tetsUvX, e, t, !0, !0), this.tetsUvYTexture = this.fboHelper.createDataTexture(this.tetsUvY, e, t, !0, !0), this.baryWeightsTexture = this.fboHelper.createDataTexture(this.baryWeightsArray, e, t, !0, !0), this.softBodyPositionMaterial = new THREE.RawShaderMaterial({
            uniforms: {
                u_time: this.properties.sharedUniforms.u_time,
                u_deltaTime: this.properties.sharedUniforms.u_deltaTime,
                u_tetsTexture: {value: null},
                u_tetsUvXTexture: {value: this.tetsUvXTexture},
                u_tetsUvYTexture: {value: this.tetsUvYTexture},
                u_tetsTextureSize: {value: new THREE.Vector2},
                u_baryWeightsTexture: {value: this.baryWeightsTexture}
            }, vertexShader: this.fboHelper.vertexShader, fragmentShader: this.fboHelper.precisionPrefix + particleSoftBodySim
        })
    }

    computeVisualData() {
        this.particlesPos = this.properties.pointsGeometry.attributes.position.array.slice(), this.particlesDefaultPos = this.particlesPos.slice(), this.particleCount = this.particlesPos.length / 3, this.tetIndices = this.properties.pointsGeometry.attributes.tet.array, this.baryWeights = this.properties.pointsGeometry.attributes.bary.array
    }

    endFrame(e) {
        this.softBodyPositionMaterial.uniforms.u_tetsTexture.value = this.softBodyTets.posTexture, this.softBodyPositionMaterial.uniforms.u_tetsTextureSize.value.copy(this.softBodyTets.posTextureSize), this.fboHelper.render(this.softBodyPositionMaterial, this.positionRenderTarget)
    }
}
