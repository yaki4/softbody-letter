export default class MathUtils {
    PI = Math.PI;
    PI2 = this.PI * 2;
    HALF_PI = this.PI * .5;
    DEG2RAD = this.PI / 180;
    RAD2DEG = 180 / this.PI;

    step(e, t) {
        return t < e ? 0 : 1
    }

    clamp(e, t, i) {
        return e < t ? t : e > i ? i : e
    }

    mix(e, t, i) {
        return e + (t - e) * i
    }

    cMix(e, t, i) {
        return e + (t - e) * this.clamp(i, 0, 1)
    }

    unMix(e, t, i) {
        return (i - e) / (t - e)
    }

    cUnMix(e, t, i) {
        return this.clamp((i - e) / (t - e), 0, 1)
    }

    saturate(e) {
        return this.clamp(e, 0, 1)
    }

    fit(e, t, i, n, r, a) {
        return e = this.cUnMix(t, i, e), a && (e = a(e)), n + e * (r - n)
    }

    unClampedFit(e, t, i, n, r, a) {
        return e = this.unMix(t, i, e), a && (e = a(e)), n + e * (r - n)
    }

    loop(e, t, i) {
        return e -= t, i -= t, (e < 0 ? (i - Math.abs(e) % i) % i : e % i) + t
    }

    normalize(e, t, i) {
        return Math.max(0, Math.min(1, e - t / i - t))
    }

    smoothstep(e, t, i) {
        return i = this.cUnMix(e, t, i), i * i * (3 - i * 2)
    }

    fract(e) {
        return e - Math.floor(e)
    }

    hash(e) {
        return this.fract(Math.sin(e) * 43758.5453123)
    }

    hash2(e, t) {
        return this.fract(Math.sin(e * 12.9898 + t * 4.1414) * 43758.5453)
    }

    sign(e) {
        return e ? e < 0 ? -1 : 1 : 0
    }

    isPowerOfTwo(e) {
        return (e & -e) === e
    }

    powerTwoCeilingBase(e) {
        return Math.ceil(Math.log(e) / Math.log(2))
    }

    powerTwoCeiling(e) {
        return this.isPowerOfTwo(e) ? e : 1 << this.powerTwoCeilingBase(e)
    }

    powerTwoFloorBase(e) {
        return Math.floor(Math.log(e) / Math.log(2))
    }

    powerTwoFloor(e) {
        return this.isPowerOfTwo(e) ? e : 1 << this.powerTwoFloorBase(e)
    }

    lerp(e, t, i) {
        return e + i * (t - e)
    }

    latLngBearing(e, t, i, n) {
        let r = Math.sin(n - t) * Math.cos(i),
            a = Math.cos(e) * Math.sin(i) - Math.sin(e) * Math.cos(i) * Math.cos(n - t);
        return Math.atan2(r, a)
    }

    distanceTo(e, t) {
        return Math.sqrt(e * e + t * t)
    }

    distanceSqrTo(e, t) {
        return e * e + t * t
    }

    distanceTo3(e, t, i) {
        return Math.sqrt(e * e + t * t + i * i)
    }

    distanceSqrTo3(e, t, i) {
        return e * e + t * t + i * i
    }

    latLngDistance(e, t, i, n) {
        let r = Math.sin((i - e) / 2), a = Math.sin((n - t) / 2), l = r * r + Math.cos(e) * Math.cos(i) * a * a;
        return 2 * Math.atan2(Math.sqrt(l), Math.sqrt(1 - l))
    }

    cubicBezier(e, t, i, n, r) {
        let a = (t - e) * 3, l = (i - t) * 3 - a, u = n - e - a - l, c = r * r, f = c * r;
        return u * f + l * c + a * r + e
    }

    cubicBezierFn(e, t, i, n) {
        let r = (t - e) * 3, a = (i - t) * 3 - r, l = n - e - r - a;
        return u => {
            let c = u * u, f = c * u;
            return l * f + a * c + r * u + e
        }
    }

    normalizeAngle(e) {
        return e += this.PI, e = e < 0 ? this.PI2 - Math.abs(e % PI2) : e % this.PI2, e -= this.PI, e
    }

    closestAngleTo(e, t) {
        return e + this.normalizeAngle(t - e)
    }

    randomRange(e, t) {
        return e + Math.random() * (t - e)
    }

    randomRangeInt(e, t) {
        return Math.floor(this.randomRange(e, t + 1))
    }

    padZero(e, t) {
        return e.toString().length >= t ? e : (Math.pow(10, t) + Math.floor(e)).toString().substring(1)
    }

    getSeedRandomFn(e) {
        let t = 1779033703, i = 3144134277, n = 1013904242, r = 2773480762;
        for (let a = 0, l; a < e.length; a++) l = e.charCodeAt(a), t = i ^ Math.imul(t ^ l, 597399067), i = n ^ Math.imul(i ^ l, 2869860233), n = r ^ Math.imul(n ^ l, 951274213), r = t ^ Math.imul(r ^ l, 2716044179);
        return _sfc32(Math.imul(n ^ t >>> 18, 597399067), Math.imul(r ^ i >>> 22, 2869860233), Math.imul(t ^ n >>> 17, 951274213), Math.imul(i ^ r >>> 19, 2716044179))
    }
}
