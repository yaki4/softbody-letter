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
            this.blueNoise = new BlueNoise()
            //this.fboHelper = new FboHelper()
            //this.lightField = new AboutHeroLightField()
            //this.letter = new Letter()
            this.bg = new Bg()
            //this.dust = new Dust()
            //this.terrain = new Terrain()
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

    }

    update()
    {
        if(this.properties) {
            this.properties.sharedUniforms.u_time.value += this.experience.time.delta
            this.properties.deltaTime = this.properties.sharedUniforms.u_deltaTime.value = this.experience.time.delta
            this.properties.sharedUniforms.u_startTime.value = this.properties.startTime

            this.properties.bgColor.setStyle(this.properties.bgColorHex)
            this.properties.renderer.setClearColor(this.properties.bgColor, 0)
        }

        //this.lightField && this.lightField.postUpdate()
        this.blueNoise && this.blueNoise.update()

        this.bg && this.bg.update()

        //this.dust && this.dust.update()
        //this.terrain && this.terrain.update()
    }
}
