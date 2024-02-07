import Experience from '../Experience.js'
import Environment from './Environment.js'
import Letter from './Letter.js'
import Dust from './Dust.js'
import Terrain from './Terrain.js'

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
            //this.letter = new Letter()
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

    }

    update()
    {
        this.dust && this.dust.update()
        this.terrain && this.terrain.update()
    }
}
