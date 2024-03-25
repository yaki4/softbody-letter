import Stats from 'stats.js'
import { Pane } from 'tweakpane'
import * as THREE from "three";

import Experience from '../Experience.js'

export default class Debug {
    experience = new Experience()
    sizes = this.experience.sizes

    constructor() {
        this.active = window.location.hash === '#debug'

        if ( this.active ) {
            this.panel = new Pane()
            this.panel.containerElem_.style.width = '320px'

            // this.ui = new dat.GUI()
            this.stats = new Stats()
            this.stats.showPanel( 0 );

            document.body.appendChild( this.stats.dom )
        }
    }

    createDebugTexture( texture ) {
        this.debugTexture = texture;
        this.cameraOrtho = new THREE.OrthographicCamera( - this.sizes.width / 2, this.sizes.width / 2, this.sizes.height / 2, - this.sizes.height / 2, 1, 10 );
        this.cameraOrtho.position.z = 10;

        this.sceneOrtho = new THREE.Scene();

        texture.colorSpace = THREE.SRGBColorSpace;

        const material = new THREE.SpriteMaterial( {
            map: texture,
            //blending: THREE.NoBlending
        } );

        const width = 256;
        const height = 256;

        //const width = material.map.image.width;
        //const height = material.map.image.height;

        this.sprite = new THREE.Sprite( material );
        this.sprite.center.set( 0.0, 0.0 );
        this.sprite.scale.set( width, height, 1 );
        this.sceneOrtho.add( this.sprite );

        this.updateSprite();
    }

    updateSprite() {

        const width = this.sizes.width / 2;
        const height = this.sizes.height / 2;

        this.sprite.position.set( - width, - height, 1 ); // bottom left
    }

    update( deltaTime ) {
        if( this.debugTexture ) {
            this.experience?.renderer.instance.render( this.sceneOrtho, this.cameraOrtho );
        }
    }
}
