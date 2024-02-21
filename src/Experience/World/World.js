import * as THREE from 'three'
import Experience from '../Experience.js'
import Environment from './Environment.js'

import MathUtils from '../utils/MathUtils.js'
import Properties from "./Properties.js";
import BlueNoise from "./BlueNoise.js";
import FboHelper from "./FboHelper.js";
import Bg from './Bg.js'

import Dust from './Dust.js'
import Terrain from './Terrain.js'
import AboutHeroLightField from "./AboutHeroLightField.js";
import Support from "../Utils/Support.js";

import CameraControls from "../Utils/CameraControls.js";
import Input from "../Utils/Input.js";
import SoftBody from "./SoftBody.js";
import SoftBodyTets from "./SoftBodyTets.js";
import SoftBodyParticles from "./SoftBodyParticles.js";
import ParticlesSim from "./ParticlesSim.js";
import SoftBodyInner from "./SoftBodyInner.js";
import InnerPart from "./InnerPart.js";
import Particles from "./Particles.js";

import Letter from "./Letter.js";

export default class World {
    constructor() {
        this.experience = new Experience()
        this.camera = this.experience.camera;
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.html = this.experience.html
        this.sound = this.experience.sound
        this.debug = this.experience.debug.panel

        // Wait for resources
        this.resources.on( 'ready', () => {
            this.experience.time.start = Date.now()
            this.experience.time.elapsed = 0

            // Setup
            window.math = this.math = new MathUtils()
            this.properties = new Properties()
            this.support = new Support()
            this.input = new Input()
            this.cameraControls = new CameraControls()
            this.cameraControls.preInit()
            this.fboHelper = new FboHelper()

            //this.letter = new Letter()

            this.blueNoise = new BlueNoise()
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

            this.bg = new Bg()
            this.dust = new Dust()
            this.terrain = new Terrain()
            this.environment = new Environment()

            this.scene.add( this.terrain.container )
            this.scene.add( this.particles.container )
            this.scene.add( this.softBody.container )
            this.scene.add( this.innerPart.container )

            // Remove preloader
            this.html.preloader.classList.add( "preloaded" );
            this.html.preloader.remove();
            this.html.playButton.remove();

            this.animationPipeline();
        } )
    }

    animationPipeline() {
        // if ( this.text )
        //     this.text.animateTextShow()

        if( this.camera )
            this.camera.animateCameraPosition()
    }

    resize() {
        const viewportWidth = this.properties.viewportWidth = window.innerWidth;
        const viewportHeight = this.properties.viewportHeight = window.innerHeight;

        // Set viewport resolution
        this.properties.viewportResolution.set(viewportWidth, viewportHeight);
        // Update CSS variable for viewport height
        document.documentElement.style.setProperty("--vh", `${viewportHeight * 0.01}px`);

        const upScale = this.properties.UP_SCALE;
        let renderWidth = viewportWidth * this.properties.DPR;
        let renderHeight = viewportHeight * this.properties.DPR;

        // Adjust dimensions based on pixel limit
        if (this.properties.USE_PIXEL_LIMIT && renderWidth * renderHeight > this.properties.MAX_PIXEL_COUNT) {
            const aspectRatio = renderWidth / renderHeight;
            renderHeight = Math.sqrt(this.properties.MAX_PIXEL_COUNT / aspectRatio);
            renderWidth = Math.ceil(renderHeight * aspectRatio);
            renderHeight = Math.ceil(renderHeight);
        }

        // Calculate final dimensions considering upscaling
        this.properties.width = Math.ceil(renderWidth / upScale);
        this.properties.height = Math.ceil(renderHeight / upScale);
        this.properties.resolution.set(this.properties.width, this.properties.height);

        // Detect if viewport width is considered "mobile"
        this.properties.isMobileWidth = viewportWidth <= 812;

        // Update renderer and canvas size
        this.properties.renderer.setSize(renderWidth, renderHeight);
        this.properties.canvas.style.width = `${viewportWidth}px`;
        this.properties.canvas.style.height = `${viewportHeight}px`;

        // Update camera aspect ratio
        this.properties.camera.aspect = this.properties.width / this.properties.height;

        // Resize related components
        this.softBody.resize(renderWidth, renderHeight);
        this.innerPart.resize(renderWidth, renderHeight);
        this.bg.resize(renderWidth, renderHeight);
        this.dust.resize(renderWidth, renderHeight);
        this.terrain.resize(renderWidth, renderHeight);

        // Adjust scale factor for non-square aspect ratios
        this.properties.scaleFactor = this.properties.width < this.properties.height ? this.properties.width / this.properties.height : 1;
    }


    update( delta ) {
        this.input && this.input.update( delta )

        if( this.properties ) {
            this.properties.sharedUniforms.u_time.value += delta
            this.properties.deltaTime = this.properties.sharedUniforms.u_deltaTime.value = delta
            this.properties.startTime = this.experience.time.elapsed
            this.properties.sharedUniforms.u_startTime.value = this.properties.startTime

            this.cameraControls && this.cameraControls.update( delta )
            this.properties.bgColor.setStyle( this.properties.bgColorHex )
            this.properties.renderer.setClearColor( 0, 1 )
        }

        this.blueNoise && this.blueNoise.update( delta )
        this.bg && this.bg.update( delta )
        this.dust && this.dust.update( delta )
        this.terrain && this.terrain.update( delta )

        this.lightField && this.lightField.update( delta )
        this.softBody && this.softBody.update( delta )
        this.innerPart && this.innerPart.update( delta )

        if( this.softBodyParticles && this.softBodyParticles.positionRenderTarget ) {
            this.particles && this.particles.update( delta )
        }

        this.lightField && this.lightField.postUpdate( delta )
        this.terrain && this.terrain.update( delta )


        this.input && this.input.postUpdate( delta )
    }
}
