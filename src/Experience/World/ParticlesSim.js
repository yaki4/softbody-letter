import * as THREE from 'three'
import Experience from '../Experience.js'
import gsap from "gsap";
import MathUtils from '../Utils/MathUtils.js'
const math = new MathUtils()

import particlesVelocitySim from '../Shaders/ParticlesSim/particlesVelocitySim.glsl'
import particlesPositionSim from '../Shaders/ParticlesSim/particlesPositionSim.glsl'

export default class ParticlesSim {
    textureSize = new THREE.Vector2(0, 0);
    particleCount = 0;
    currPositionLifeRenderTarget;
    prevPositionLifeRenderTarget;
    currVelocityLifeRenderTarget;
    prevVelocityLifeRenderTarget;
    geometry;
    positionLifes;
    velocityLifes;
    positionLifesDataTexture;
    velocityLifesDataTexture;
    sharedUniforms = {
        u_time: 0,
        u_deltaTime: {value: 0},
        u_softBodyTexture: {value: null},
        u_currPositionLifeTexture: {value: null},
        u_prevPositionLifeTexture: {value: null},
        u_currVelocityDistTexture: {value: null},
        u_prevVelocityDistTexture: {value: null},
        u_simTextureSize: {value: this.textureSize}
    };
    hasInit = !1;

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
        this.softBodyParticles = this.experience.world.softBodyParticles

        this.sharedUniforms.u_time = this.properties.sharedUniforms.u_time
    }

    preInit() {
        this.currPositionLifeRenderTarget = this.fboHelper.createRenderTarget(1, 1, !0, !0), this.prevPositionLifeRenderTarget = this.fboHelper.createRenderTarget(1, 1, !0, !0), this.currVelocityLifeRenderTarget = this.fboHelper.createRenderTarget(1, 1, !0, !0), this.prevVelocityLifeRenderTarget = this.fboHelper.createRenderTarget(1, 1, !0, !0)
    }

    init() {
        const t = this.properties.pointsGeometry.attributes.position.array.length / 3, i = Math.ceil(Math.sqrt(t)),
            n = Math.ceil(t / i), r = i * n;
        this.textureSize.set(i, n), this.positionLifes = new Float32Array(r * 4), this.velocityLifes = new Float32Array(r * 4), this.currPositionLifeRenderTarget.setSize(i, n), this.prevPositionLifeRenderTarget.setSize(i, n), this.currVelocityLifeRenderTarget.setSize(i, n), this.prevVelocityLifeRenderTarget.setSize(i, n), this.particleCount = t;
        for (let a = 0, l = 0; a < this.particleCount; a++, l += 4) this.positionLifes[l] = 0, this.positionLifes[l + 1] = 0, this.positionLifes[l + 2] = 0, this.positionLifes[l + 3] = 1.1, this.velocityLifes[l] = 0, this.velocityLifes[l + 1] = 0, this.velocityLifes[l + 2] = 0, this.velocityLifes[l + 3] = this.properties.pointsGeometry.attributes.dist.array[a];
        this.positionLifesDataTexture = this.fboHelper.createDataTexture(this.positionLifes, i, n, !0, !0), this.velocityLifesDataTexture = this.fboHelper.createDataTexture(this.velocityLifes, i, n, !0, !0), this.fboHelper.copy(this.positionLifesDataTexture, this.currPositionLifeRenderTarget), this.fboHelper.copy(this.positionLifesDataTexture, this.prevPositionLifeRenderTarget), this.fboHelper.copy(this.velocityLifesDataTexture, this.currVelocityLifeRenderTarget), this.velocityMaterial = new THREE.RawShaderMaterial({
            uniforms: {
                u_time: this.sharedUniforms.u_time,
                u_deltaTime: this.sharedUniforms.u_deltaTime,
                u_velocityDistTexture: this.sharedUniforms.u_currVelocityDistTexture,
                u_positionLifeTexture: this.sharedUniforms.u_currPositionLifeTexture,
                u_prevPositionLifeTexture: this.sharedUniforms.u_prevPositionLifeTexture
            }, vertexShader: this.fboHelper.vertexShader, fragmentShader: this.fboHelper.precisionPrefix + particlesVelocitySim
        }), this.positionMaterial = new THREE.RawShaderMaterial({
            uniforms: {
                u_time: this.sharedUniforms.u_time,
                u_deltaTime: this.sharedUniforms.u_deltaTime,
                u_softBodyTexture: this.sharedUniforms.u_softBodyTexture,
                u_positionLifeTexture: this.sharedUniforms.u_currPositionLifeTexture,
                u_velocityDistTexture: this.sharedUniforms.u_currVelocityDistTexture
            }, vertexShader: this.fboHelper.vertexShader, fragmentShader: this.fboHelper.precisionPrefix + particlesPositionSim
        }), this.hasInit = !0
    }

    resize(e, t) {
    }

    update(e) {
        if (!this.hasInit) return;
        if (!this.softBodyParticles) {
            this.softBodyParticles = this.experience.world.softBodyParticles

            return;
        };
        this.sharedUniforms.u_deltaTime.value = math.clamp(e, 1 / 90, 1 / 40), this.sharedUniforms.u_softBodyTexture.value = this.softBodyParticles.positionRenderTarget.texture, this.sharedUniforms.u_currPositionLifeTexture.value = this.currPositionLifeRenderTarget.texture, this.sharedUniforms.u_prevPositionLifeTexture.value = this.prevPositionLifeRenderTarget.texture, this.sharedUniforms.u_currVelocityDistTexture.value = this.currVelocityLifeRenderTarget.texture, this.sharedUniforms.u_prevVelocityDistTexture.value = this.prevPositionLifeRenderTarget.texture;
        const t = this.currPositionLifeRenderTarget;
        this.currPositionLifeRenderTarget = this.prevPositionLifeRenderTarget, this.prevPositionLifeRenderTarget = t;
        const i = this.currVelocityLifeRenderTarget;
        this.currVelocityLifeRenderTarget = this.prevVelocityLifeRenderTarget, this.prevVelocityLifeRenderTarget = i, this.fboHelper.render(this.velocityMaterial, this.currVelocityLifeRenderTarget), this.fboHelper.render(this.positionMaterial, this.currPositionLifeRenderTarget)
    }

}
