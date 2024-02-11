import * as THREE from 'three'
import Experience from '../Experience.js'
import * as DetectUA from "../Utils/DetectUA.js"
import MinSignal from "min-signal"

const detectUA = DetectUA.default
const userAgent = (navigator.userAgent || navigator.vendor).toLowerCase()
const browserName = detectUA.browser.name;

export default class Properties {
    win = window;
    isSecureConnection = window.location.protocol === "https:";
    //loader = quickLoader$1.create();
    percent = 0;
    easedPercent = 0;
    _isSupportedDevice = false;
    _isSupportedBrowser = false;
    _isSupportedWebGL = false;
    _isSupportedMobileOrientation = false;
    _isSupported = false;
    time = 0;
    deltaTime = 0;
    hasInitialized = false;
    hasStarted = false;
    startTime = 0;
    viewportWidth = 0;
    viewportHeight = 0;
    isMobileWidth = false;
    width = 0;
    height = 0;
    renderer = null;
    scene = null;
    camera = null;
    postprocessing = null;
    resolution = new THREE.Vector2;
    viewportResolution = new THREE.Vector2;
    bgColor = new THREE.Color;
    canvas = null;
    gl = null;
    webglOpts = { antialias: false, alpha: false, xrCompatible: true };
    sharedUniforms = {
        u_cameraDirection: { value: this.cameraDirection },
        u_time: { value: 0 },
        u_deltaTime: { value: 1 },
        u_resolution: { value: this.resolution },
        u_viewportResolution: { value: this.viewportResolution },
        u_bgColor: { value: this.bgColor },
        u_startTime: { value: 0 }
    };
    initCallFuncList = [];
    //changeCamera = new MinSignal$2;
    cameraLookX = 0;
    cameraLookY = 0;
    cameraDistance = 5;
    cameraLookStrength = .05;
    cameraLookEaseDamp = .1;
    cameraShakePositionStrength = .075;
    cameraShakePositionSpeed = .18;
    cameraShakeRotationStrength = .01;
    cameraShakeRotationSpeed = .18;
    cameraDollyZoomFovOffset = 0;
    smaa = null;
    cameraMotionBlur = null;
    msdfPass = null;
    final = null;
    bgColorHex = "#382968";
    opacity = 1;
    bloomAmount = 1.35;
    bloomRadius = .15;
    bloomThreshold = .35;
    bloomSmoothWidth = .5;
    haloWidth = .67;
    haloRGBShift = .015;
    haloStrength = .05;
    haloMaskInner = 0;
    haloMaskOuter = .5;
    vignetteFrom = .4;
    vignetteTo = 2;
    vignetteColorHex = "#000000";
    saturation = 1;
    contrast = 0;
    brightness = 1;
    tintColorHex = "#382968";
    tintOpacity = .05;
    exporterSignal = new MinSignal;
    onFirstClicked = new MinSignal;
    isPreloaderFinished = !1;
    pointsGeometry;
    heroColorHex = "#5c4d8f";
    scaleFactor = 1;
    waitlistSectionRatio = 0;

    // BROWSER
    isMobile = detectUA.isMobile || detectUA.isTablet;
    isDesktop = detectUA.isDesktop;
    device = this.isMobile ? "mobile" : "desktop";
    isAndroid = !!detectUA.isAndroid;
    isIOS = !!detectUA.isiOS;
    isMacOS = !!detectUA.isMacOS;
    isWindows = detectUA.isWindows.version !== null;
    isLinux = userAgent.indexOf("linux") != -1;
    ua = userAgent;
    isEdge = browserName === "Microsoft Edge";
    isIE = browserName === "Internet Explorer";
    isFirefox = browserName === "Firefox";
    isChrome = browserName === "Chrome";
    isOpera = browserName === "Opera";
    isSafari = browserName === "Safari";
    isSupportMSAA = !userAgent.match("version/15.4 ");
    isRetina = window.devicePixelRatio && window.devicePixelRatio >= 1.5;
    devicePixelRatio = window.devicePixelRatio || 1;
    cpuCoreCount = navigator.hardwareConcurrency || 1;
    baseUrl = document.location.origin;
    isIFrame = window.self !== window.top;

    // SETTINGS
    // MODEL_PATH = "assets/models/";
    // IMAGE_PATH = "assets/images/";
    // TEXTURE_PATH = "assets/textures/";
    // AUDIO_PATH = "assets/audios/";
    RENDER_TARGET_FLOAT_TYPE = null;
    DATA_FLOAT_TYPE = null;
    USE_FLOAT_PACKING = false;
    USE_WEBGL2 = true;
    USE_MSAA = false;
    DPR = Math.min(1.5, this.devicePixelRatio) || 1;
    USE_PIXEL_LIMIT = true;
    MAX_PIXEL_COUNT = 2560 * 1440;
    UP_SCALE = 1;
    HIDE_UI = false;
    JUMP_SECTION = "";
    CROSS_ORIGINS = {"https://example.com/": "anonymous"};
    IS_DEV = true;
    LOG = false;
    SKIP_ANIMATION = true;
    LOOK_DEV_MODE = true;

    constructor() {
        this.experience = new Experience()
        this.renderer = this.experience.renderer.instance
        this.scene = this.experience.scene
        this.camera = this.experience.camera.instance
        this.canvas = this.experience.canvas

        this.viewportWidth = window.innerWidth
        this.viewportHeight = window.innerHeight

        this.viewportResolution = new THREE.Vector2(this.viewportWidth, this.viewportHeight)
        this.width = this.viewportWidth
        this.height = this.viewportHeight
    }
}
