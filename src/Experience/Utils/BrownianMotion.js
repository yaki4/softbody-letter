import * as THREE from 'three'
import Experience from '../Experience.js'
import gsap from "gsap";
import Simple1DNoise from './Simple1DNoise.js'

const _e = new THREE.Euler
const vecBr = new THREE.Vector3

export default class BrownianMotion {
    experience = new Experience()
    debug = this.experience.debug
    scene = this.experience.scene
    time = this.experience.time
    camera = this.experience.camera
    renderer = this.experience.renderer.instance
    resources = this.experience.resources

    _position = new THREE.Vector3;
    _rotation = new THREE.Quaternion;
    _scale = new THREE.Vector3(1, 1, 1);
    _matrix = new THREE.Matrix4;
    _enablePositionNoise = !0;
    _enableRotationNoise = !0;
    _positionFrequency = .25;
    _rotationFrequency = .25;
    _positionAmplitude = .3;
    _rotationAmplitude = .003;
    _positionScale = new THREE.Vector3(1, 1, 1);
    _rotationScale = new THREE.Vector3(1, 1, 0);
    _positionFractalLevel = 3;
    _rotationFractalLevel = 3;
    _times = new Float32Array(6);
    _noise = new Simple1DNoise;
    static FBM_NORM = 1 / .75;

    constructor() {
        this.rehash()
    }

    rehash() {
        for (let e = 0; e < 6; e++) this._times[e] = Math.random() * -1e4
    }

    _fbm(e, t) {
        let i = 0, n = .5;
        for (let r = 0; r < t; r++) i += n * this._noise.getVal(e), e *= 2, n *= .5;
        return i
    }

    update(e) {
        const t = e === void 0 ? 16.666666666666668 : e;
        if (this._enablePositionNoise) {
            for (let i = 0; i < 3; i++) this._times[i] += this._positionFrequency * t;
            vecBr.set(this._fbm(this._times[0], this._positionFractalLevel), this._fbm(this._times[1], this._positionFractalLevel), this._fbm(this._times[2], this._positionFractalLevel)), vecBr.multiply(this._positionScale), vecBr.multiplyScalar(this._positionAmplitude * BrownianMotion.FBM_NORM), this._position.copy(vecBr)
        }
        if (this._enableRotationNoise) {
            for (let i = 0; i < 3; i++) this._times[i + 3] += this._rotationFrequency * t;
            vecBr.set(this._fbm(this._times[3], this._rotationFractalLevel), this._fbm(this._times[4], this._rotationFractalLevel), this._fbm(this._times[5], this._rotationFractalLevel)), vecBr.multiply(this._rotationScale), vecBr.multiplyScalar(this._rotationAmplitude * BrownianMotion.FBM_NORM), _e.set(vecBr.x, vecBr.y, vecBr.z), this._rotation.setFromEuler(_e)
        }
        this._matrix.compose(this._position, this._rotation, this._scale)
    }

    get positionAmplitude() {
        return this._positionAmplitude
    }

    set positionAmplitude(e) {
        this._positionAmplitude = e
    }

    get positionFrequency() {
        return this._positionFrequency
    }

    set positionFrequency(e) {
        this._positionFrequency = e
    }

    get rotationAmplitude() {
        return this._rotationAmplitude
    }

    set rotationAmplitude(e) {
        this._rotationAmplitude = e
    }

    get rotationFrequency() {
        return this._rotationFrequency
    }

    set rotationFrequency(e) {
        this._rotationFrequency = e
    }

    get matrix() {
        return this._matrix
    }

    set matrix(e) {
        this._matrix = e
    }
}
