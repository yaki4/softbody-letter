import * as THREE from 'three'
import Experience from '../Experience.js'

import particlesVert from '../Shaders/Dust/particlesVert.glsl'
import particlesFrag from '../Shaders/Dust/particlesFrag.glsl'

const PARTICLE_COUNT = 1024;

export default class Dust {
    mesh;
    material;

    constructor() {
        this.experience = new Experience()
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.camera = this.experience.camera
        this.renderer = this.experience.renderer.instance
        this.resources = this.experience.resources
        this.sizes = this.experience.sizes

        this.preInit()
    }

    preInit() {
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                u_scale: { value: .02 },
                u_time: { value: 0 },
                u_resolution: new THREE.Uniform(new THREE.Vector2(this.sizes.width, this.sizes.height)),
            },
            vertexShader: particlesVert,
            fragmentShader: particlesFrag,
            depthTest: false,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        })

        this.material.extensions.derivatives = true;

        const dataPosition = new Float32Array(PARTICLE_COUNT * 3);

        for (let i = 0, j = 0; i < PARTICLE_COUNT; i++, j += 3){
            dataPosition[j    ] = 4 * (Math.random() - .5)
            dataPosition[j + 1] = 4 * Math.random() - 1
            dataPosition[j + 2] = .5 - 3.5 * Math.random();
        }

        const dataRandom = new Float32Array(PARTICLE_COUNT * 4);
        for (let i = 0, j = 0; i < PARTICLE_COUNT; i++) {
            dataRandom[j    ] = Math.random()
            dataRandom[j + 1] = Math.random()
            dataRandom[j + 2] = Math.random()
            dataRandom[j + 3] = Math.random()
            j += 4;
        }

        const planeGeometry = new THREE.PlaneGeometry(1, 1, 1, 1)
        const InstancedGeometry = new THREE.InstancedBufferGeometry;
        InstancedGeometry.index = planeGeometry.index;

        for (let attr in planeGeometry.attributes) {
            InstancedGeometry.setAttribute(attr, planeGeometry.attributes[attr]);
        }

        InstancedGeometry.setAttribute("a_instancePosition", new THREE.InstancedBufferAttribute(dataPosition, 3))
        InstancedGeometry.setAttribute("a_random", new THREE.InstancedBufferAttribute(dataRandom, 4))
        this.mesh = new THREE.Mesh(InstancedGeometry, this.material)
        this.mesh.frustumCulled = false
        this.mesh.renderOrder = -1

        this.scene.add(this.mesh)
    }

    resize() {
        this.material.uniforms.u_resolution.value.x = this.sizes.width;
        this.material.uniforms.u_resolution.value.y = this.sizes.height;
    }

    setDebug() {

    }

    update(delta) {
        this.mesh && (this.mesh.material.uniforms.u_time.value += delta)
    }
}
