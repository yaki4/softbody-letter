import * as THREE from 'three'
import Experience from '../Experience.js'
import gsap from "gsap";

import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { ConvexHull } from 'three/addons/math/ConvexHull.js';

function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

export default class Letter {
    constructor() {
        this.experience = new Experience()
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.camera = this.experience.camera
        this.renderer = this.experience.renderer.instance
        this.resources = this.experience.resources

        this.timeline = this.experience.timeline;


        //create cube
        //this.geometry = this.resources.items.bufferParticlesLD;
        this.geometrySplines = this.resources.items.bufferSplines;
        //this.geometry = this.resources.items.bufferTets;
        this.geometryInner = this.resources.items.bufferSolid;
        this.geometry = this.resources.items.bufferPoints;
        // this.geometry.deleteAttribute('bary')
        // this.geometry.deleteAttribute('tet')
        //this.geometry.deleteAttribute('dist')

        console.log(this.geometryInner)


        //this.material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );
        this.material = new THREE.MeshStandardMaterial( {
            color: 0x00ff00,
            roughness: 0.5,
            metalness: 0.5

        })
        this.cube = new THREE.Mesh( this.geometry, this.material );
        //this.scene.add( this.cube );

        // let exporter = new GLTFExporter();
        // exporter.parse( this.cube, function ( gltf ) {
        //     console.log(gltf)
        // } );

        // add directional light
        this.light = new THREE.DirectionalLight( 0xffffff, 1 );
        this.light.position.set( 0, 0, 1 );
        this.scene.add( this.light );


        this.defaultPosition = this.resources.items.bufferPoints.attributes.position.array.slice();
        this.positions = this.resources.items.bufferPoints.attributes.position.array;
        this.innerPositions = this.geometryInner.attributes.position.array;
        //this.innerPositions = this.geometrySplines.attributes.position.array;

        //sort array
        //this.resources.items.bufferPoints.attributes.dist.array.sort((a, b) => a - b);

        //console.log(this.resources.items.bufferPoints.attributes.dist.array)


        //this.defaultPoint = new THREE.Vector3(this.defaultPosition[0], this.defaultPosition[1], this.defaultPosition[2]);
        //this.resources.items.bufferPoints.translate(0, 0, 0.0)
        //this.point = new THREE.Vector3(this.positions[0], this.positions[1], this.positions[2]);

        //
        // let minDist = new Float32Array( this.defaultPosition.length / 3 );
        //
        // let point, pointInner;
        //
        // for ( let i = 0; i < minDist.length; ++i ) {
        //     point = new THREE.Vector3(
        //         this.defaultPosition[ i * 3 ],
        //         this.defaultPosition[ i * 3 + 1 ],
        //         this.defaultPosition[ i * 3 + 2]
        //     )
        //
        //     for ( let j = 0; j < this.innerPositions.length / 3; ++j ) {
        //         pointInner = new THREE.Vector3(
        //             this.innerPositions[ j * 3 ],
        //             this.innerPositions[ j * 3 + 1 ],
        //             this.innerPositions[ j * 3 + 2]
        //         )
        //
        //         if ( j === 0 ) {
        //             minDist[ i ] = point.distanceTo(pointInner);
        //             minDist[ i ] = map_range(minDist[ i ], 0.3, 0.1, 0, 1)
        //         } else {
        //             minDist[ i ] = Math.min(point.distanceTo(pointInner))
        //             minDist[ i ] = map_range(minDist[ i ], 0.3, 0.1, 0, 1)
        //         }
        //     }
        //
        //
        //     //minDist[ i ] = point.distanceTo(pointScale);
        //     //minDist[ i ] = point.normalize().distanceTo(pointScale.normalize());
        // }


        //console.log('minDist', minDist.sort((a, b) => a - b))
        //console.log('minDist', minDist)
        //this.resources.items.bufferPoints.deleteAttribute('dist')
        //this.resources.items.bufferPoints.setAttribute('dist', new THREE.BufferAttribute(minDist, 1))


        //
        // console.log('defaultPoint', this.defaultPoint)
        // console.log('point', this.point)
        //
        // console.log('distance', this.defaultPoint.distanceTo(this.point))


        // let geometry = new THREE.BufferGeometry().setFromPoints(convexHull.vertices);
        // let material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
        // let mesh = new THREE.Mesh(geometry, material);
        // this.scene.add(mesh);



        this.points = new THREE.Points( this.geometry, new THREE.PointsMaterial( {
            color: 0xff0000,
            size: 0.005
        } ));
        this.scene.add( this.points );
        //
        // this.inner = new THREE.Mesh( this.geometryInner, this.material );
        // this.scene.add( this.inner );
    }

    animateTextPosition() {

    }

    resize() {

    }

    setDebug() {

    }

    update() {

    }
}
