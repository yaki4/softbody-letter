import Experience from '../Experience.js'

function vecSetZero(o, e) {
    e *= 3, o[e++] = 0, o[e++] = 0, o[e] = 0
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

export default class SoftBodyInner{

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

    }

    preInit() {
        this.geometry = this.resources.items.bufferSolid
    }

    init() {
        this.computeVisualData(), this.tetIndices = this.geometry.attributes.tet.array, this.baryWeights = this.geometry.attributes.bary.array, this.endFrame()
    }

    computeVisualData() {
        this.numVisVerts = this.geometry.attributes.position.array.length / 3, this.skinningInfo = new Float32Array(4 * this.numVisVerts)
    }

    endFrame() {
        const e = this.geometry.attributes.position.array;
        let t = 0;
        for (let i = 0; i < this.numVisVerts; i++) {
            let n = this.tetIndices[i] * 4;
            const r = this.baryWeights[t++], a = this.baryWeights[t++], l = this.baryWeights[t++], u = 1 - r - a - l,
                c = this.softBodyTets.tetIds[n++], f = this.softBodyTets.tetIds[n++], p = this.softBodyTets.tetIds[n++],
                _ = this.softBodyTets.tetIds[n++];
            vecSetZero(e, i), vecAdd(e, i, this.softBodyTets.pos, c, r), vecAdd(e, i, this.softBodyTets.pos, f, a), vecAdd(e, i, this.softBodyTets.pos, p, l), vecAdd(e, i, this.softBodyTets.pos, _, u)
        }
        this.geometry.attributes.position.needsUpdate = !0, this.geometry.computeVertexNormals()
    }

}
