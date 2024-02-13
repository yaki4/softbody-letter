import * as THREE from 'three'
import Experience from '../Experience.js'
import SecondOrderDynamics from './SecondOrderDynamics.js'
import MathUtils from './MathUtils.js'

const math = new MathUtils()
import normalizeWheel from 'normalize-wheel'
import MinSignal from 'min-signal'

export default class Input {
    onDowned = new MinSignal;
    onMoved = new MinSignal;
    onUped = new MinSignal;
    onClicked = new MinSignal;
    onWheeled = new MinSignal;
    onXScrolled = new MinSignal;
    onYScrolled = new MinSignal;
    wasDown = false;
    isDown = false;
    downTime = 0;
    hasClicked = false;
    hasMoved = false;
    hadMoved = false;
    justClicked = false;
    mouseXY = new THREE.Vector2;
    _prevMouseXY = new THREE.Vector2;
    prevMouseXY = new THREE.Vector2;
    mousePixelXY = new THREE.Vector2;
    _prevMousePixelXY = new THREE.Vector2;
    prevMousePixelXY = new THREE.Vector2;
    downXY = new THREE.Vector2;
    downPixelXY = new THREE.Vector2;
    deltaXY = new THREE.Vector2;
    deltaPixelXY = new THREE.Vector2;
    deltaDownXY = new THREE.Vector2;
    deltaDownPixelXY = new THREE.Vector2;
    deltaDownPixelDistance = 0;
    deltaWheel = 0;
    deltaDragScrollX = 0;
    deltaScrollX = 0;
    deltaDragScrollY = 0;
    deltaScrollY = 0;
    isDragScrollingX = false;
    isDragScrollingY = false;
    isWheelScrolling = false;
    dragScrollXMomentum = 0;
    dragScrollYMomentum = 0;
    dragScrollMomentumMultiplier = 10;
    canDesktopDragScroll = false;
    needsCheckDragScrollDirection = false;
    lastScrollXDirection = 0;
    lastScrollYDirection = 0;
    easedMouseDynamics = {};
    dragScrollDynamic;
    downThroughElems = [];
    currThroughElems = [];
    prevThroughElems = [];
    clickThroughElems = [];

    constructor() {
        this.experience = new Experience()
        this.properties = this.experience.world.properties

        this.preInit()
    }

    preInit() {
        document.addEventListener( "mousedown", this._onDown.bind( this ) )
        document.addEventListener( "touchstart", this._getTouchBound( this, this._onDown ) )
        document.addEventListener( "mousemove", this._onMove.bind( this ) )
        document.addEventListener( "touchmove", this._getTouchBound( this, this._onMove ) )
        document.addEventListener( "mouseup", this._onUp.bind( this ) )
        document.addEventListener( "touchend", this._getTouchBound( this, this._onUp ) )
        document.addEventListener( "wheel", this._onWheel.bind( this ) )
        document.addEventListener( "mousewheel", this._onWheel.bind( this ) )
        this.addEasedInput( "default", 1.35, .5, 1.25 )
        this.dragScrollDynamic = this.addEasedInput( "dragScroll", 2, 1, 1 )
        this.onUped.addOnce( () => {
            this.properties.onFirstClicked.dispatch()
        } )
    }

    init() {
    }

    resize() {
        for ( let key in this.easedMouseDynamics ) {
            this.easedMouseDynamics[ key ].reset();
        }
    }

    update( deltaTime ) {
        for ( let key in this.easedMouseDynamics ) {
            let mouseDynamic = this.easedMouseDynamics[ key ];
            mouseDynamic.target.copy( this.mouseXY );
            mouseDynamic.update( deltaTime );
        }
    }

    addEasedInput( name, dampingRatio = 1.5, frequency = 0.8, mass = 2 ) {
        return this.easedMouseDynamics[ name ] = new SecondOrderDynamics( new THREE.Vector2(), dampingRatio, frequency, mass );
    }

    postUpdate( deltaTime ) {
        this.prevThroughElems.length = 0;
        this.prevThroughElems = this.prevThroughElems.concat( this.currThroughElems );

        this.deltaWheel = 0;
        this.deltaDragScrollX = 0;
        this.deltaDragScrollY = 0;
        this.deltaScrollX = 0;
        this.deltaScrollY = 0;

        this.dragScrollXMomentum = 0;
        this.dragScrollYMomentum = 0;

        this.deltaXY.set( 0, 0 );
        this.deltaPixelXY.set( 0, 0 );

        this.prevMouseXY.copy( this.mouseXY );
        this.prevMousePixelXY.copy( this.mousePixelXY );

        this.hadMoved = this.hasMoved;
        this.wasDown = this.isDown;

        this.justClicked = false;
        this.isWheelScrolling = false;
    }

    _onWheel( event ) {
        let wheelDelta = normalizeWheel( event ).pixelY;
        wheelDelta = math.clamp( wheelDelta, -200, 200 );

        this.deltaWheel += wheelDelta;

        this.deltaScrollX = this.deltaDragScrollX + this.deltaWheel;
        this.deltaScrollY = this.deltaDragScrollY + this.deltaWheel;

        this.lastScrollXDirection = this.deltaWheel > 0 ? 1 : -1;
        this.lastScrollYDirection = this.deltaWheel > 0 ? 1 : -1;

        this.isWheelScrolling = true;

        this.onWheeled.dispatch( event.target );
        this.onXScrolled.dispatch( event.target );
        this.onYScrolled.dispatch( event.target );
    }


    _onDown( event ) {
        this.isDown = true;

        this.downTime = +new Date();

        this.prevThroughElems.length = 0;

        this._setThroughElementsByEvent( event, this.downThroughElems );

        this._getInputXY( event, this.downXY );
        this._getInputPixelXY( event, this.downPixelXY );

        this._prevMouseXY.copy( this.downXY );
        this._prevMousePixelXY.copy( this.downPixelXY );

        this.deltaXY.set( 0, 0 );
        this.deltaPixelXY.set( 0, 0 );

        this._getInputXY( event, this.mouseXY );

        this.dragScrollDynamic.reset( this.mouseXY );

        this.isDragScrollingX = false;
        this.isDragScrollingY = false;

        this.needsCheckDragScrollDirection = false;

        this._onMove( event );

        this.onDowned.dispatch( event );

        this.needsCheckDragScrollDirection = true;
    }

    _onMove( event ) {
        this._getInputXY( event, this.mouseXY );
        this._getInputPixelXY( event, this.mousePixelXY );

        this.deltaXY.copy( this.mouseXY ).sub( this._prevMouseXY );
        this.deltaPixelXY.copy( this.mousePixelXY ).sub( this._prevMousePixelXY );

        this._prevMouseXY.copy( this.mouseXY );
        this._prevMousePixelXY.copy( this.mousePixelXY );

        this.hasMoved = this.deltaXY.length() > 0;

        if ( this.isDown ) {
            this.deltaDownXY.copy( this.mouseXY ).sub( this.downXY );
            this.deltaDownPixelXY.copy( this.mousePixelXY ).sub( this.downPixelXY );
            this.deltaDownPixelDistance = this.deltaDownPixelXY.length();

            if ( this.properties.isMobile || this.canDesktopDragScroll ) {
                if ( this.needsCheckDragScrollDirection ) {
                    this.isDragScrollingX = Math.abs( this.deltaPixelXY.x ) > Math.abs( this.deltaPixelXY.y );
                    this.isDragScrollingY = !this.isDragScrollingX;
                    this.needsCheckDragScrollDirection = false;
                }

                if ( this.isDragScrollingX ) {
                    this.deltaDragScrollX += -this.deltaPixelXY.x;
                    this.deltaScrollX += -this.deltaPixelXY.x + this.deltaWheel;
                    this.lastScrollXDirection = this.deltaDragScrollX > 0 ? 1 : -1;
                    this.onXScrolled.dispatch( event.target );
                }

                if ( this.isDragScrollingY ) {
                    this.deltaDragScrollY += -this.deltaPixelXY.y;
                    this.deltaScrollY += -this.deltaPixelXY.y + this.deltaWheel;
                    this.lastScrollYDirection = this.deltaDragScrollY > 0 ? 1 : -1;
                    this.onYScrolled.dispatch( event.target );
                }
            }
        }

        this._setThroughElementsByEvent( event, this.currThroughElems );

        this.onMoved.dispatch( event );
    }


    _onUp( event ) {
        const deltaX = event.clientX - this.downPixelXY.x;
        const deltaY = event.clientY - this.downPixelXY.y;

        if ( Math.sqrt( deltaX * deltaX + deltaY * deltaY ) < 40 && +new Date - this.downTime < 300 ) {
            this._setThroughElementsByEvent( event, this.clickThroughElems );
            this._getInputXY( event, this.mouseXY );

            this.hasClicked = true;
            this.justClicked = true;

            this.onClicked.dispatch( event );
        }

        this.deltaDownXY.set( 0, 0 );
        this.deltaDownPixelXY.set( 0, 0 );
        this.deltaDownPixelDistance = 0;

        this.dragScrollXMomentum = this.dragScrollDynamic.valueVel.x * this.properties.viewportWidth * this.dragScrollMomentumMultiplier * this.properties.deltaTime;
        this.dragScrollYMomentum = this.dragScrollDynamic.valueVel.y * this.properties.viewportHeight * this.dragScrollMomentumMultiplier * this.properties.deltaTime;

        this.isDown = false;
        this.needsCheckDragScrollDirection = false;

        this.onUped.dispatch( event );
    }


    _getTouchBound( context, callback, preventDefault ) {
        return function ( event ) {
            if ( preventDefault && event.preventDefault ) {
                event.preventDefault();
            }

            callback.call( context, event.changedTouches[ 0 ] || event.touches[ 0 ] );
        }
    }


    _getInputXY( event, outputVector ) {
        outputVector.set(
            ( event.clientX / this.properties.viewportWidth ) * 2 - 1,
            1 - ( event.clientY / this.properties.viewportHeight ) * 2
        );

        return outputVector;
    }

    _getInputPixelXY( event, outputVector ) {
        outputVector.set( event.clientX, event.clientY );
    }

    _setThroughElementsByEvent( event, elementsList ) {
        let currentElement = event.target;
        elementsList.length = 0;
        while ( currentElement.parentNode ) {
            elementsList.push( currentElement );
            currentElement = currentElement.parentNode;
        }
    }

    hasThroughElem( element, listPrefix ) {
        let elements = this[ listPrefix + "ThroughElems" ] || this.currThroughElems;
        for ( let i = elements.length - 1; i >= 0; i-- ) {
            if ( elements[ i ] === element ) return true;
        }
        return false;
    }

    hasThroughElemWithClass( className, listPrefix ) {
        let elements = this[ listPrefix + "ThroughElems" ] || this.currThroughElems;
        for ( let i = elements.length - 1; i >= 0; i-- ) {
            if ( elements[ i ].classList.contains( className ) ) return elements[ i ];
        }
        return null;
    }

}
