import * as THREE from 'three'
import Experience from '../Experience.js'
import gsap from "gsap";
import MathUtils from '../Utils/MathUtils.js'
const math = new MathUtils()


export default class SoftBody {
    container = new THREE.Object3D;
    numSubsteps = 20;
    interactiveRatio = 1;
    interactivePattern = 0;
    prevStartTime = 0;
    body;

    constructor() {
        this.experience = new Experience()
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.camera = this.experience.camera
        this.renderer = this.experience.renderer.instance
        this.resources = this.experience.resources
        this.properties = this.experience.world.properties
        this.softBodyTets = this.experience.world.softBodyTets
        this.softBodyParticles = this.experience.world.softBodyParticles
        this.softBodyInner = this.experience.world.softBodyInner

        this.preInit()
    }

    preInit() {
        this.properties.pointsGeometry = this.resources.items.bufferPoints
        this.softBodyTets.preInit()
        this.softBodyParticles.preInit()
        this.softBodyInner.preInit()
    }

    init() {
        this.softBodyTets.init(), this.softBodyParticles.init(), this.softBodyInner.init()
    }

    postInit() {
        this.softBodyParticles.postInit()
    }

    resize(e, t) {
    }

    update(e) {
        const t = math.clamp(e, .011111111111111112, .025), i = t / this.numSubsteps;
        this.properties.SKIP_ANIMATION || (this.properties.startTime >= 1 && this.prevStartTime < 1 ? this.needsFakeMouseInteractive = !0 : this.properties.startTime >= 1.5 && this.prevStartTime < 1.5 && (this.needsFakeMouseInteractive = !0)), this.interactiveRatio = math.saturate(this.interactiveRatio + t * 10), this.softBodyTets.updateMouseProj(t), this.needsFakeMouseInteractive && (this.softBodyTets.fakeInitialMouseInteraction(t, this.interactivePattern), this.interactivePattern = (this.interactivePattern + 1) % 2), this.softBodyTets.preSolveMouse(t, this.interactiveRatio), this.needsFakeMouseInteractive && (this.needsFakeMouseInteractive = !1, this.interactiveRatio = 0);
        for (let n = 0; n < this.numSubsteps; n++) this.softBodyTets.preSolve(i), this.softBodyTets.solve(i), this.softBodyTets.postSolve(i);
        this.softBodyTets.endFrame(t), this.softBodyParticles.endFrame(t), this.softBodyInner.endFrame(t), this.prevStartTime = this.properties.startTime
    }
}
