import * as THREE from 'three'
import Experience from '../Experience.js'
import { MathUtils } from 'three';

export default class DeviceOrientationControls {
    experience = new Experience()
    debug = this.experience.debug
    scene = this.experience.scene
    time = this.experience.time
    camera = this.experience.camera
    renderer = this.experience.renderer.instance
    resources = this.experience.resources
    properties = this.experience.world.properties

    object = null;
    enabled = true;
    hasValue = false;
    deviceOrientation = {};
    screenOrientation = 0;
    alphaOffset = 0;
    zee = new THREE.Vector3( 0, 0, 1 );
    euler = new THREE.Euler;
    tempQuaternionA = new THREE.Quaternion;
    tempQuaternionB = new THREE.Quaternion( -Math.sqrt( .5 ), 0, 0, Math.sqrt( .5 ) );
    _onBoundDeviceOrientationChangeEvent;
    _onBoundScreenOrientationChangeEvent;

    constructor(targetObject) {
        this.object = targetObject;
        this.object.rotation.reorder("YXZ");

        this._onBoundDeviceOrientationChangeEvent = this._onDeviceOrientationChangeEvent.bind(this);
        this._onBoundScreenOrientationChangeEvent = this._onScreenOrientationChangeEvent.bind(this);
        this.connect();
    }

    _onDeviceOrientationChangeEvent( e ) {
        this.deviceOrientation = e
    }

    _onScreenOrientationChangeEvent() {
        this.screenOrientation = window.orientation || 0
    }

    setObjectQuaternion(quaternion, pitch, yaw, roll, angle) {
        this.euler.set(yaw, pitch, -roll, "YXZ");
        quaternion.setFromEuler(this.euler);
        quaternion.multiply(this.tempQuaternionB);
        quaternion.multiply(this.tempQuaternionA.setFromAxisAngle(this.zee, -angle));
    }

    connect() {
        this._onBoundScreenOrientationChangeEvent();

        if (window.DeviceOrientationEvent !== undefined && typeof window.DeviceOrientationEvent.requestPermission === "function") {
            window.DeviceOrientationEvent.requestPermission().then(permissionResponse => {
                if (permissionResponse === "granted") {
                    window.addEventListener("orientationchange", this._onBoundScreenOrientationChangeEvent, false);
                    window.addEventListener("deviceorientation", this._onBoundDeviceOrientationChangeEvent, false);
                }
            }).catch(error => {

            });
        } else {
            window.addEventListener("orientationchange", this._onBoundScreenOrientationChangeEvent, false);
            window.addEventListener("deviceorientation", this._onBoundDeviceOrientationChangeEvent, false);
        }

        this.enabled = true;
    }


    disconnect() {
        window.removeEventListener( "orientationchange", this._onBoundScreenOrientationChangeEvent, false )
        window.removeEventListener( "deviceorientation", this._onBoundDeviceOrientationChangeEvent, false )
        this.enabled = false
    }

    update() {
        if (this.enabled === false) return;

        let deviceOrientation = this.deviceOrientation;

        if (deviceOrientation) {
            let alphaRadians = deviceOrientation.alpha ? MathUtils.degToRad(deviceOrientation.alpha) + this.alphaOffset : 0;
            let betaRadians = deviceOrientation.beta ? MathUtils.degToRad(deviceOrientation.beta) : 0;
            let gammaRadians = deviceOrientation.gamma ? MathUtils.degToRad(deviceOrientation.gamma) : 0;

            let screenOrientationRadians = this.screenOrientation ? MathUtils.degToRad(this.screenOrientation) : 0;

            this.setObjectQuaternion(this.object.quaternion, alphaRadians, betaRadians, gammaRadians, screenOrientationRadians);

            this.hasValue = this.hasValue || (deviceOrientation.alpha && deviceOrientation.beta && deviceOrientation.gamma);
        }
    }

    dispose() {
        this.disconnect()
    }
}
