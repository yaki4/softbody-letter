import * as THREE from 'three'
import Experience from '../Experience.js'
import gsap from "gsap";

import particlesVert from '../Shaders/Dust/particlesVert.glsl'
import particlesFrag from '../Shaders/Dust/particlesFrag.glsl'

const PARTICLE_COUNT = 1024;

export default class Dust {
    mesh;
    material;
    scrollState;

    constructor() {
        this.experience = new Experience()
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.camera = this.experience.camera
        this.renderer = this.experience.renderer.instance
        this.resources = this.experience.resources
        this.sizes = this.experience.sizes

        this.timeline = this.experience.timeline;

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

        for (let r = 0, a = 0; r < PARTICLE_COUNT; r++, a += 3){
            dataPosition[a    ] = 4 * (Math.random() - .5)
            dataPosition[a + 1] = 4 * Math.random() - 1
            dataPosition[a + 2] = .5 - 3.5 * Math.random();
        }

        const dataRandom = new Float32Array(PARTICLE_COUNT * 4);
        for (let r = 0, a = 0; r < PARTICLE_COUNT; r++) {
            dataRandom[a    ] = Math.random()
            dataRandom[a + 1] = Math.random()
            dataRandom[a + 2] = Math.random()
            dataRandom[a + 3] = Math.random()
            a += 4;
        }

        const planeGeometry = new THREE.PlaneGeometry(1, 1, 1, 1)
        const InstancedGeometry = new THREE.InstancedBufferGeometry;
        InstancedGeometry.index = planeGeometry.index;

        for (let r in planeGeometry.attributes) {
            InstancedGeometry.setAttribute(r, planeGeometry.attributes[r]);
        }

        InstancedGeometry.setAttribute("a_instancePosition", new THREE.InstancedBufferAttribute(dataPosition, 3))
        InstancedGeometry.setAttribute("a_random", new THREE.InstancedBufferAttribute(dataRandom, 4))
        this.mesh = new THREE.Mesh(InstancedGeometry, this.material)
        this.mesh.frustumCulled = false
        this.mesh.renderOrder = -1

        this.scene.add(this.mesh)
    }

    resize() {

    }

    setDebug() {

    }

    update(delta) {
        this.mesh && (this.mesh.material.uniforms.u_time.value += delta)
    }
}
