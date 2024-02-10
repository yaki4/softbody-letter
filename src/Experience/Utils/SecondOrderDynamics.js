import * as THREE from 'three'
import Experience from '../Experience.js'
import gsap from "gsap";

export default class SecondOrderDynamics   {
    experience = new Experience()
    debug = this.experience.debug
    scene = this.experience.scene
    time = this.experience.time
    camera = this.experience.camera
    renderer = this.experience.renderer.instance
    resources = this.experience.resources
    fboHelper = this.experience.world.fboHelper

    target0 = null;
    target = null;
    prevTarget = null;
    value = null;
    valueVel = null;
    k1;
    k2;
    k3;
    _f;
    _z;
    _r;
    _w;
    _z;
    _d;
    _targetVelCache;
    _cache1;
    _cache2;
    _k1Stable;
    _k2Stable;
    isVector = null;
    isRobust = null;

    constructor(e, t = 1.5, i = .8, n = 2, r = !0) {
        this.isRobust = r, this.isVector = typeof e == "object", this.setFZR(t, i, n), this.isVector ? (this.target = e, this.target0 = e.clone(), this.prevTarget = e.clone(), this.value = e.clone(), this.valueVel = e.clone().setScalar(0), this._targetVelCache = this.valueVel.clone(), this._cache1 = this.valueVel.clone(), this._cache2 = this.valueVel.clone(), this.update = this._updateVector, this.reset = this._resetVector) : (this.target0 = e, this.prevTarget = e, this.value = e, this.valueVel = 0, this.update = this._updateNumber, this.reset = this._resetNumber), this.computeStableCoefficients = r ? this._computeRobustStableCoefficients : this._computeStableCoefficients
    }

    update(e, t = 0) {
    }

    reset(e = null) {
    }

    _resetVector(e = this.target0) {
        this.valueVel.setScalar(0), this.prevTarget.copy(e), this.target.copy(e), this.value.copy(e)
    }

    _resetNumber(e = this.target0) {
        this.valueVel = 0, this.prevTarget = e, this.target = e, this.value = e
    }

    setFZR(e = this._f, t = this._z, i = this._r) {
        let n = Math.PI * 2 * e;
        this.isRobust && (this._w = n, this._z = t, this._d = this._w * Math.sqrt(Math.abs(this._z * this._z - 1))), this.k1 = t / (Math.PI * e), this.k2 = 1 / (n * n), this.k3 = i * t / n
    }

    _computeStableCoefficients(e) {
        this._k1Stable = this.k1, this._k2Stable = Math.max(this.k2, 1.1 * e * e / 4 + e * this.k1 / 2)
    }

    _computeRobustStableCoefficients(e) {
        if (this._w * e < this._z) this._k1Stable = this.k1, this._k2Stable = Math.max(this.k2, e * e / 2 + e * this.k1 / 2, e * this.k1); else {
            let t = Math.exp(-this._z * this._w * e),
                i = 2 * t * (this._z <= 1 ? Math.cos(e * this._d) : Math.cosh(e * this._d)), n = t * t,
                r = e / (1 + n - i);
            this._k1Stable = (1 - n) * r, this._k2Stable = e * r
        }
    }

    _updateVector(e) {
        e > 0 && (this._targetVelCache.copy(this.target).sub(this.prevTarget).divideScalar(e), this.prevTarget.copy(this.target), this.computeStableCoefficients(e), this.value.add(this._cache1.copy(this.valueVel).multiplyScalar(e)), this._cache1.copy(this.target).add(this._targetVelCache.multiplyScalar(this.k3)).sub(this.value).sub(this._cache2.copy(this.valueVel).multiplyScalar(this._k1Stable)).multiplyScalar(e / this._k2Stable), this.valueVel.add(this._cache1))
    }

    _updateNumber(e, t = this.target) {
        if (e > 0) {
            let i = (t - this.prevTarget) / e;
            this.prevTarget = t, this.computeStableCoefficients(e), this.value += this.valueVel * e, this.valueVel += (t + this.k3 * i - this.value - this._k1Stable * this.valueVel) * (e / this._k2Stable)
        }
    }
}
