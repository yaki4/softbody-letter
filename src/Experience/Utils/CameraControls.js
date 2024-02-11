import * as THREE from 'three'
import Experience from '../Experience.js'
import gsap from "gsap";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import BrownianMotion from "./BrownianMotion.js";
import MathUtils from './MathUtils.js'
const math = new MathUtils()
import ease from './Ease.js'

import DeviceOrientationControls from './DeviceOrientationControls.js'

export default class CameraControls {
    experience = new Experience()
    debug = this.experience.debug
    scene = this.experience.scene
    time = this.experience.time
    camera = this.experience.camera
    renderer = this.experience.renderer.instance
    resources = this.experience.resources
    fboHelper = this.experience.world.fboHelper
    properties = this.experience.world.properties
    input = this.experience.world.input


    useOrbitControls = true;

    preInit(e) {
        this.DEFAULT_CAMERA_POSITION = new THREE.Vector3(.455, 0, 3.5)
        this.DEFAULT_LOOKAT_POSITION = new THREE.Vector3(.455, 0, 0)
        this._brownianMotion = null, this._orbitControls = null
        this._orbitCamera = null, this._camera = null
        this._deviceOrientationControls = null
        this._baseDeviceControlQuaternion = null
        this._targetDeviceControlQuaternion = null
        this._deviceOrientationCamera = null
        this._hasDeviceOrientationControlValues = !1
        this._q = new THREE.Quaternion
        this._e = new THREE.Euler
        this._v1 = new THREE.Vector3
        this._v2 = new THREE.Vector3
        this._camera = this.properties.camera
        this._camera.position.copy(this.DEFAULT_CAMERA_POSITION)
        this._brownianMotion = new BrownianMotion()

        // Initialize orbit controls if enabled
        if (this.useOrbitControls) {
            this._orbitCamera = this._camera.clone();
            this._orbitControls = new OrbitControls(this._orbitCamera, this.properties.canvas);
            this._orbitControls.enableDamping = true;
            this._orbitControls.target0.copy(this.DEFAULT_LOOKAT_POSITION);
            this._orbitControls.reset();
        }

        // Setup for mobile devices
        if (this.properties.isMobile) {
            this._deviceOrientationCamera = new THREE.Camera();
            this._baseDeviceControlQuaternion = new THREE.Quaternion();
            this._targetDeviceControlQuaternion = new THREE.Quaternion();
            this._deviceOrientationControls = new DeviceOrientationControls(this._deviceOrientationCamera);

            // Connect device orientation controls upon the first click
            this.properties.onFirstClicked.addOnce(() => {
                this._deviceOrientationControls.connect();
            });
        }
    }

    init() {
    }

    resize(e, t) {
    }

    update(e) {
        let t = this._camera;
        if (t.matrix.identity(), t.matrix.decompose(t.position, t.quaternion, t.scale), t.position.copy(this.DEFAULT_CAMERA_POSITION), t.lookAt(this.DEFAULT_LOOKAT_POSITION), this.properties.isMobile && this._deviceOrientationControls.update(), this.useOrbitControls === !0 && (this._orbitControls.update(), this._orbitCamera.updateMatrix(), this._orbitCamera.matrix.decompose(t.position, t.quaternion, t.scale)), this._v1.set(0, 0, -1).applyQuaternion(t.quaternion), this.useOrbitControls === !0 ? this.cameraDistance = this._v2.copy(this._orbitControls.target).sub(t.position).dot(this._v1) : this.cameraDistance = this._v2.copy(this.DEFAULT_LOOKAT_POSITION).sub(t.position).dot(this._v1), t.zoom = this.properties.scaleFactor * math.fit(this.properties.waitlistSectionRatio, 0, .65, 1, .9, ease.cubicInOut), this._q.setFromAxisAngle(this._v1.set(0, 0, 1), math.fit(this.properties.waitlistSectionRatio, 0, .65, 0, .04, ease.cubicInOut)), t.quaternion.multiply(this._q), t.fov = 28, t.updateProjectionMatrix(), this.properties.isMobile) this._deviceOrientationControls.update(), this._deviceOrientationControls.hasValue && (this._hasDeviceOrientationControlValues || (this._targetDeviceControlQuaternion.copy(this._deviceOrientationCamera.quaternion), this._baseDeviceControlQuaternion.copy(this._deviceOrientationCamera.quaternion)), this._targetDeviceControlQuaternion.slerp(this._deviceOrientationCamera.quaternion, .08), this._baseDeviceControlQuaternion.slerp(this._targetDeviceControlQuaternion, .08), this._q.copy(this._baseDeviceControlQuaternion).invert().multiply(this._targetDeviceControlQuaternion), this._hasDeviceOrientationControlValues = !0, t.quaternion.multiply(this._q)); else {
            t.translateZ(this.cameraDistance * -1);
            let i = this.properties.cameraLookStrength;
            i *= math.fit(this.properties.startTime, 0, 2, .2, 1);
            let n = math.clamp(this.input.mouseXY.y, -1, 1) * i, r = math.clamp(-this.input.mouseXY.x, -1, 1) * i;
            this.properties.cameraLookX += (n - this.properties.cameraLookX) * this.properties.cameraLookEaseDamp, this.properties.cameraLookY += (r - this.properties.cameraLookY) * this.properties.cameraLookEaseDamp, this._e.set(this.properties.cameraLookX, this.properties.cameraLookY, 0), this._q.setFromEuler(this._e), t.quaternion.multiply(this._q), t.translateZ(this.cameraDistance)
        }
        t.matrix.compose(t.position, t.quaternion, t.scale), this._brownianMotion.positionAmplitude = this.properties.cameraShakePositionStrength, this._brownianMotion.positionFrequency = this.properties.cameraShakePositionSpeed, this._brownianMotion.rotationAmplitude = this.properties.cameraShakeRotationStrength, this._brownianMotion.rotationFrequency = this.properties.cameraShakeRotationSpeed, this._brownianMotion.update(e), t.matrix.multiply(this._brownianMotion.matrix), t.matrix.decompose(t.position, t.quaternion, t.scale), this.properties.SKIP_ANIMATION || (t.rotation.x += math.fit(this.properties.startTime, 0, 2, .15, 0, ease.cubicOut), t.position.y += math.fit(this.properties.startTime, 0, 2, 1.5, 0, ease.cubicOut), t.position.z += math.fit(this.properties.startTime, 0, 2, -2, 0, ease.cubicOut)), t.updateMatrixWorld(!0), this._v1.set(0, 0, -1).applyQuaternion(t.quaternion), this.useOrbitControls === !0 && (this.properties.cameraDistance = this._v2.copy(this._orbitControls.target).sub(t.position).dot(this._v1))
    }

    update_OLD(e) {
        let t = this._camera;
        // if (t.matrix.identity(), t.matrix.decompose(t.position, t.quaternion, t.scale), t.position.copy(this.DEFAULT_CAMERA_POSITION), t.lookAt(this.DEFAULT_LOOKAT_POSITION), this.properties.isMobile && this._deviceOrientationControls.update(), this.useOrbitControls === !0 && (this._orbitControls.update(), this._orbitCamera.updateMatrix(), this._orbitCamera.matrix.decompose(t.position, t.quaternion, t.scale)), this._v1.set(0, 0, -1).applyQuaternion(t.quaternion), this.useOrbitControls === !0 ? this.cameraDistance = this._v2.copy(this._orbitControls.target).sub(t.position).dot(this._v1) : this.cameraDistance = this._v2.copy(this.DEFAULT_LOOKAT_POSITION).sub(t.position).dot(this._v1), t.zoom = this.properties.scaleFactor * math.fit(this.properties.waitlistSectionRatio, 0, .65, 1, .9, ease.cubicInOut), this._q.setFromAxisAngle(this._v1.set(0, 0, 1), math.fit(this.properties.waitlistSectionRatio, 0, .65, 0, .04, ease.cubicInOut)), t.quaternion.multiply(this._q), t.fov = 28, t.updateProjectionMatrix(), this.properties.isMobile) this._deviceOrientationControls.update(), this._deviceOrientationControls.hasValue && (this._hasDeviceOrientationControlValues || (this._targetDeviceControlQuaternion.copy(this._deviceOrientationCamera.quaternion), this._baseDeviceControlQuaternion.copy(this._deviceOrientationCamera.quaternion)), this._targetDeviceControlQuaternion.slerp(this._deviceOrientationCamera.quaternion, .08), this._baseDeviceControlQuaternion.slerp(this._targetDeviceControlQuaternion, .08), this._q.copy(this._baseDeviceControlQuaternion).invert().multiply(this._targetDeviceControlQuaternion), this._hasDeviceOrientationControlValues = !0, t.quaternion.multiply(this._q)); else {
        //     t.translateZ(this.cameraDistance * -1);
        //     let i = this.properties.cameraLookStrength;
        //     i *= math.fit(this.properties.startTime, 0, 2, .2, 1);
        //     let n = math.clamp(input.mouseXY.y, -1, 1) * i, r = math.clamp(-input.mouseXY.x, -1, 1) * i;
        //     this.properties.cameraLookX += (n - this.properties.cameraLookX) * this.properties.cameraLookEaseDamp, this.properties.cameraLookY += (r - this.properties.cameraLookY) * this.properties.cameraLookEaseDamp, this._e.set(this.properties.cameraLookX, this.properties.cameraLookY, 0), this._q.setFromEuler(this._e), t.quaternion.multiply(this._q), t.translateZ(this.cameraDistance)
        // }

        t.matrix.identity();
        t.matrix.decompose(t.position, t.quaternion, t.scale);

        t.position.copy(this.DEFAULT_CAMERA_POSITION);
        t.lookAt(this.DEFAULT_LOOKAT_POSITION);

        if (this.properties.isMobile) {
            this._deviceOrientationControls.update();
        }

        if (this.useOrbitControls === true) {
            this._orbitControls.update();
            this._orbitCamera.updateMatrix();
            this._orbitCamera.matrix.decompose(t.position, t.quaternion, t.scale);
        }

        // Расчет дистанции камеры
        this._v1.set(0, 0, -1).applyQuaternion(t.quaternion);
        if (this.useOrbitControls === true) {
            this.cameraDistance = this._v2.copy(this._orbitControls.target).sub(t.position).dot(this._v1);
        } else {
            this.cameraDistance = this._v2.copy(this.DEFAULT_LOOKAT_POSITION).sub(t.position).dot(this._v1);
        }

        t.zoom = this.properties.scaleFactor * math.fit(this.properties.waitlistSectionRatio, 0, 0.65, 1, 0.9, ease.cubicInOut);
        this._q.setFromAxisAngle(this._v1.set(0, 0, 1), math.fit(this.properties.waitlistSectionRatio, 0, 0.65, 0, 0.04, ease.cubicInOut));
        t.quaternion.multiply(this._q);

        t.fov = 28;
        t.updateProjectionMatrix();

        if (this.properties.isMobile) {
            this._deviceOrientationControls.update();
            if (this._deviceOrientationControls.hasValue) {
                if (!this._hasDeviceOrientationControlValues) {
                    this._targetDeviceControlQuaternion.copy(this._deviceOrientationCamera.quaternion);
                    this._baseDeviceControlQuaternion.copy(this._deviceOrientationCamera.quaternion);
                }
                this._targetDeviceControlQuaternion.slerp(this._deviceOrientationCamera.quaternion, 0.08);
                this._baseDeviceControlQuaternion.slerp(this._targetDeviceControlQuaternion, 0.08);
                this._q.copy(this._baseDeviceControlQuaternion).invert().multiply(this._targetDeviceControlQuaternion);
                this._hasDeviceOrientationControlValues = true;
                t.quaternion.multiply(this._q);
            }
        } else {
            // Mouse
            t.translateZ(this.cameraDistance * -1);
            let i = this.properties.cameraLookStrength * math.fit(this.properties.startTime, 0, 2, 0.2, 1);
            let n = math.clamp(this.input.mouseXY.y, -1, 1) * i;
            let r = math.clamp(-this.input.mouseXY.x, -1, 1) * i;
            this.properties.cameraLookX += (n - this.properties.cameraLookX) * this.properties.cameraLookEaseDamp;
            this.properties.cameraLookY += (r - this.properties.cameraLookY) * this.properties.cameraLookEaseDamp;
            this._e.set(this.properties.cameraLookX, this.properties.cameraLookY, 0);
            this._q.setFromEuler(this._e);
            t.quaternion.multiply(this._q);
            t.translateZ(this.cameraDistance);
        }

        t.matrix.compose(t.position, t.quaternion, t.scale)
        this._brownianMotion.positionAmplitude = this.properties.cameraShakePositionStrength
        this._brownianMotion.positionFrequency = this.properties.cameraShakePositionSpeed
        this._brownianMotion.rotationAmplitude = this.properties.cameraShakeRotationStrength
        this._brownianMotion.rotationFrequency = this.properties.cameraShakeRotationSpeed
        this._brownianMotion.update(e)
        t.matrix.multiply(this._brownianMotion.matrix)
        t.matrix.decompose(t.position, t.quaternion, t.scale)
        this.properties.SKIP_ANIMATION || (t.rotation.x += math.fit(this.properties.startTime, 0, 2, .15, 0, ease.cubicOut),
        t.position.y += math.fit(this.properties.startTime, 0, 2, 1.5, 0, ease.cubicOut),
        t.position.z += math.fit(this.properties.startTime, 0, 2, -2, 0, ease.cubicOut))
        t.updateMatrixWorld(!0)
        this._v1.set(0, 0, -1).applyQuaternion(t.quaternion)
        this.useOrbitControls === !0 && (this.properties.cameraDistance = this._v2.copy(this._orbitControls.target).sub(t.position).dot(this._v1))

    }
}
