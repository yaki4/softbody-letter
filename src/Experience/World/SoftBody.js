import * as THREE from 'three'
import Experience from '../Experience.js'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'

export default class SoftBody {
    container = new THREE.Object3D;
    numSubsteps = 3;
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
        this.properties.pointsGeometry = this.resources.items.e2ParticlesModel.scene.children[0].geometry

        // // Создаём пустую буферную геометрию
        // let combinedGeometry = new THREE.BufferGeometry();
        //
        // let positions = [];
        // let dist = [];
        //
        // // particles layers
        // const meshes = this.resources.items.e2ParticlesModel.scene.children
        //
        // // sort by name property
        // meshes.sort((a, b) => a.name - b.name);
        //
        // meshes.forEach((mesh, index) => {
        //
        //     // if (index > 3) {
        //     //     //return;
        //     // }
        //
        //     let geometry = mesh.geometry;
        //     // Получаем позиции вершин из геометрии
        //     let vertices = geometry.attributes.position.array;
        //
        //     // Добавляем вершины в общий массив
        //     positions.push(...vertices);
        //
        //     // Вычисляем значение атрибута dist для этой геометрии
        //     let distValue = (index / 10) + 0.2;
        //
        //     // Для каждой вершины в геометрии добавляем значение dist в массив dists
        //     for (let i = 0; i < vertices.length / 3; i++) { // Делим на 3, потому что каждая вершина представлена 3 числами (x, y, z)
        //         dist.push(distValue);
        //     }
        // });
        //
        // //console.log(dist)
        //
        // // positions to float32 array
        // positions = new Float32Array(positions);
        // dist = new Float32Array(dist);
        //
        //
        //
        // this.properties.pointsGeometry = new THREE.BufferGeometry()
        // this.properties.pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        // this.properties.pointsGeometry.setAttribute('dist', new THREE.BufferAttribute(dist, 1))
        //
        //
        // this.exportedMesh = new THREE.Mesh( this.properties.pointsGeometry, new THREE.MeshBasicMaterial(
        //     {
        //         color: 0x00ff00,
        //     } ) );
        //
        // let exporter = new GLTFExporter();
        // exporter.parse( this.exportedMesh, function ( gltf ) {
        //     console.log( gltf )
        // } );

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
