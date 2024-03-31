import * as THREE from 'three'
import Experience from '../Experience.js'

import particlesVelocitySim from '../Shaders/ParticlesSim/particlesVelocitySim.glsl'
import particlesPositionSim from '../Shaders/ParticlesSim/particlesPositionSim.glsl'

export default class ParticlesSim {
    textureSize = new THREE.Vector2( 0, 0 );
    particleCount = 0;
    currPositionLifeRenderTarget;
    prevPositionLifeRenderTarget;
    currVelocityLifeRenderTarget;
    prevVelocityLifeRenderTarget;
    geometry;
    positionLifes;
    velocityLifes;
    positionLifesDataTexture;
    velocityLifesDataTexture;
    sharedUniforms = {
        u_time: 0,
        u_deltaTime: { value: 0 },
        u_softBodyTexture: { value: null },
        u_currPositionLifeTexture: { value: null },
        u_prevPositionLifeTexture: { value: null },
        u_currVelocityDistTexture: { value: null },
        u_prevVelocityDistTexture: { value: null },
        u_simTextureSize: { value: this.textureSize }
    };
    hasInit = false;

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
        this.softBodyParticles = this.experience.world.softBodyParticles

        this.sharedUniforms.u_time = this.properties.sharedUniforms.u_time
    }

    preInit() {
        this.currPositionLifeRenderTarget = this.fboHelper.createRenderTarget( 1, 1, true, true )
        this.prevPositionLifeRenderTarget = this.fboHelper.createRenderTarget( 1, 1, true, true )
        this.currVelocityLifeRenderTarget = this.fboHelper.createRenderTarget( 1, 1, true, true )
        this.prevVelocityLifeRenderTarget = this.fboHelper.createRenderTarget( 1, 1, true, true )
    }

    init() {

        let particleCount

        if ( this.properties.isMobile ) {
            particleCount = this.properties.pointsGeometry.attributes.position.array.length / 12
        } else {
            particleCount = this.properties.pointsGeometry.attributes.position.array.length / 3
        }

        const width = Math.ceil( Math.sqrt( particleCount ) )
        const height = Math.ceil( particleCount / width )
        const dataCount = width * height

        this.textureSize.set( width, height )
        this.positionLifes = new Float32Array( dataCount * 4 )
        this.velocityLifes = new Float32Array( dataCount * 4 )
        this.currPositionLifeRenderTarget.setSize( width, height )
        this.prevPositionLifeRenderTarget.setSize( width, height )
        this.currVelocityLifeRenderTarget.setSize( width, height )
        this.prevVelocityLifeRenderTarget.setSize( width, height )
        this.particleCount = particleCount

        for ( let i = 0, j = 0; i < this.particleCount; i++, j += 4 ){
            this.positionLifes[ j ] = 0
            this.positionLifes[ j + 1 ] = 0
            this.positionLifes[ j + 2 ] = 0
            this.positionLifes[ j + 3 ] = 1.1
            this.velocityLifes[ j ] = 0
            this.velocityLifes[ j + 1 ] = 0
            this.velocityLifes[ j + 2 ] = 0

            this.velocityLifes[ j + 3 ] = this.properties.pointsGeometry.attributes.dist.array[ i ]
        }

        this.positionLifesDataTexture = this.fboHelper.createDataTexture( this.positionLifes, width, height, true, true )
        this.velocityLifesDataTexture = this.fboHelper.createDataTexture( this.velocityLifes, width, height, true, true )
        this.fboHelper.copy( this.positionLifesDataTexture, this.currPositionLifeRenderTarget )
        this.fboHelper.copy( this.positionLifesDataTexture, this.prevPositionLifeRenderTarget )
        this.fboHelper.copy( this.velocityLifesDataTexture, this.currVelocityLifeRenderTarget )
        this.velocityMaterial = new THREE.RawShaderMaterial( {
            uniforms: {
                u_time: this.sharedUniforms.u_time,
                u_deltaTime: this.sharedUniforms.u_deltaTime,
                u_velocityDistTexture: this.sharedUniforms.u_currVelocityDistTexture,
                u_positionLifeTexture: this.sharedUniforms.u_currPositionLifeTexture,
                u_prevPositionLifeTexture: this.sharedUniforms.u_prevPositionLifeTexture
            },
            vertexShader: this.fboHelper.vertexShader,
            fragmentShader: this.fboHelper.precisionPrefix + particlesVelocitySim
        } )

        this.positionMaterial = new THREE.RawShaderMaterial( {
            uniforms: {
                u_time: this.sharedUniforms.u_time,
                u_deltaTime: this.sharedUniforms.u_deltaTime,
                u_softBodyTexture: this.sharedUniforms.u_softBodyTexture,
                u_positionLifeTexture: this.sharedUniforms.u_currPositionLifeTexture,
                u_velocityDistTexture: this.sharedUniforms.u_currVelocityDistTexture,
                u_isMobile: { value: this.properties.isMobile }
            },
            vertexShader: this.fboHelper.vertexShader,
            fragmentShader: this.fboHelper.precisionPrefix + particlesPositionSim
        } )

        this.hasInit = true
    }

    resize( width, height ) {
    }

    update( delta ) {
        if( !this.hasInit ) return;
        if( !this.softBodyParticles ) {
            this.softBodyParticles = this.experience.world.softBodyParticles

            return;
        }

        this.sharedUniforms.u_deltaTime.value = math.clamp( delta, 1 / 90, 1 / 40 )
        this.sharedUniforms.u_softBodyTexture.value = this.softBodyParticles.positionRenderTarget.texture
        this.sharedUniforms.u_currPositionLifeTexture.value = this.currPositionLifeRenderTarget.texture
        this.sharedUniforms.u_prevPositionLifeTexture.value = this.prevPositionLifeRenderTarget.texture
        this.sharedUniforms.u_currVelocityDistTexture.value = this.currVelocityLifeRenderTarget.texture
        this.sharedUniforms.u_prevVelocityDistTexture.value = this.prevPositionLifeRenderTarget.texture

        const currPositionLifeRenderTarget = this.currPositionLifeRenderTarget
        this.currPositionLifeRenderTarget = this.prevPositionLifeRenderTarget
        this.prevPositionLifeRenderTarget = currPositionLifeRenderTarget
        const currVelocityLifeRenderTarget = this.currVelocityLifeRenderTarget
        this.currVelocityLifeRenderTarget = this.prevVelocityLifeRenderTarget
        this.prevVelocityLifeRenderTarget = currVelocityLifeRenderTarget

        this.fboHelper.render( this.velocityMaterial, this.currVelocityLifeRenderTarget )
        this.fboHelper.render( this.positionMaterial, this.currPositionLifeRenderTarget )
    }

}
