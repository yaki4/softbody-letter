export default class Simple1DNoise {
    static MAX_VERTICES = 256;
    static MAX_VERTICES_MASK = Simple1DNoise.MAX_VERTICES - 1;
    _scale = 1;
    _amplitude = 1;
    _r = [];

    constructor() {
        for (let e = 0; e < Simple1DNoise.MAX_VERTICES; ++e) this._r.push(Math.random() - .5)
    }

    getVal(e) {
        const t = e * this._scale, i = Math.floor(t), n = t - i, r = n * n * (3 - 2 * n),
            a = i & Simple1DNoise.MAX_VERTICES_MASK, l = a + 1 & Simple1DNoise.MAX_VERTICES_MASK;
        return math.mix(this._r[a], this._r[l], r) * this._amplitude
    }

    get amplitude() {
        return this._amplitude
    }

    set amplitude(e) {
        this._amplitude = e
    }

    get scale() {
        return this._scale
    }

    set scale(e) {
        this._scale = e
    }
}
