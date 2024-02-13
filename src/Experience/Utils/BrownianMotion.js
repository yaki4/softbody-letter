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
    _scale = new THREE.Vector3( 1, 1, 1 );
    _matrix = new THREE.Matrix4;
    _enablePositionNoise = !0;
    _enableRotationNoise = !0;
    _positionFrequency = .25;
    _rotationFrequency = .25;
    _positionAmplitude = .3;
    _rotationAmplitude = .003;
    _positionScale = new THREE.Vector3( 1, 1, 1 );
    _rotationScale = new THREE.Vector3( 1, 1, 0 );
    _positionFractalLevel = 3;
    _rotationFractalLevel = 3;
    _times = new Float32Array( 6 );
    _noise = new Simple1DNoise;
    static FBM_NORM = 1 / .75;

    constructor() {
        this.rehash()
    }

    rehash() {
        for ( let index = 0; index < 6; index++ ) {
            this._times[ index ] = Math.random() * -10000; // Assign a random negative value
        }
    }

    _fbm( value, octaves ) {
        let noiseSum = 0;
        let amplitude = 0.5;

        for ( let octave = 0; octave < octaves; octave++ ) {
            noiseSum += amplitude * this._noise.getVal( value );
            value *= 2;
            amplitude *= 0.5;
        }

        return noiseSum;
    }

    update( deltaTime ) {
        const timeStep = deltaTime === undefined ? 16.666666666666668 : deltaTime;

        if ( this._enablePositionNoise ) {
            // Update time values for position noise
            for ( let axis = 0; axis < 3; axis++ ) {
                this._times[ axis ] += this._positionFrequency * timeStep;
            }

            // Calculate position noise
            const positionNoise = new THREE.Vector3(
                this._fbm( this._times[ 0 ], this._positionFractalLevel ),
                this._fbm( this._times[ 1 ], this._positionFractalLevel ),
                this._fbm( this._times[ 2 ], this._positionFractalLevel )
            );

            // Apply scale and amplitude to position noise
            positionNoise.multiply( this._positionScale )
                .multiplyScalar( this._positionAmplitude * BrownianMotion.FBM_NORM );

            // Update the position based on noise
            this._position.copy( positionNoise );
        }

        if ( this._enableRotationNoise ) {
            // Update time values for rotation noise
            for ( let axis = 0; axis < 3; axis++ ) {
                this._times[ axis + 3 ] += this._rotationFrequency * timeStep;
            }

            // Calculate rotation noise
            const rotationNoise = new THREE.Vector3(
                this._fbm( this._times[ 3 ], this._rotationFractalLevel ),
                this._fbm( this._times[ 4 ], this._rotationFractalLevel ),
                this._fbm( this._times[ 5 ], this._rotationFractalLevel )
            );

            // Apply scale and amplitude to rotation noise
            rotationNoise.multiply( this._rotationScale )
                .multiplyScalar( this._rotationAmplitude * BrownianMotion.FBM_NORM );

            // Convert rotation noise to Euler angles and update the rotation
            const rotationEuler = new THREE.Euler( rotationNoise.x, rotationNoise.y, rotationNoise.z );
            this._rotation.setFromEuler( rotationEuler );
        }

        // Update the object's transformation matrix
        this._matrix.compose( this._position, this._rotation, this._scale );
    }

    get positionAmplitude() {
        return this._positionAmplitude
    }

    set positionAmplitude( amplitude ) {
        this._positionAmplitude = amplitude;
    }

    get positionFrequency() {
        return this._positionFrequency
    }

    set positionFrequency( frequency ) {
        this._positionFrequency = frequency;
    }

    get rotationAmplitude() {
        return this._rotationAmplitude
    }

    set rotationAmplitude( amplitude ) {
        this._rotationAmplitude = amplitude
    }

    get rotationFrequency() {
        return this._rotationFrequency
    }

    set rotationFrequency( frequency ) {
        this._rotationFrequency = frequency
    }

    get matrix() {
        return this._matrix
    }

    set matrix( matrix ) {
        this._matrix = matrix
    }
}
