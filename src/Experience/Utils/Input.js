import * as THREE from 'three'
import Experience from '../Experience.js'
import gsap from "gsap";
import SecondOrderDynamics from './SecondOrderDynamics.js'
import MathUtils from './MathUtils.js'
const math = new MathUtils()
import normalizeWheel from 'normalize-wheel'
import MinSignal from 'min-signal'

export default class Input   {
    onDowned = new MinSignal;
    onMoved = new MinSignal;
    onUped = new MinSignal;
    onClicked = new MinSignal;
    onWheeled = new MinSignal;
    onXScrolled = new MinSignal;
    onYScrolled = new MinSignal;
    wasDown = !1;
    isDown = !1;
    downTime = 0;
    hasClicked = !1;
    hasMoved = !1;
    hadMoved = !1;
    justClicked = !1;
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
    isDragScrollingX = !1;
    isDragScrollingY = !1;
    isWheelScrolling = !1;
    dragScrollXMomentum = 0;
    dragScrollYMomentum = 0;
    dragScrollMomentumMultiplier = 10;
    canDesktopDragScroll = !1;
    needsCheckDragScrollDirection = !1;
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
        const e = document;
        e.addEventListener("mousedown", this._onDown.bind(this))
        e.addEventListener("touchstart", this._getTouchBound(this, this._onDown))
        e.addEventListener("mousemove", this._onMove.bind(this))
        e.addEventListener("touchmove", this._getTouchBound(this, this._onMove))
        e.addEventListener("mouseup", this._onUp.bind(this))
        e.addEventListener("touchend", this._getTouchBound(this, this._onUp))
        e.addEventListener("wheel", this._onWheel.bind(this))
        e.addEventListener("mousewheel", this._onWheel.bind(this))
        this.addEasedInput("default", 1.35, .5, 1.25)
        this.dragScrollDynamic = this.addEasedInput("dragScroll", 2, 1, 1), this.onUped.addOnce(() => {
            this.properties.onFirstClicked.dispatch()
        })
    }

    init() {
    }

    resize() {
        for (let e in this.easedMouseDynamics) this.easedMouseDynamics[e].reset()
    }

    update(e) {
        for (let t in this.easedMouseDynamics) {
            let i = this.easedMouseDynamics[t];
            i.target.copy(this.mouseXY), i.update(e)
        }
    }

    addEasedInput(e, t = 1.5, i = .8, n = 2) {
        return this.easedMouseDynamics[e] = new SecondOrderDynamics(new THREE.Vector2, t, i, n)
    }

    postUpdate(e) {
        this.prevThroughElems.length = 0, this.prevThroughElems.concat(this.currThroughElems), this.deltaWheel = 0, this.deltaDragScrollX = 0, this.deltaDragScrollY = 0, this.deltaScrollX = 0, this.deltaScrollY = 0, this.dragScrollXMomentum = 0, this.dragScrollYMomentum = 0, this.deltaXY.set(0, 0), this.deltaPixelXY.set(0, 0), this.prevMouseXY.copy(this.mouseXY), this.prevMousePixelXY.copy(this.mousePixelXY), this.hadMoved = this.hasMoved, this.wasDown = this.isDown, this.justClicked = !1, this.isWheelScrolling = !1
    }

    _onWheel(e) {
        let t = normalizeWheel(e).pixelY;
        t = math.clamp(t, -200, 200), this.deltaWheel += t, this.deltaScrollX = this.deltaDragScrollX + this.deltaWheel, this.deltaScrollY = this.deltaDragScrollY + this.deltaWheel, this.lastScrollXDirection = this.deltaWheel > 0 ? 1 : -1, this.lastScrollYDirection = this.deltaWheel > 0 ? 1 : -1, this.isWheelScrolling = !0, this.onWheeled.dispatch(e.target), this.onXScrolled.dispatch(e.target), this.onYScrolled.dispatch(e.target)
    }

    _onDown(e) {
        this.isDown = !0, this.downTime = +new Date, this.prevThroughElems.length = 0, this._setThroughElementsByEvent(e, this.downThroughElems), this._getInputXY(e, this.downXY), this._getInputPixelXY(e, this.downPixelXY), this._prevMouseXY.copy(this.downXY), this._prevMousePixelXY.copy(this.downPixelXY), this.deltaXY.set(0, 0), this.deltaPixelXY.set(0, 0), this._getInputXY(e, this.mouseXY), this.dragScrollDynamic.reset(this.mouseXY), this.isDragScrollingX = !1, this.isDragScrollingY = !1, this.needsCheckDragScrollDirection = !1, this._onMove(e), this.onDowned.dispatch(e), this.needsCheckDragScrollDirection = !0
    }

    _onMove(e) {
        this._getInputXY(e, this.mouseXY), this._getInputPixelXY(e, this.mousePixelXY), this.deltaXY.copy(this.mouseXY).sub(this._prevMouseXY), this.deltaPixelXY.copy(this.mousePixelXY).sub(this._prevMousePixelXY), this._prevMouseXY.copy(this.mouseXY), this._prevMousePixelXY.copy(this.mousePixelXY), this.hasMoved = this.deltaXY.length() > 0, this.isDown && (this.deltaDownXY.copy(this.mouseXY).sub(this.downXY), this.deltaDownPixelXY.copy(this.mousePixelXY).sub(this.downPixelXY), this.deltaDownPixelDistance = this.deltaDownPixelXY.length(), (this.properties.isMobile || this.canDesktopDragScroll) && (this.needsCheckDragScrollDirection && (this.isDragScrollingX = Math.abs(this.deltaPixelXY.x) > Math.abs(this.deltaPixelXY.y), this.isDragScrollingY = !this.isDragScrollingX, this.needsCheckDragScrollDirection = !1), this.isDragScrollingX && (this.deltaDragScrollX += -this.deltaPixelXY.x, this.deltaScrollX += -this.deltaPixelXY.x + this.deltaWheel, this.lastScrollXDirection = this.deltaDragScrollX > 0 ? 1 : -1, this.onXScrolled.dispatch(e.target)), this.isDragScrollingY && (this.deltaDragScrollY += -this.deltaPixelXY.y, this.deltaScrollY += -this.deltaPixelXY.y + this.deltaWheel, this.lastScrollYDirection = this.deltaDragScrollY > 0 ? 1 : -1, this.onYScrolled.dispatch(e.target)))), this._setThroughElementsByEvent(e, this.currThroughElems), this.onMoved.dispatch(e)
    }

    _onUp(e) {
        const t = e.clientX - this.downPixelXY.x, i = e.clientY - this.downPixelXY.y;
        Math.sqrt(t * t + i * i) < 40 && +new Date - this.downTime < 300 && (this._setThroughElementsByEvent(e, this.clickThroughElems), this._getInputXY(e, this.mouseXY), this.hasClicked = !0, this.justClicked = !0, this.onClicked.dispatch(e)), this.deltaDownXY.set(0, 0), this.deltaDownPixelXY.set(0, 0), this.deltaDownPixelDistance = 0, this.dragScrollXMomentum = this.dragScrollDynamic.valueVel.y * this.properties.viewportWidth * this.dragScrollMomentumMultiplier * this.properties.deltaTime, this.dragScrollYMomentum = this.dragScrollDynamic.valueVel.y * this.properties.viewportHeight * this.dragScrollMomentumMultiplier * this.properties.deltaTime, this.isDown = !1, this.needsCheckDragScrollDirection = !1, this.onUped.dispatch(e)
    }

    _getTouchBound(e, t, i) {
        return function (n) {
            i && n.preventDefault && n.preventDefault(), t.call(e, n.changedTouches[0] || n.touches[0])
        }
    }

    _getInputXY(e, t) {
        return t.set(e.clientX / this.properties.viewportWidth * 2 - 1, 1 - e.clientY / this.properties.viewportHeight * 2), t
    }

    _getInputPixelXY(e, t) {
        t.set(e.clientX, e.clientY)
    }

    _setThroughElementsByEvent(e, t) {
        let i = e.target;
        for (t.length = 0; i.parentNode;) t.push(i), i = i.parentNode
    }

    hasThroughElem(e, t) {
        let i = this[t + "ThroughElems"] || this.currThroughElems, n = i.length;
        for (; n--;) if (i[n] === e) return !0;
        return !1
    }

    hasThroughElemWithClass(e, t) {
        let i = this[t + "ThroughElems"] || this.currThroughElems, n = i.length;
        for (; n--;) if (i[n].classList.contains(e)) return i[n];
        return null
    }
}
