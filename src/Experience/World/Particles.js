import * as THREE from 'three'
import Experience from '../Experience.js'

import vert from '../Shaders/Particles/vertex.glsl'
import frag from '../Shaders/Particles/fragment.glsl'
import LightfieldVert from '../Shaders/Particles/LightfieldVert.glsl'
import LightfieldFrag from '../Shaders/Particles/LightfieldFrag.glsl'


export default class Particles {
    container = new THREE.Object3D;
    particlesMesh;
    particlesGeometry;
    particleSize = .0135; //.0125
    hasInitialized = false;

    constructor() {
        this.experience = new Experience()
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.camera = this.experience.camera
        this.renderer = this.experience.renderer.instance
        this.resources = this.experience.resources
        this.properties = this.experience.world.properties
        this.particlesSim = this.experience.world.particlesSim
        this.lightField = this.experience.world.lightField
        this.fboHelper = this.experience.world.fboHelper

        this.preInit()
    }

    preInit() {
        this.particlesSim.preInit()
        this.particlesGeometry = this.resources.items.bufferParticlesLD
    }

    init() {
        this.particlesSim.init();

        const textureSizeX = this.particlesSim.textureSize.x
        const textureSizeY = this.particlesSim.textureSize.y
        const particleCount = this.particlesSim.particleCount
        const particlesGeometry = this.particlesGeometry
        const instancedBufferGeometry = new THREE.InstancedBufferGeometry

        instancedBufferGeometry.index = particlesGeometry.index;

        for ( let attr in particlesGeometry.attributes ) {
            instancedBufferGeometry.setAttribute( attr, particlesGeometry.attributes[ attr ] );
        }

        const dataSimUv = new Float32Array( particleCount * 2 ); // a
        for ( let i = 0, j = 0; i < particleCount; i++, j += 2 ) {
            dataSimUv[ j ] = ( i % textureSizeX + .5 ) / textureSizeX
            dataSimUv[ j + 1 ] = ( Math.floor( i / textureSizeX ) + .5 ) / textureSizeY;
        }

        let dataDist = this.properties.pointsGeometry.attributes.dist.array; // l


        instancedBufferGeometry.setAttribute( "a_simUv", new THREE.InstancedBufferAttribute( dataSimUv, 2 ) )
        instancedBufferGeometry.setAttribute( "a_dist", new THREE.InstancedBufferAttribute( dataDist, 1 ) )

        this.particlesMesh = new THREE.Mesh( instancedBufferGeometry, new THREE.ShaderMaterial( {
            uniforms: Object.assign( {
                u_time: this.properties.sharedUniforms.u_time,
                u_currPositionLifeTexture: this.particlesSim.sharedUniforms.u_currPositionLifeTexture,
                u_currVelocityDistTexture: this.particlesSim.sharedUniforms.u_currVelocityDistTexture,
                u_particleSize: { value: this.particleSize },
                u_color: { value: new THREE.Color( this.properties.heroColorHex ) }
            }, this.lightField.sharedUniforms ),
            vertexShader: vert,
            fragmentShader: frag
        } ) )

        this.particlesMesh.renderOrder = 1
        this.particlesMesh.frustumCulled = false
        this.container.add( this.particlesMesh )
        this._initLightFieldMesh( dataSimUv, dataDist )
        this.hasInitialized = true
    }

    _initLightFieldMesh( dataPosition, dataDist ) {
        let geometry = new THREE.BufferGeometry;
        geometry.computeBoundingSphere()

        geometry.setAttribute( "position", new THREE.BufferAttribute( dataPosition, 2 ) )
        geometry.setAttribute( "dist", new THREE.BufferAttribute( dataDist, 1 ) )
        this.lightFieldParticles = new THREE.Points( geometry, this.fboHelper.createRawShaderMaterial( {
            uniforms: Object.assign( {
                u_time: this.properties.sharedUniforms.u_time,
                u_currPositionLifeTexture: this.particlesSim.sharedUniforms.u_currPositionLifeTexture,
                u_currVelocityDistTexture: this.particlesSim.sharedUniforms.u_currVelocityDistTexture,
                u_color: { value: new THREE.Color( this.properties.heroColorHex ) }
            }, this.lightField.sharedUniforms ),
            vertexShader: LightfieldVert,
            fragmentShader: LightfieldFrag,
            blending: THREE.CustomBlending,
            blendEquation: THREE.MaxEquation,
            blendDst: THREE.OneFactor,
            blendSrc: THREE.OneFactor,
            blendEquationAlpha: THREE.MaxEquation,
            blendDstAlpha: THREE.OneFactor,
            blendSrcAlpha: THREE.OneFactor
        } ) )

        this.lightFieldParticles.frustumCulled = false
    }

    resize( width, height ) {
    }

    update( delta ) {
        if( this.hasInitialized ) {
            this.particlesSim.update( delta )
            this.lightField.renderMesh( this.lightFieldParticles )
        }
    }

}
