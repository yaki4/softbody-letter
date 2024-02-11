import * as THREE from 'three'
import Experience from '../Experience.js'
import Environment from './Environment.js'

import MathUtils from '../utils/MathUtils.js'
import Properties from "./Properties.js";
import BlueNoise from "./BlueNoise.js";
import FboHelper from "./FboHelper.js";
import Bg from './Bg.js'
import Letter from './Letter.js'
import Dust from './Dust.js'
import Terrain from './Terrain.js'
import AboutHeroLightField from "./AboutHeroLightField.js";
import Support from "../Utils/Support.js";
import Postprocessing from "../Utils/Postprocessing.js";
import Smaa from "../Utils/Smaa.js";
import Bloom from "../Utils/Bloom.js";
import Blur from "../Utils/Blur.js";
import Final from "../Utils/Final.js";
import CameraControls from "../Utils/CameraControls.js";
import Input from "../Utils/Input.js";
import SoftBody from "./SoftBody.js";
import SoftBodyTets from "./SoftBodyTets.js";
import SoftBodyParticles from "./SoftBodyParticles.js";
import ParticlesSim from "./ParticlesSim.js";
import SoftBodyInner from "./SoftBodyInner.js";
import InnerPart from "./InnerPart.js";
import Particles from "./Particles.js";

const math = new MathUtils()

export default class World
{
    constructor()
    {
        this.experience = new Experience()
        this.camera = this.experience.camera;
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.html = this.experience.html
        this.sound = this.experience.sound
        this.debug = this.experience.debug.panel

        // Wait for resources
        this.resources.on('ready', () =>
        {
            this.experience.time.start = Date.now()
            this.experience.time.elapsed = 0

            // Setup
            this.math = new MathUtils()
            this.properties = new Properties()
            this.support = new Support()
            this.input = new Input()
            this.cameraControls = new CameraControls()
            this.cameraControls.preInit()
            this.fboHelper = new FboHelper()
            this.postprocessing = new Postprocessing()
            this.blueNoise = new BlueNoise()
            this.blur = new Blur()
            // if( (!this.properties.USE_WEBGL2 || !this.properties.USE_MSAA) ) {
            //     this.properties.smaa = new Smaa()
            //     this.properties.smaa.init()
            //
            //     this.properties.smaa.setTextures(this.resources.items.smaaArea, this.resources.items.smaaSearch)
            //     this.properties.postprocessing.queue.push(this.properties.smaa)
            //
            //     //this.properties.smaa && this.properties.smaa.updateTextures()
            // }

            // this.properties.bloom = new Bloom()
            // !this.properties.renderer.extensions.get("OES_texture_float_linear") && !this.properties.renderer.extensions.get("OES_texture_half_float_linear") && (this.properties.bloom.USE_HD = !1)
            // //this.properties.bloom.init()
            // //this.properties.postprocessing.queue.push(this.properties.bloom)
            // this.properties.final = new Final()
            // this.properties.final.init()
            //
            // this.properties.postprocessing.queue.push(this.properties.final)

            this.lightField = new AboutHeroLightField()
            this.softBodyTets = new SoftBodyTets()
            this.particlesSim = new ParticlesSim()
            this.softBodyParticles = new SoftBodyParticles()
            this.softBodyInner = new SoftBodyInner()
            this.softBody = new SoftBody()
            this.innerPart = new InnerPart()
            this.particles = new Particles()



            this.softBody.init()
            this.innerPart.init()
            this.particles.init()
            this.softBody.postInit()

            this.scene.add(this.particles.container)
            this.scene.add(this.softBody.container)
            this.scene.add(this.innerPart.container)

            //this.letter = new Letter()
            this.bg = new Bg()
            this.dust = new Dust()
            this.terrain = new Terrain()
            this.environment = new Environment()
            // Remove preloader
            this.html.preloader.classList.add("preloaded");
            this.html.preloader.remove();
            this.html.playButton.remove();

            this.animationPipeline();
        })
    }

    animationPipeline() {
        // if ( this.text )
        //     this.text.animateTextShow()

        if ( this.camera )
            this.camera.animateCameraPosition()
    }

    resize() {
        let e = this.properties.viewportWidth = window.innerWidth, t = this.properties.viewportHeight = window.innerHeight;
        this.properties.viewportResolution.set(e, window.innerHeight), document.documentElement.style.setProperty("--vh", t * .01 + "px");
        let i = this.properties.UP_SCALE, n = e * this.properties.DPR, r = t * this.properties.DPR;
        if (this.properties.USE_PIXEL_LIMIT === !0 && n * r > this.properties.MAX_PIXEL_COUNT) {
            let a = n / r;
            r = Math.sqrt(this.properties.MAX_PIXEL_COUNT / a), n = Math.ceil(r * a), r = Math.ceil(r)
        }
        this.properties.width = Math.ceil(n / i)
        this.properties.height = Math.ceil(r / i)
        this.properties.resolution.set(this.properties.width, this.properties.height)
        this.properties.isMobileWidth = e <= 812
        //app.resize(n, r)

        this.properties.renderer.setSize(n, r)
        this.properties.canvas.style.width = `${this.properties.viewportWidth}px`
        this.properties.canvas.style.height = `${this.properties.viewportHeight}px`
        this.properties.camera.aspect = this.properties.width / this.properties.height
        // visuals.resize(this.properties.width, this.properties.height),
        this.softBody.resize(n, r)
        this.innerPart.resize(n, r)
        this.bg.resize(n, r)
        this.dust.resize(n, r)
        this.terrain.resize(n, r)

        this.properties.width < this.properties.height ? this.properties.scaleFactor = this.properties.width / this.properties.height : this.properties.scaleFactor = 1
    }

    update(delta)
    {
        this.input && this.input.update(delta)

        if(this.properties) {
            this.properties.sharedUniforms.u_time.value += delta
            this.properties.deltaTime = this.properties.sharedUniforms.u_deltaTime.value = delta
            this.properties.startTime = this.experience.time.elapsed
            this.properties.sharedUniforms.u_startTime.value = this.properties.startTime

            this.cameraControls && this.cameraControls.update(delta)
            this.properties.bgColor.setStyle(this.properties.bgColorHex)
            this.properties.renderer.setClearColor(0, 1)

            // this.properties.bloom.amount = this.properties.bloomAmount
            // this.properties.bloom.radius = this.properties.bloomRadius
            // this.properties.bloom.threshold = this.properties.bloomThreshold
            // this.properties.bloom.smoothWidth = this.properties.bloomSmoothWidth
            // this.properties.bloom.haloWidth = this.properties.haloWidth
            // this.properties.bloom.haloRGBShift = this.properties.haloRGBShift
            // this.properties.bloom.haloStrength = this.properties.haloStrength
            // this.properties.bloom.haloMaskInner = this.properties.haloMaskInner
            // this.properties.bloom.haloMaskOuter = this.properties.haloMaskOuter
            // this.properties.final.vignetteFrom = this.properties.vignetteFrom
            // this.properties.final.vignetteTo = this.properties.vignetteTo
            // this.properties.final.vignetteColor.setStyle(this.properties.vignetteColorHex)
            // this.properties.final.saturation = this.properties.saturation
            // this.properties.final.contrast = this.properties.contrast
            // this.properties.final.brightness = this.properties.brightness
            // this.properties.final.tintColor.setStyle(this.properties.tintColorHex)
            // this.properties.final.tintOpacity = this.properties.tintOpacity
            // this.properties.final.bgColor.setStyle(this.properties.bgColorHex)
            // this.properties.final.opacity = math.fit(this.properties.startTime, 0, 2, 0, 1)
            //this.properties.postprocessing.render(this.properties.scene, this.properties.camera, !0)
            this.properties.renderer.render(this.properties.scene, this.properties.camera)
        }


        this.blueNoise && this.blueNoise.update(delta)
        this.bg && this.bg.update(delta)
        this.dust && this.dust.update(delta)
        this.terrain && this.terrain.update(delta)

        this.lightField && this.lightField.update(delta)
        this.softBody && this.softBody.update(delta)
        this.innerPart && this.innerPart.update(delta)

        if( this.softBodyParticles && this.softBodyParticles.positionRenderTarget ) {
            this.particles && this.particles.update(delta)
        }

        this.lightField && this.lightField.postUpdate(delta)
        this.terrain && this.terrain.update(delta)


        this.input && this.input.postUpdate(delta)
    }
}
