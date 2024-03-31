import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Environment {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        this.scene.colorSpace = THREE.LinearSRGBColorSpace
        this.scene.fog = new THREE.FogExp2(0xDFE9F3, 0.0001);
        this.scene.fog.color.setRGB(0.45, 0.8, 1.0, THREE.SRGBColorSpace);

        //this.scene.encoding = THREE.LinearEncoding

        this.setAmbientLight()
        this.setDirectionalLight()

        this.setDebug()
    }

    setAmbientLight() {
        this.ambientLight = new THREE.AmbientLight( '#ffffff', 0.05 )
        this.scene.add( this.ambientLight )
    }

    setDirectionalLight() {
        this.directionalLight = new THREE.DirectionalLight( '#ffffff', 1.5 )
        this.directionalLight.castShadow = true
        this.directionalLight.shadow.mapSize.set( 1024, 1024 )
        this.directionalLight.shadow.camera.far = 15
        this.directionalLight.shadow.normalBias = 0.05
        this.directionalLight.position.set( 0.25, 0.5, 1.0 )
        this.scene.add( this.directionalLight )
    }


    setEnvironmentMap() {

    }

    setDebug() {
        if( this.debug.active ) {

        }
    }
}
