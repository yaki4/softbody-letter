import * as THREE from 'three'
import Experience from '../Experience.js'
import gsap from "gsap";

export default class Support {
    constructor() {
        this.experience = new Experience()
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.camera = this.experience.camera
        this.renderer = this.experience.renderer.instance
        this.resources = this.experience.resources
        this.properties = this.experience.world.properties

        this.properties.isSupported = this.isSupported()
        this.renderer.context = this.properties.gl
    }

    isSupported() {
        this.properties._isSupportedDevice = !0, this.properties._isSupportedBrowser = (this.properties.isChrome || this.properties.isSafari || this.properties.isEdge || this.properties.isFirefox || this.properties.isOpera) && !this.properties.isIE, this.properties._isSupportedWebGL = this.checkSupportWebGL(), this.properties.isMobile && this.checkSupportMobileOrientation();
        let e = this.properties._isSupportedDevice && this.properties._isSupportedBrowser && this.properties._isSupportedWebGL;
        return e === !1 && this.notSupported(), e
    }

    notSupported() {
        if (!this.properties._isSupportedDevice) {
            this._addNotSupported("device");
            return
        }
        if (!this.properties._isSupportedBrowser) {
            this._addNotSupported("browser");
            return
        }
        if (!this.properties._isSupportedWebGL) {
            this._addNotSupported("webgl");
            return
        }
    }

    checkSupportWebGL() {
        if (!(this.properties.canvas instanceof HTMLCanvasElement)) return !1;
        if (this.properties.USE_WEBGL2 && window.WebGL2RenderingContext) try {
            return this.properties.gl = this.properties.canvas.getContext("webgl2", this.properties.webglOpts), this.properties.RENDER_TARGET_FLOAT_TYPE = THREE.HalfFloatType, this.properties.DATA_FLOAT_TYPE = THREE.FloatType, !0
        } catch (e) {
            return console.error(e), !1
        }
        if (this.properties.USE_WEBGL2 = !1, window.WebGLRenderingContext) try {
            let e = this.properties.gl = this.properties.canvas.getContext("webgl", this.properties.webglOpts) || this.properties.canvas.getContext("experimental-webgl", this.properties.webglOpts);
            if ((e.getExtension("OES_texture_float") || e.getExtension("OES_texture_half_float")) && e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS)) this.properties.RENDER_TARGET_FLOAT_TYPE = this.properties.isIOS || e.getExtension("OES_texture_half_float") ? THREE.HalfFloatType : THREE.FloatType, this.properties.DATA_FLOAT_TYPE = THREE.FloatType; else return this.properties.USE_FLOAT_PACKING = !0, this.properties.RENDER_TARGET_FLOAT_TYPE = this.properties.DATA_FLOAT_TYPE = THREE.UnsignedByteType, !1;
            return !0
        } catch (e) {
            return console.error(e), !1
        }
        return !1
    }

    checkSupportMobileOrientation() {
        const e = window.matchMedia("(orientation: portrait)"), t = i => {
            const n = i.matches ? "portrait" : "landscape";
            n === "portrait" ? this.properties._isSupportedMobileOrientation = !0 : n === "landscape" && (this.properties._isSupportedMobileOrientation = !1), this.properties._isSupported && !this.properties._isSupportedMobileOrientation ? this._addNotSupported("orientation") : this._removeNotSupported("orientation")
        };
        window.addEventListener("load", () => {
            t(e)
        }), e.addEventListener("change", i => {
            t(i)
        })
    }

    _removeNotSupported(e) {
        this.properties._isSupported && document.documentElement.classList.remove("not-supported"), e && document.documentElement.classList.remove(`not-supported--${e}`)
    }

    _addNotSupported(e) {
        document.documentElement.classList.add("not-supported"), e && document.documentElement.classList.add(`not-supported--${e}`)
    }
}
