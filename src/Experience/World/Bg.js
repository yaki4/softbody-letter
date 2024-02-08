import * as THREE from 'three'
import Experience from '../Experience.js'
import gsap from "gsap";


import frag from '../Shaders/Bg/fragment.glsl'
import vert from '../Shaders/Bg/vertex.glsl'

export default class Bg {
    mesh = null;
    colorHex1 = "#635e62";
    colorHex2 = "#334d93";
    colorHex3 = "#fc813d";
    DEFAULT_LOOKAT_POSITION = new THREE.Vector3(.455, 0, 0)

    constructor() {
        this.experience = new Experience()
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.camera = this.experience.camera
        this.renderer = this.experience.renderer.instance
        this.resources = this.experience.resources
        this.properties = this.experience.world.properties
        this.blueNoise = this.experience.world.blueNoise
        this.math = this.experience.world.math

        this.preInit()
    }

    preInit() {
        let plane = new THREE.PlaneGeometry(16, 4);
        this.mesh = new THREE.Mesh(plane, new THREE.ShaderMaterial({
            uniforms: Object.assign({
                u_time: this.properties.sharedUniforms.u_time,
                u_color1: { value: new THREE.Color },
                u_color2: { value: new THREE.Color },
                u_color3: { value: new THREE.Color },
                u_p1: { value: 3 },
                u_p2: { value: 2.11 },
                u_threshold: { value: .312 },
                u_opacity: { value: 0 }
            }, this.blueNoise.sharedUniforms),
            depthWrite: false,
            depthTest: false,
            vertexShader: vert,
            fragmentShader: frag
        }))
        this.mesh.frustumCulled = false
        //this.mesh.renderOrder = -2



        let e = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1).translate(0, -.5, -.5), new THREE.MeshBasicMaterial({
            color: 0,
            blending: THREE.CustomBlending,
            blendEquation: THREE.AddEquation,
            blendSrc: THREE.SrcAlphaFactor,
            blendDst: THREE.OneMinusSrcAlphaFactor,
            blendEquationAlpha: THREE.AddEquation,
            blendSrcAlpha: THREE.ZeroFactor,
            blendDstAlpha: THREE.OneFactor
        }));
        e.position.set(0, -1.05, 1.657583)
        e.scale.set(1e3, 1e3, 2)
        this.scene.add(e);

        this.scene.add(this.mesh)
    }

    init() {
    }

    resize(e, t) {
    }

    update(e) {
        //this.mesh.position.set(cameraControls.DEFAULT_LOOKAT_POSITION.x, 0, -3)
        this.mesh.position.set(this.DEFAULT_LOOKAT_POSITION.x, 0, -3)
        this.mesh.material.uniforms.u_opacity.value = this.math.fit(this.properties.startTime, 0, 2, .3, 1)
        this.mesh.material.uniforms.u_color1.value.setStyle(this.colorHex1).convertSRGBToLinear()
        this.mesh.material.uniforms.u_color2.value.setStyle(this.colorHex2).convertSRGBToLinear()
        this.mesh.material.uniforms.u_color3.value.setStyle(this.colorHex3).convertSRGBToLinear()
    }
}
