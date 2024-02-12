import * as THREE from 'three'
import Experience from '../Experience.js'

import vert from '../Shaders/Particles/vertex.glsl'
import frag from '../Shaders/Particles/fragment.glsl'
import LightfieldVert from '../Shaders/Particles/LightfieldVert.glsl'
import LightfieldFrag from '../Shaders/Particles/LightfieldFrag.glsl'


export default class Particles {
    container = new THREE.Object3D;
    particlesMesh;
    particlesGeometry;
    tetsGeometry;
    particleSize = .0125;
    hasInitialized = !0;

    constructor() {
        this.experience = new Experience()
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.camera = this.experience.camera
        this.renderer = this.experience.renderer.instance
        this.resources = this.experience.resources
        this.properties = this.experience.world.properties
        this.particlesSim = this.experience.world.particlesSim
        this.lightField = this.experience.world.lightField
        this.fboHelper = this.experience.world.fboHelper

        this.preInit()
    }

    preInit() {
        this.particlesSim.preInit()
        this.particlesGeometry = this.resources.items.bufferParticlesLD
    }

    init() {
        this.particlesSim.init();
        const e = this.particlesSim.textureSize.x, t = this.particlesSim.textureSize.y, i = this.particlesSim.particleCount,
            n = this.particlesGeometry, r = new THREE.InstancedBufferGeometry;
        r.index = n.index;
        for (let u in n.attributes) r.setAttribute(u, n.attributes[u]);
        const a = new Float32Array(i * 2);
        for (let u = 0, c = 0; u < i; u++, c += 2) a[c] = (u % e + .5) / e, a[c + 1] = (Math.floor(u / e) + .5) / t;
        let l = this.properties.pointsGeometry.attributes.dist.array;
        r.setAttribute("a_simUv", new THREE.InstancedBufferAttribute(a, 2)), r.setAttribute("a_dist", new THREE.InstancedBufferAttribute(l, 1)), this.particlesMesh = new THREE.Mesh(r, new THREE.ShaderMaterial({
            uniforms: Object.assign({
                u_time: this.properties.sharedUniforms.u_time,
                u_currPositionLifeTexture: this.particlesSim.sharedUniforms.u_currPositionLifeTexture,
                u_currVelocityDistTexture: this.particlesSim.sharedUniforms.u_currVelocityDistTexture,
                u_particleSize: {value: this.particleSize},
                u_color: {value: new THREE.Color(this.properties.heroColorHex)}
            }, this.lightField.sharedUniforms), vertexShader: vert, fragmentShader: frag
        })), this.particlesMesh.renderOrder = 1, this.particlesMesh.frustumCulled = !1, this.container.add(this.particlesMesh), this._initLightFieldMesh(a, l), this.hasInitialized = !0
    }

    _initLightFieldMesh(e, t) {
        let i = new THREE.BufferGeometry;
        i.computeBoundingSphere()

        i.setAttribute("position", new THREE.BufferAttribute(e, 2)), i.setAttribute("dist", new THREE.BufferAttribute(t, 1)), this.lightFieldParticles = new THREE.Points(i, this.fboHelper.createRawShaderMaterial({
            uniforms: Object.assign({
                u_time: this.properties.sharedUniforms.u_time,
                u_currPositionLifeTexture: this.particlesSim.sharedUniforms.u_currPositionLifeTexture,
                u_currVelocityDistTexture: this.particlesSim.sharedUniforms.u_currVelocityDistTexture,
                u_color: {value: new THREE.Color(this.properties.heroColorHex)}
            }, this.lightField.sharedUniforms),
            vertexShader: LightfieldVert,
            fragmentShader: LightfieldFrag,
            blending: THREE.CustomBlending,
            blendEquation: THREE.MaxEquation,
            blendDst: THREE.OneFactor,
            blendSrc: THREE.OneFactor,
            blendEquationAlpha: THREE.MaxEquation,
            blendDstAlpha: THREE.OneFactor,
            blendSrcAlpha: THREE.OneFactor
        })), this.lightFieldParticles.frustumCulled = !1
    }

    resize(e, t) {
    }

    update(e) {
        this.hasInitialized && (this.particlesSim.update(e), this.lightField.renderMesh(this.lightFieldParticles))
    }

}
