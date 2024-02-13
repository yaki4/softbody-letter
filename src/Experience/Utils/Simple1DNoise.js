export default class Simple1DNoise {
    static MAX_VERTICES = 256;
    static MAX_VERTICES_MASK = Simple1DNoise.MAX_VERTICES - 1;
    _scale = 1;
    _amplitude = 1;
    _r = [];

    constructor() {
        for ( let index = 0; index < Simple1DNoise.MAX_VERTICES; ++index ) {
            this._r.push( Math.random() - 0.5 );
        }
    }

    getVal( input ) {
        const scaledInput = input * this._scale;
        const integerPart = Math.floor( scaledInput );
        const fractionalPart = scaledInput - integerPart;
        const smoothedFraction = fractionalPart * fractionalPart * ( 3 - 2 * fractionalPart );
        const indexA = integerPart & Simple1DNoise.MAX_VERTICES_MASK;
        const indexB = ( indexA + 1 ) & Simple1DNoise.MAX_VERTICES_MASK;
        return math.mix( this._r[ indexA ], this._r[ indexB ], smoothedFraction ) * this._amplitude;
    }


    get amplitude() {
        return this._amplitude;
    }

    set amplitude(value) {
        this._amplitude = value;
    }

    get scale() {
        return this._scale;
    }

    set scale(value) {
        this._scale = value;
    }
}
