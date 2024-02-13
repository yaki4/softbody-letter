import * as THREE from 'three'
import Experience from '../Experience.js'
import particleSoftBodySim from '../Shaders/SoftBodyParticles/particleSoftBodySim.glsl'

export default class SoftBodyParticles {

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
        this.particlesSim = this.experience.world.particlesSim
    }

    preInit() {
    }

    init() {
        this.computeVisualData()
    }

    postInit() {
        const textureWidth = this.particlesSim.textureSize.x;
        const textureHeight = this.particlesSim.textureSize.y;
        const totalParticles = textureWidth * textureHeight;

        this.particlesDataForTexture = new Float32Array( totalParticles * 4 );
        this.particlesSoftBodyPositionDataTexture = this.fboHelper.createDataTexture( this.particlesDataForTexture, textureWidth, textureHeight, true, true );
        this.positionRenderTarget = this.fboHelper.createRenderTarget( 1, 1, true, true );
        this.positionRenderTarget.setSize( textureWidth, textureHeight );
        this.fboHelper.copy( this.particlesSoftBodyPositionDataTexture, this.positionRenderTarget );
        this.baryWeightsArray = new Float32Array( totalParticles * 4 );
        this.tetsUvX = new Float32Array( totalParticles * 4 );
        this.tetsUvY = new Float32Array( totalParticles * 4 );

        let weightIndex = 0;

        for ( let particleIndex = 0; particleIndex < this.particleCount; particleIndex++ ) {
            const weight1 = this.baryWeights[ weightIndex++ ];
            const weight2 = this.baryWeights[ weightIndex++ ];
            const weight3 = this.baryWeights[ weightIndex++ ];
            const weight4 = 1 - weight1 - weight2 - weight3;

            this.baryWeightsArray[ 4 * particleIndex ] = weight1;
            this.baryWeightsArray[ 4 * particleIndex + 1 ] = weight2;
            this.baryWeightsArray[ 4 * particleIndex + 2 ] = weight3;
            this.baryWeightsArray[ 4 * particleIndex + 3 ] = weight4;

            let tetIndex = this.tetIndices[ particleIndex ] * 4;

            for ( let i = 0; i < 4; i++ ) {
                const tetId = this.softBodyTets.tetIds[ tetIndex ];
                this.tetsUvX[ 4 * particleIndex + i ] = ( tetId % this.softBodyTets.posTextureSize.x + 0.5 ) / this.softBodyTets.posTextureSize.x;
                this.tetsUvY[ 4 * particleIndex + i ] = ( Math.floor( tetId / this.softBodyTets.posTextureSize.x ) + 0.5 ) / this.softBodyTets.posTextureSize.y;
                tetIndex++;
            }
        }

        this.tetsUvXTexture = this.fboHelper.createDataTexture( this.tetsUvX, textureWidth, textureHeight, true, true );
        this.tetsUvYTexture = this.fboHelper.createDataTexture( this.tetsUvY, textureWidth, textureHeight, true, true );
        this.baryWeightsTexture = this.fboHelper.createDataTexture( this.baryWeightsArray, textureWidth, textureHeight, true, true );

        this.softBodyPositionMaterial = new THREE.RawShaderMaterial( {
            uniforms: {
                u_time: this.properties.sharedUniforms.u_time,
                u_deltaTime: this.properties.sharedUniforms.u_deltaTime,
                u_tetsTexture: { value: null },
                u_tetsUvXTexture: { value: this.tetsUvXTexture },
                u_tetsUvYTexture: { value: this.tetsUvYTexture },
                u_tetsTextureSize: { value: new THREE.Vector2() },
                u_baryWeightsTexture: { value: this.baryWeightsTexture }
            },
            vertexShader: this.fboHelper.vertexShader,
            fragmentShader: this.fboHelper.precisionPrefix + particleSoftBodySim
        } );
    }

    computeVisualData() {
        this.particlesPos = this.properties.pointsGeometry.attributes.position.array.slice()
        this.particlesDefaultPos = this.particlesPos.slice()
        this.particleCount = this.particlesPos.length / 3
        this.tetIndices = this.properties.pointsGeometry.attributes.tet.array
        this.baryWeights = this.properties.pointsGeometry.attributes.bary.array
    }

    endFrame( delta ) {
        this.softBodyPositionMaterial.uniforms.u_tetsTexture.value = this.softBodyTets.posTexture
        this.softBodyPositionMaterial.uniforms.u_tetsTextureSize.value.copy( this.softBodyTets.posTextureSize )
        this.fboHelper.render( this.softBodyPositionMaterial, this.positionRenderTarget )
    }
}
