import * as THREE from 'three'
import Experience from '../Experience.js'

function vecSetZero(o, e) {
    e *= 3, o[e++] = 0, o[e++] = 0, o[e] = 0
}

function vecScale(o, e, t) {
    e *= 3, o[e++] *= t, o[e++] *= t, o[e] *= t
}

function vecCopy(o, e, t, i) {
    e *= 3, i *= 3, o[e++] = t[i++], o[e++] = t[i++], o[e] = t[i]
}

function vecAdd(o, e, t, i, n = 1) {
    e *= 3, i *= 3, o[e++] += t[i++] * n, o[e++] += t[i++] * n, o[e] += t[i] * n
}

function vecSetDiff(o, e, t, i, n, r, a = 1) {
    e *= 3, i *= 3, r *= 3, o[e++] = (t[i++] - n[r++]) * a, o[e++] = (t[i++] - n[r++]) * a, o[e] = (t[i] - n[r]) * a
}

function vecLengthSquared(o, e) {
    e *= 3;
    let t = o[e], i = o[e + 1], n = o[e + 2];
    return t * t + i * i + n * n
}

function vecDistSquared(o, e, t, i) {
    e *= 3, i *= 3;
    let n = o[e] - t[i], r = o[e + 1] - t[i + 1], a = o[e + 2] - t[i + 2];
    return n * n + r * r + a * a
}

function vecDot(o, e, t, i) {
    return e *= 3, i *= 3, o[e] * t[i] + o[e + 1] * t[i + 1] + o[e + 2] * t[i + 2]
}

function vecSetCross(o, e, t, i, n, r) {
    e *= 3, i *= 3, r *= 3, o[e++] = t[i + 1] * n[r + 2] - t[i + 2] * n[r + 1], o[e++] = t[i + 2] * n[r + 0] - t[i + 0] * n[r + 2], o[e] = t[i + 0] * n[r + 1] - t[i + 1] * n[r + 0]
}

const _v0 = new THREE.Vector3, _v1 = new THREE.Vector3, _v2 = new THREE.Vector3;


export default class SoftBodyTets {
    container = new THREE.Object3D;
    mouseProj = new THREE.Vector3;
    mouseProjPrev = new THREE.Vector3;
    mouseVel = new THREE.Vector3;
    edgeCompliance = 1;
    volCompliance = 0;
    temp = new Float32Array(4 * 3);
    grads = new Float32Array(4 * 3);
    volIdOrder = [[1, 3, 2], [0, 2, 3], [0, 3, 1], [0, 1, 2]];

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
        this.input = this.experience.world.input
    }

    preInit() {
        this.innerSplineGeometry = this.resources.items.bufferSplines
        this.tetGeometry = this.resources.items.bufferTets
        this._onTetsModelLoad()
    }

    _onTetsModelLoad() {
        const e = {}, t = [];
        for (let i = 0; i < this.tetGeometry.index.array.length; i += 4) {
            const n = this.tetGeometry.index.array[i], r = this.tetGeometry.index.array[i + 1],
                a = this.tetGeometry.index.array[i + 2], l = this.tetGeometry.index.array[i + 3], u = [n, r].sort(),
                c = [n, a].sort(), f = [n, l].sort(), p = [r, a].sort(), _ = [r, l].sort(), v = [a, l].sort();
            e[u.join("-")] = u, e[c.join("-")] = c, e[f.join("-")] = f, e[p.join("-")] = p, e[_.join("-")] = _, e[v.join("-")] = v
        }
        for (let i in e) t.push(e[i]);
        this.tetGeometry.userData.tetArray = this.tetGeometry.index.array, this.tetGeometry.userData.edgeArray = t
    }

    init() {
        this.computeTetsData(), this.computeConstraintsData(), this.initPhysics();
        const e = new THREE.LineBasicMaterial({color: 16777215, linewidth: 2});
        this.tetMesh = new THREE.LineSegments(this.tetGeometry, e), this.container.add(this.tetMesh)
    }

    computeTetsData() {
        this.numParticles = this.tetGeometry.attributes.position.array.length / 3, this.numTets = this.tetGeometry.index.array.length / 4, this.pos = this.tetGeometry.attributes.position.array, this.prevPos = this.tetGeometry.attributes.position.array.slice(), this.vel = new Float32Array(3 * this.numParticles), this.tetIds = this.tetGeometry.index.array, this.edgeIds = this.tetGeometry.userData.edgeArray, this.restVol = new Float32Array(this.numTets), this.edgeLengths = new Float32Array(this.edgeIds.length / 2), this.invMass = new Float32Array(this.numParticles);
        const e = Math.ceil(Math.sqrt(this.numParticles)), t = Math.ceil(this.numParticles / e), i = e * t;
        this.posTextureSize = new THREE.Vector2(e, t), this.posTextureArray = new Float32Array(4 * i), this.posTexture = this.fboHelper.createDataTexture(this.posTextureArray, e, t, !0, !0)
    }

    computeConstraintsData() {
        this.numConstraints = this.innerSplineGeometry.attributes.position.array.length / 3, this.splinePos = this.innerSplineGeometry.attributes.position.array, this.constraintsIndex = new Float32Array(this.numParticles), this.staticConstraintsLengths = new Float32Array(this.numParticles);
        for (let e = 0; e < this.numParticles; e++) {
            _v0.fromArray(this.pos, e * 3);
            let t = Number.MAX_VALUE;
            for (let i = 0; i < this.numConstraints; i++) {
                _v1.fromArray(this.splinePos, i * 3);
                const n = _v0.distanceTo(_v1);
                n < t && (t = n, this.constraintsIndex[e] = i)
            }
            this.staticConstraintsLengths[e] = t
        }
    }

    getTetVolume(e) {
        const t = this.tetIds[4 * e], i = this.tetIds[4 * e + 1], n = this.tetIds[4 * e + 2],
            r = this.tetIds[4 * e + 3];
        return vecSetDiff(this.temp, 0, this.pos, i, this.pos, t), vecSetDiff(this.temp, 1, this.pos, n, this.pos, t), vecSetDiff(this.temp, 2, this.pos, r, this.pos, t), vecSetCross(this.temp, 3, this.temp, 0, this.temp, 1), vecDot(this.temp, 3, this.temp, 2) / 6
    }

    initPhysics() {
        this.invMass.fill(0), this.restVol.fill(0);
        for (let e = 0; e < this.numTets; e++) {
            const t = this.getTetVolume(e);
            this.restVol[e] = t;
            const i = t > 0 ? 1 / (t / 4) : 0;
            this.invMass[this.tetIds[4 * e]] += i, this.invMass[this.tetIds[4 * e + 1]] += i, this.invMass[this.tetIds[4 * e + 2]] += i, this.invMass[this.tetIds[4 * e + 3]] += i
        }
        for (let e = 0; e < this.edgeLengths.length; e++) {
            const t = this.edgeIds[e][0], i = this.edgeIds[e][1];
            this.edgeLengths[e] = Math.sqrt(vecDistSquared(this.pos, t, this.pos, i))
        }
    }

    updateMouseProj(e) {
        if (!this.properties.isMobile || this.input.isDown) {
            _v0.set(this.input.mouseXY.x, this.input.mouseXY.y, 1),
            _v0.unproject(this.properties.camera),
            _v0.sub(this.properties.camera.position).normalize(),
            _v1.set(0, 0, -1).applyQuaternion(this.properties.camera.quaternion);
            const t = this.properties.cameraDistance / _v0.dot(_v1);
            this.mouseProjPrev.copy(this.mouseProj),
            this.mouseProj.copy(this.properties.camera.position).add(_v0.multiplyScalar(t)),
            this.properties.isMobile && !this.input.wasDown && this.mouseProjPrev.copy(this.mouseProj),
            this.mouseVel.subVectors(this.mouseProj, this.mouseProjPrev).multiplyScalar(1 / e)
        } else this.mouseVel.setScalar(0)
    }

    fakeInitialMouseInteraction(e, t) {
        let i = 1;
        t == 0 ? (this.mouseProjPrev.set(0, -.7, 0), this.mouseProj.set(.35, 0, 0), i = .5) : t == 1 && (this.mouseProjPrev.set(-.3, .2, 0), this.mouseProj.set(-.1, .4, 0), i = 1), this.mouseVel.subVectors(this.mouseProj, this.mouseProjPrev).multiplyScalar(i / e)
    }

    preSolveMouse(e, t) {
        _v2.subVectors(this.mouseProj, this.mouseProjPrev);
        let i = _v2.dot(_v2);
        if (i > 0) {
            let n = 1 / i;
            for (let r = 0; r < this.numParticles; r++) {
                _v1.fromArray(this.pos, r * 3), _v0.subVectors(_v1, this.mouseProjPrev);
                let a = math.clamp(_v0.dot(_v2) * n, 0, 1);
                _v0.sub(_v1.copy(_v2).multiplyScalar(a)).length() < .1 && (_v0.copy(this.mouseVel).multiplyScalar(.25 * t * math.fit(this.properties.startTime, 0, 1, 0, 1)), this.vel[3 * r] += _v0.x, this.vel[3 * r + 1] += _v0.y, this.vel[3 * r + 2] += _v0.z)
            }
        }
    }

    preSolve(e) {
        for (let t = 0; t < this.numParticles; t++) {
            _v0.fromArray(this.splinePos, this.constraintsIndex[t] * 3), _v1.fromArray(this.pos, t * 3), _v2.subVectors(_v1, _v0);
            const i = this.staticConstraintsLengths[t], n = _v2.length();
            n != i && (_v2.normalize(), _v2.multiplyScalar((i - n) * e * 80), _v0.fromArray(this.vel, t * 3), _v0.add(_v2), this.vel[3 * t] = _v0.x, this.vel[3 * t + 1] = _v0.y, this.vel[3 * t + 2] = _v0.z), vecCopy(this.prevPos, t, this.pos, t), vecAdd(this.pos, t, this.vel, t, e)
        }
    }

    solve(e) {
        this.solveEdges(this.edgeCompliance, e), this.solveVolumes(this.volCompliance, e)
    }

    postSolve(e) {
        let t = math.mix(1, .5, 1 - Math.exp(-10 * e));
        for (let i = 0; i < this.numParticles; i++) this.vel[3 * i + 0] *= t, this.vel[3 * i + 1] *= t, this.vel[3 * i + 2] *= t
    }

    solveEdges(e, t) {
        const i = e / t / t;
        for (let n = 0; n < this.edgeLengths.length; n++) {
            const r = this.edgeIds[n][0], a = this.edgeIds[n][1], l = this.invMass[r], u = this.invMass[a], c = l + u;
            if (c == 0) continue;
            vecSetDiff(this.grads, 0, this.pos, r, this.pos, a);
            const f = Math.sqrt(vecLengthSquared(this.grads, 0));
            if (f == 0) continue;
            vecScale(this.grads, 0, 1 / f);
            const p = this.edgeLengths[n], v = -(f - p) / (c + i);
            vecAdd(this.pos, r, this.grads, 0, v * l), vecAdd(this.pos, a, this.grads, 0, -v * u)
        }
    }

    solveVolumes(e, t) {
        const i = e / t / t;
        for (let n = 0; n < this.numTets; n++) {
            let r = 0;
            for (let f = 0; f < 4; f++) {
                const p = this.tetIds[4 * n + this.volIdOrder[f][0]], _ = this.tetIds[4 * n + this.volIdOrder[f][1]],
                    v = this.tetIds[4 * n + this.volIdOrder[f][2]];
                vecSetDiff(this.temp, 0, this.pos, _, this.pos, p), vecSetDiff(this.temp, 1, this.pos, v, this.pos, p), vecSetCross(this.grads, f, this.temp, 0, this.temp, 1), vecScale(this.grads, f, 1 / 6), r += this.invMass[this.tetIds[4 * n + f]] * vecLengthSquared(this.grads, f)
            }
            if (r == 0) continue;
            const a = this.getTetVolume(n), l = this.restVol[n], c = -(a - l) / (r + i);
            for (let f = 0; f < 4; f++) {
                const p = this.tetIds[4 * n + f];
                vecAdd(this.pos, p, this.grads, f, c * this.invMass[p])
            }
        }
    }

    endFrame(e) {
        const t = this.tetMesh.geometry.attributes.position.array;
        for (let i = 0; i < this.pos.length; i++) t[i] = this.pos[i];
        this.tetMesh.geometry.attributes.position.needsUpdate = !0;
        for (let i = 0; i < this.numParticles; i++) this.posTextureArray[4 * i] = this.pos[3 * i], this.posTextureArray[4 * i + 1] = this.pos[3 * i + 1], this.posTextureArray[4 * i + 2] = this.pos[3 * i + 2], this.posTextureArray[4 * i + 3] = 1;
        this.posTexture.needsUpdate = !0
    }

}
