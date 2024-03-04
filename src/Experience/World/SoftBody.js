import * as THREE from 'three'
import Experience from '../Experience.js'

export default class SoftBody {
    container = new THREE.Object3D;
    numSubsteps = 5;
    interactiveRatio = 1;
    interactivePattern = 0;
    prevStartTime = 0;
    body;

    constructor() {
        this.experience = new Experience()
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.camera = this.experience.camera
        this.renderer = this.experience.renderer.instance
        this.resources = this.experience.resources
        this.properties = this.experience.world.properties
        this.softBodyTets = this.experience.world.softBodyTets
        this.softBodyParticles = this.experience.world.softBodyParticles
        this.softBodyInner = this.experience.world.softBodyInner

        this.preInit()
    }

    preInit() {
        this.properties.pointsGeometry = this.resources.items.bufferPoints

        //console.log(this.resources.items.cubeParticlesModel.scene.children)

        // merge 7 geometries into one array
        let geom_01 = this.resources.items.cubeParticlesModel.scene.children[0].geometry
        //let geom_01 = this.resources.items.cubeParticlesModel.scene.children[1].geometry
        let geom_02 = this.resources.items.cubeParticlesModel.scene.children[2].geometry
        //let geom_03 = this.resources.items.cubeParticlesModel.scene.children[3].geometry
        let geom_04 = this.resources.items.cubeParticlesModel.scene.children[4].geometry
        let geom_08 = this.resources.items.cubeParticlesModel.scene.children[5].geometry
        let geom_09 = this.resources.items.cubeParticlesModel.scene.children[6].geometry



        let pointsGeometry = new Float32Array(
            geom_01.attributes.position.array.length +
            //geom_01.attributes.position.array.length +
            geom_02.attributes.position.array.length +
            //geom_03.attributes.position.array.length +
            geom_04.attributes.position.array.length +
            geom_08.attributes.position.array.length +
            geom_09.attributes.position.array.length
        )

        let pointsDist = new Float32Array(pointsGeometry.length / 3);

        pointsGeometry.set(geom_01.attributes.position.array, 0);
        //pointsGeometry.set(geom_01.attributes.position.array, geom_01.attributes.position.array.length);
        pointsGeometry.set(geom_02.attributes.position.array, geom_01.attributes.position.array.length);
        //pointsGeometry.set(geom_03.attributes.position.array, geom_01.attributes.position.array.length + geom_02.attributes.position.array.length);
        pointsGeometry.set(geom_04.attributes.position.array, geom_01.attributes.position.array.length + geom_02.attributes.position.array.length);
        pointsGeometry.set(geom_08.attributes.position.array, geom_01.attributes.position.array.length + geom_02.attributes.position.array.length + geom_04.attributes.position.array.length);
        pointsGeometry.set(geom_09.attributes.position.array, geom_01.attributes.position.array.length + geom_02.attributes.position.array.length + geom_04.attributes.position.array.length + geom_08.attributes.position.array.length);

        // array set all to 0
        pointsDist.fill(0.01);
        pointsDist.fill(0.2, geom_01.attributes.position.count);
        pointsDist.fill(0.4, geom_01.attributes.position.count + geom_02.attributes.position.count);
        pointsDist.fill(0.8, geom_01.attributes.position.count + geom_02.attributes.position.count + geom_04.attributes.position.count);
        pointsDist.fill(0.9, geom_01.attributes.position.count + geom_02.attributes.position.count + geom_04.attributes.position.count + geom_08.attributes.position.count);

        this.properties.pointsGeometry = new THREE.BufferGeometry()
        this.properties.pointsGeometry.setAttribute('position', new THREE.BufferAttribute(pointsGeometry, 3))
        this.properties.pointsGeometry.setAttribute('dist', new THREE.BufferAttribute(pointsDist, 1))



        this.softBodyTets.preInit()
        this.softBodyParticles.preInit()
        this.softBodyInner.preInit()
    }

    init() {
        this.softBodyTets.init()
        this.softBodyParticles.init()
        this.softBodyInner.init()
    }

    postInit() {
        this.softBodyParticles.postInit()
    }

    resize( width, height ) {
    }

    update( delta ) {
        const clampedDelta = math.clamp( delta, .011111111111111112, .025 )
        const substepDuration = clampedDelta / this.numSubsteps;

        if (!this.properties.SKIP_ANIMATION) {
            if (this.properties.startTime >= 1 && this.prevStartTime < 1) {
                this.needsFakeMouseInteractive = true;
            } else if (this.properties.startTime >= 1.5 && this.prevStartTime < 1.5) {
                this.needsFakeMouseInteractive = true;
            }
        }

        this.interactiveRatio = math.saturate( this.interactiveRatio + clampedDelta * 10 )
        this.softBodyTets.updateMouseProj( clampedDelta )

        if ( this.needsFakeMouseInteractive ) {
            this.softBodyTets.fakeInitialMouseInteraction( clampedDelta, this.interactivePattern )
            this.interactivePattern = ( this.interactivePattern + 1 ) % 2
        }

        this.softBodyTets.preSolveMouse( clampedDelta, this.interactiveRatio );

        if ( this.needsFakeMouseInteractive ) {
            this.needsFakeMouseInteractive = false
            this.interactiveRatio = 0
        }

        for ( let n = 0; n < this.numSubsteps; n++ ){
            this.softBodyTets.preSolve( substepDuration )
            this.softBodyTets.solve( substepDuration )
            this.softBodyTets.postSolve( substepDuration )
        }

        this.softBodyTets.endFrame( clampedDelta )
        this.softBodyParticles.endFrame( clampedDelta )
        this.softBodyInner.endFrame( clampedDelta )
        this.prevStartTime = this.properties.startTime
    }
}
