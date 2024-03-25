import * as THREE from 'three'
import Experience from '../Experience.js'
import gsap from "gsap";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import BrownianMotion from "./BrownianMotion.js";
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

    preInit() {
        this.DEFAULT_CAMERA_POSITION = new THREE.Vector3( 0, 0, 3.0 )
        this.DEFAULT_LOOKAT_POSITION = new THREE.Vector3( 0, 0, 0 )
        this._brownianMotion = null
        this._orbitControls = null
        this._orbitCamera = null
        this._camera = null
        this._deviceOrientationControls = null
        this._baseDeviceControlQuaternion = null
        this._targetDeviceControlQuaternion = null
        this._deviceOrientationCamera = null
        this._hasDeviceOrientationControlValues = false
        this._quaternion = new THREE.Quaternion
        this._euler = new THREE.Euler
        this._vectorA = new THREE.Vector3
        this._vectorB = new THREE.Vector3
        this._camera = this.properties.camera
        this._camera.position.copy( this.DEFAULT_CAMERA_POSITION )
        this._brownianMotion = new BrownianMotion()

        // Initialize orbit controls if enabled
        if ( this.useOrbitControls ) {
            this._orbitCamera = this._camera.clone();
            this._orbitControls = new OrbitControls( this._orbitCamera, this.properties.canvas );
            this._orbitControls.enableDamping = true;
            this._orbitControls.target0.copy( this.DEFAULT_LOOKAT_POSITION );
            this._orbitControls.reset();
        }

        // Setup for mobile devices
        if ( this.properties.isMobile ) {
            this._deviceOrientationCamera = new THREE.Camera();
            this._baseDeviceControlQuaternion = new THREE.Quaternion();
            this._targetDeviceControlQuaternion = new THREE.Quaternion();
            this._deviceOrientationControls = new DeviceOrientationControls( this._deviceOrientationCamera );

            // Connect device orientation controls upon the first click
            this.properties.onFirstClicked.addOnce( () => {
                this._deviceOrientationControls.connect();
            } );
        }
    }

    init() {
    }

    resize( width, height ) {
    }

    update( deltaTime ) {
        let camera = this._camera;

        camera.matrix.identity()
        camera.matrix.decompose( camera.position, camera.quaternion, camera.scale )
        camera.position.copy( this.DEFAULT_CAMERA_POSITION )
        camera.lookAt( this.DEFAULT_LOOKAT_POSITION )

        if ( this.properties.isMobile ) {
            this._deviceOrientationControls.update()
        }

        if ( this.useOrbitControls === true ) {
            this._orbitControls.update()
            this._orbitCamera.updateMatrix()
            this._orbitCamera.matrix.decompose( camera.position, camera.quaternion, camera.scale )
        }

        this._vectorA.set( 0, 0, -1 ).applyQuaternion( camera.quaternion )

        if ( this.useOrbitControls === true ) {
            this.cameraDistance = this._vectorB.copy( this._orbitControls.target ).sub( camera.position ).dot( this._vectorA )
        } else {
            this.cameraDistance = this._vectorB.copy( this.DEFAULT_LOOKAT_POSITION ).sub( camera.position ).dot( this._vectorA )
        }

        camera.zoom = this.properties.scaleFactor * math.fit( this.properties.waitlistSectionRatio, 0, .65, 1, .9, ease.cubicInOut )
        this._quaternion.setFromAxisAngle( this._vectorA.set( 0, 0, 1 ), math.fit( this.properties.waitlistSectionRatio, 0, .65, 0, .04, ease.cubicInOut ) )
        camera.quaternion.multiply( this._quaternion )
        camera.fov = 28
        camera.updateProjectionMatrix()

        if ( this.properties.isMobile ) {
            this._deviceOrientationControls.update()

            if ( this._deviceOrientationControls.hasValue ) {
                if ( !this._hasDeviceOrientationControlValues ) {
                    this._targetDeviceControlQuaternion.copy( this._deviceOrientationCamera.quaternion )
                    this._baseDeviceControlQuaternion.copy( this._deviceOrientationCamera.quaternion )
                }

                this._targetDeviceControlQuaternion.slerp( this._deviceOrientationCamera.quaternion, .08 )
                this._baseDeviceControlQuaternion.slerp( this._targetDeviceControlQuaternion, .08 )
                this._quaternion.copy( this._baseDeviceControlQuaternion ).invert().multiply( this._targetDeviceControlQuaternion )
                this._hasDeviceOrientationControlValues = true
                camera.quaternion.multiply( this._quaternion )
            }
        } else {
            camera.translateZ(this.cameraDistance * -1);

            let cameraLookStrength = this.properties.cameraLookStrength;
            cameraLookStrength *= math.fit(this.properties.startTime, 0, 2, 0.2, 1);

            let verticalLookOffset = math.clamp(this.input.mouseXY.y, -1, 1) * cameraLookStrength;
            let horizontalLookOffset = math.clamp(-this.input.mouseXY.x, -1, 1) * cameraLookStrength;

            this.properties.cameraLookX += (verticalLookOffset - this.properties.cameraLookX) * this.properties.cameraLookEaseDamp;
            this.properties.cameraLookY += (horizontalLookOffset - this.properties.cameraLookY) * this.properties.cameraLookEaseDamp;

            this._euler.set(this.properties.cameraLookX, this.properties.cameraLookY, 0);
            this._quaternion.setFromEuler(this._euler);
            camera.quaternion.multiply(this._quaternion);
            camera.translateZ(this.cameraDistance);
        }

        camera.matrix.compose( camera.position, camera.quaternion, camera.scale )
        this._brownianMotion.positionAmplitude = this.properties.cameraShakePositionStrength
        this._brownianMotion.positionFrequency = this.properties.cameraShakePositionSpeed
        this._brownianMotion.rotationAmplitude = this.properties.cameraShakeRotationStrength
        this._brownianMotion.rotationFrequency = this.properties.cameraShakeRotationSpeed
        this._brownianMotion.update( deltaTime )
        camera.matrix.multiply( this._brownianMotion.matrix )
        camera.matrix.decompose( camera.position, camera.quaternion, camera.scale )

        if ( !this.properties.SKIP_ANIMATION ) {
            camera.rotation.x += math.fit( this.properties.startTime, 0, 2, .15, 0, ease.cubicOut )
            camera.position.y += math.fit( this.properties.startTime, 0, 2, 1.5, 0, ease.cubicOut )
            camera.position.z += math.fit( this.properties.startTime, 0, 2, -2, 0, ease.cubicOut )
        }

        camera.updateMatrixWorld( true )
        this._vectorA.set( 0, 0, -1 ).applyQuaternion( camera.quaternion )

        if ( this.useOrbitControls === true ) {
            this.properties.cameraDistance = this._vectorB.copy( this._orbitControls.target ).sub( camera.position ).dot( this._vectorA )
        } else {
            this.properties.cameraDistance = this._vectorB.copy( this.DEFAULT_LOOKAT_POSITION ).sub( camera.position ).dot( this._vectorA )
        }
    }
}
