import * as THREE from 'three'
import Experience from '../Experience.js'

export default class BlueNoise {
    sharedUniforms = {
        u_blueNoiseTexture: { value: null },
        u_blueNoiseLinearTexture: { value: null },
        u_blueNoiseTexelSize: { value: null },
        u_blueNoiseCoordOffset: { value: new THREE.Vector2 }
    };
    TEXTURE_SIZE = 128;

    constructor() {
        this.experience = new Experience()
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.camera = this.experience.camera
        this.renderer = this.experience.renderer.instance
        this.resources = this.experience.resources

        this.preInit()
    }

    preInit() {
        let texture = new THREE.Texture;
        texture.generateMipmaps = false
        texture.minFilter = texture.magFilter = THREE.LinearFilter
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping
        texture.needsUpdate = true

        let ldrTexture = this.resources.items.LDRTexture
        ldrTexture.needsUpdate = true

        texture.image = ldrTexture.image
        ldrTexture.generateMipmaps = false
        ldrTexture.minFilter = ldrTexture.magFilter = THREE.NearestFilter
        ldrTexture.wrapS = ldrTexture.wrapT = THREE.RepeatWrapping
        this.sharedUniforms.u_blueNoiseTexture.value = ldrTexture
        this.sharedUniforms.u_blueNoiseLinearTexture.value = texture
        this.sharedUniforms.u_blueNoiseTexelSize.value = new THREE.Vector2(1 / this.TEXTURE_SIZE, 1 / this.TEXTURE_SIZE)
    }

    update(delta) {
        this.sharedUniforms.u_blueNoiseCoordOffset.value.set(Math.random(), Math.random())
    }
}
