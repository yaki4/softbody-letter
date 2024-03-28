import * as THREE from 'three'
import Experience from '../Experience.js'
//import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'

function vecScale( vectorArray, vectorIndex, scaleFactor ) {
    vectorIndex *= 3;
    vectorArray[ vectorIndex++ ] *= scaleFactor;
    vectorArray[ vectorIndex++ ] *= scaleFactor;
    vectorArray[ vectorIndex ] *= scaleFactor;
}

function vecCopy( destinationArray, destinationIndex, sourceArray, sourceIndex ) {
    destinationIndex *= 3;
    sourceIndex *= 3;
    destinationArray[ destinationIndex++ ] = sourceArray[ sourceIndex++ ];
    destinationArray[ destinationIndex++ ] = sourceArray[ sourceIndex++ ];
    destinationArray[ destinationIndex ] = sourceArray[ sourceIndex ];
}

function vecAdd( resultArray, resultIndex, sourceArray, sourceIndex, multiplier = 1 ) {
    resultIndex *= 3;
    sourceIndex *= 3;
    resultArray[ resultIndex++ ] += sourceArray[ sourceIndex++ ] * multiplier;
    resultArray[ resultIndex++ ] += sourceArray[ sourceIndex++ ] * multiplier;
    resultArray[ resultIndex ] += sourceArray[ sourceIndex ] * multiplier;
}

function vecSetDiff( resultArray, resultIndex, firstArray, firstIndex, secondArray, secondIndex, multiplier = 1 ) {
    resultIndex *= 3;
    firstIndex *= 3;
    secondIndex *= 3;
    resultArray[ resultIndex++ ] = ( firstArray[ firstIndex++ ] - secondArray[ secondIndex++ ] ) * multiplier;
    resultArray[ resultIndex++ ] = ( firstArray[ firstIndex++ ] - secondArray[ secondIndex++ ] ) * multiplier;
    resultArray[ resultIndex ] = ( firstArray[ firstIndex ] - secondArray[ secondIndex ] ) * multiplier;
}

function vecLengthSquared( vectorArray, vectorIndex ) {
    vectorIndex *= 3;
    let xComponent = vectorArray[ vectorIndex ],
        yComponent = vectorArray[ vectorIndex + 1 ],
        zComponent = vectorArray[ vectorIndex + 2 ];
    return xComponent * xComponent + yComponent * yComponent + zComponent * zComponent;
}

function vecDistSquared( array1, index1, array2, index2 ) {
    index1 *= 3;
    index2 *= 3;
    let diffX = array1[ index1 ] - array2[ index2 ];
    let diffY = array1[ index1 + 1 ] - array2[ index2 + 1 ];
    let diffZ = array1[ index1 + 2 ] - array2[ index2 + 2 ];
    return diffX * diffX + diffY * diffY + diffZ * diffZ;
}

function vecDot( array1, index1, array2, index2 ) {
    index1 *= 3;
    index2 *= 3;
    return array1[ index1 ] * array2[ index2 ] +
        array1[ index1 + 1 ] * array2[ index2 + 1 ] +
        array1[ index1 + 2 ] * array2[ index2 + 2 ];
}

function vecSetCross( resultArray, resultIndex, array1, index1, array2, index2 ) {
    resultIndex *= 3;
    index1 *= 3;
    index2 *= 3;

    resultArray[ resultIndex++ ] = array1[ index1 + 1 ] * array2[ index2 + 2 ] - array1[ index1 + 2 ] * array2[ index2 + 1 ];
    resultArray[ resultIndex++ ] = array1[ index1 + 2 ] * array2[ index2 ] - array1[ index1 ] * array2[ index2 + 2 ];
    resultArray[ resultIndex ] = array1[ index1 ] * array2[ index2 + 1 ] - array1[ index1 + 1 ] * array2[ index2 ];
}

const tempVectorA = new THREE.Vector3
const tempVectorB = new THREE.Vector3
const tempVectorC = new THREE.Vector3

export default class SoftBodyTets {
    container = new THREE.Object3D;
    mouseProj = new THREE.Vector3;
    mouseProjPrev = new THREE.Vector3;
    mouseVel = new THREE.Vector3;
    edgeCompliance = 1;
    volCompliance = 0;
    temp = new Float32Array( 4 * 3 );
    grads = new Float32Array( 4 * 3 );
    volIdOrder = [ [ 1, 3, 2 ], [ 0, 2, 3 ], [ 0, 3, 1 ], [ 0, 1, 2 ] ];

    constructor() {
        this.experience = new Experience()
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.camera = this.experience.camera
        this.renderer = this.experience.renderer.instance
        this.resources = this.experience.resources
        this.properties = this.experience.world.properties
        this.fboHelper = this.experience.world.fboHelper
        this.input = this.experience.world.input

    }

    preInit() {
        // Spline
        this.innerSplineGeometry = this.resources.items.e2InnerModel.scene.children[ 0 ].geometry.clone()

        this.tetGeometry = this.resources.items.e2TetsModel.scene.children[ 0 ].geometry

        // this.tetGeometry = new THREE.BufferGeometry()
        // this.tetGeometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( verts ), 3 ) )
        // this.tetGeometry.setIndex( new THREE.BufferAttribute( new Uint16Array( tetIds ), 1 ) )
        // this.tetGeometry.rotateX( -Math.PI / 2 )

        // this.exportedMesh = new THREE.Mesh( this.tetGeometry, new THREE.MeshBasicMaterial(
        //     {
        //         color: 0x00ff00,
        //         wireframe: true
        //     } ) );
        //
        // let exporter = new GLTFExporter();
        // exporter.parse( this.exportedMesh, function ( gltf ) {
        //     console.log( gltf )
        // } );


        this.points = new THREE.Points( this.tetGeometry, new THREE.PointsMaterial( {
            color: 0x00ff00,
            size: 0.05
        } ) )

        //this.scene.add( this.points )

        //this.tetGeometry.scale( 1, 1, 1 )

        this._onTetsModelLoad()
    }

    _onTetsModelLoad() {
        const uniqueEdges = {};
        const edgeList = [];

        // Iterate over the tetrahedron indices, 4 at a time
        for ( let i = 0; i < this.tetGeometry.index.array.length; i += 4 ) {
            const vertex1 = this.tetGeometry.index.array[ i ],
                vertex2 = this.tetGeometry.index.array[ i + 1 ],
                vertex3 = this.tetGeometry.index.array[ i + 2 ],
                vertex4 = this.tetGeometry.index.array[ i + 3 ];

            // Generate sorted pairs (edges) for each tetrahedron to ensure uniqueness
            const edges = [
                [ vertex1, vertex2 ].sort(),
                [ vertex1, vertex3 ].sort(),
                [ vertex1, vertex4 ].sort(),
                [ vertex2, vertex3 ].sort(),
                [ vertex2, vertex4 ].sort(),
                [ vertex3, vertex4 ].sort()
            ];

            // Store unique edges in an object using a string representation as the key
            edges.forEach( edge => {
                const key = edge.join( "-" );
                uniqueEdges[ key ] = edge;
            } );
        }

        // Convert the unique edges object back into an array
        for ( const key in uniqueEdges ) {
            edgeList.push( uniqueEdges[ key ] );
        }

        // Store the original tetrahedron indices and the unique edge list in the geometry's userData
        this.tetGeometry.userData.tetArray = this.tetGeometry.index.array;
        this.tetGeometry.userData.edgeArray = edgeList;
    }

    init() {
        this.computeTetsData()
        this.computeConstraintsData()
        this.initPhysics()

        const material = new THREE.LineBasicMaterial( { color: 16777215, linewidth: 2 } )

        this.tetMesh = new THREE.LineSegments( this.tetGeometry, material )
        this.container.add( this.tetMesh )
    }

    computeTetsData() {
        this.numParticles = this.tetGeometry.attributes.position.array.length / 3;
        this.numTets = this.tetGeometry.index.array.length / 4;
        this.pos = this.tetGeometry.attributes.position.array;
        this.prevPos = this.tetGeometry.attributes.position.array.slice();
        this.vel = new Float32Array( 3 * this.numParticles );
        this.tetIds = this.tetGeometry.index.array;
        this.edgeIds = this.tetGeometry.userData.edgeArray;
        this.restVol = new Float32Array( this.numTets );
        this.edgeLengths = new Float32Array( this.edgeIds.length / 2 );
        this.invMass = new Float32Array( this.numParticles );

        const textureWidth = Math.ceil( Math.sqrt( this.numParticles ) );
        const textureHeight = Math.ceil( this.numParticles / textureWidth );
        const textureSize = textureWidth * textureHeight;

        this.posTextureSize = new THREE.Vector2( textureWidth, textureHeight );
        this.posTextureArray = new Float32Array( 4 * textureSize );
        this.posTexture = this.fboHelper.createDataTexture( this.posTextureArray, textureWidth, textureHeight, true, true );
    }

    computeConstraintsData() {
        this.numConstraints = this.innerSplineGeometry.attributes.position.array.length / 3;
        this.splinePos = this.innerSplineGeometry.attributes.position.array;
        this.constraintsIndex = new Float32Array( this.numParticles );
        this.staticConstraintsLengths = new Float32Array( this.numParticles );

        for ( let particleIndex = 0; particleIndex < this.numParticles; particleIndex++ ) {
            tempVectorA.fromArray( this.pos, particleIndex * 3 );
            let minDistance = Number.MAX_VALUE;

            for ( let constraintIndex = 0; constraintIndex < this.numConstraints; constraintIndex++ ) {
                tempVectorB.fromArray( this.splinePos, constraintIndex * 3 );
                const distance = tempVectorA.distanceTo( tempVectorB );

                if ( distance < minDistance ) {
                    minDistance = distance;
                    this.constraintsIndex[ particleIndex ] = constraintIndex;
                }
            }
            this.staticConstraintsLengths[ particleIndex ] = minDistance;
        }
    }

    getTetVolume( tetIndex ) {

        // Retrieve the indices of the tetrahedron's vertices
        const vertexIndexA = this.tetIds[ 4 * tetIndex ];
        const vertexIndexB = this.tetIds[ 4 * tetIndex + 1 ];
        const vertexIndexC = this.tetIds[ 4 * tetIndex + 2 ];
        const vertexIndexD = this.tetIds[ 4 * tetIndex + 3 ];

        // Compute vectors from the first vertex to the others
        vecSetDiff( this.temp, 0, this.pos, vertexIndexB, this.pos, vertexIndexA );
        vecSetDiff( this.temp, 1, this.pos, vertexIndexC, this.pos, vertexIndexA );
        vecSetDiff( this.temp, 2, this.pos, vertexIndexD, this.pos, vertexIndexA );

        // Compute the cross product of two of these vectors
        vecSetCross( this.temp, 3, this.temp, 0, this.temp, 1 );

        // Compute the dot product of the cross product with the third vector and divide by 6 to get the volume
        return vecDot( this.temp, 3, this.temp, 2 ) / 6;
    }

    initPhysics() {
        // Initialize inverse mass and rest volume arrays
        this.invMass.fill( 0 );
        this.restVol.fill( 0 );

        // Compute rest volumes and inverse masses for each tetrahedron
        for ( let tetIndex = 0; tetIndex < this.numTets; tetIndex++ ) {
            const volume = this.getTetVolume( tetIndex );

            this.restVol[ tetIndex ] = volume;

            // Compute inverse mass for each vertex of the tetrahedron
            const inverseMassValue = volume > 0 ? 1 / ( volume / 4 ) : 0;
            for ( let vertexOffset = 0; vertexOffset < 4; vertexOffset++ ) {
                const vertexIndex = this.tetIds[ 4 * tetIndex + vertexOffset ];
                this.invMass[ vertexIndex ] += inverseMassValue;
            }
        }

        // Compute lengths for each edge
        for ( let edgeIndex = 0; edgeIndex < this.edgeLengths.length; edgeIndex++ ) {
            const [ vertexIndexA, vertexIndexB ] = this.edgeIds[ edgeIndex ];
            this.edgeLengths[ edgeIndex ] = Math.sqrt( vecDistSquared( this.pos, vertexIndexA, this.pos, vertexIndexB ) );
        }
    }


    updateMouseProj( deltaTime ) {
        if ( !this.properties.isMobile || this.input.isDown ) {
            // Set tempVectorA to the unprojected mouse position in 3D space
            tempVectorA.set( this.input.mouseXY.x, this.input.mouseXY.y, 1 );
            tempVectorA.unproject( this.properties.camera );
            tempVectorA.sub( this.properties.camera.position ).normalize();

            // Set tempVectorB to the direction the camera is facing
            tempVectorB.set( 0, 0, -1 ).applyQuaternion( this.properties.camera.quaternion );

            // Calculate the scale factor to project the point onto the desired camera plane
            const scaleFactor = this.properties.cameraDistance / tempVectorA.dot( tempVectorB );

            // Update the previous mouse projection position
            this.mouseProjPrev.copy( this.mouseProj );

            // Update the current mouse projection position
            this.mouseProj.copy( this.properties.camera.position ).add( tempVectorA.multiplyScalar( scaleFactor ) );

            // On mobile, if the input was not down before, set the previous position to the current one
            if ( this.properties.isMobile && !this.input.wasDown ) {
                this.mouseProjPrev.copy( this.mouseProj );
            }

            // Update the mouse velocity based on the change in projection position
            this.mouseVel.subVectors( this.mouseProj, this.mouseProjPrev ).multiplyScalar( 1 / deltaTime );
        } else {
            // If not on mobile or the input is not down, set the mouse velocity to zero
            this.mouseVel.setScalar( 0 );
        }
    }

    fakeInitialMouseInteraction( deltaTime, interactionType ) {
        let velocityScale = 1;

        if ( interactionType === 0 ) {
            // Set initial and final mouse positions for the first type of interaction
            this.mouseProjPrev.set( 0, -0.7, 0 );
            this.mouseProj.set( 0.35, 0, 0 );
            velocityScale = 0.5;
        } else if ( interactionType === 1 ) {
            // Set initial and final mouse positions for the second type of interaction
            this.mouseProjPrev.set( -0.3, 0.2, 0 );
            this.mouseProj.set( -0.1, 0.4, 0 );
            velocityScale = 1;
        }

        // Calculate mouse velocity based on the change in positions, scaled by velocityScale and adjusted for deltaTime
        this.mouseVel.subVectors( this.mouseProj, this.mouseProjPrev ).multiplyScalar( velocityScale / deltaTime );
    }

    preSolveMouse( deltaTime, interactionStrength ) {
        // Calculate the difference vector between the current and previous mouse positions
        const mouseMovement = tempVectorC.subVectors( this.mouseProj, this.mouseProjPrev );
        const movementMagnitudeSquared = mouseMovement.dot( mouseMovement );

        if ( movementMagnitudeSquared > 0 ) {
            const inverseMagnitudeSquared = 1 / movementMagnitudeSquared;

            for ( let particleIndex = 0; particleIndex < this.numParticles; particleIndex++ ) {
                // Get the position of the current particle
                const particlePosition = tempVectorB.fromArray( this.pos, particleIndex * 3 );
                // Calculate the vector from the previous mouse position to the current particle
                const toParticle = tempVectorA.subVectors( particlePosition, this.mouseProjPrev );

                // Project the toParticle vector onto the mouseMovement vector, and clamp the result between 0 and 1
                const projectionFactor = math.clamp( toParticle.dot( mouseMovement ) * inverseMagnitudeSquared, 0, 1 );
                // Calculate the closest point on the mouseMovement vector to the particle
                const closestPoint = tempVectorB.copy( mouseMovement ).multiplyScalar( projectionFactor );

                // If the particle is within a certain threshold distance from the line of mouse movement
                if ( toParticle.sub( closestPoint ).length() < 0.1 ) {

                    let scalar = 0.25;

                    // if mouse NDC x > 0
                    // if (this.mouseProj.x > 0) {
                    //     scalar = 0.07
                    // }

                    // Scale the mouse velocity and apply it to the particle's velocity
                    const scaledMouseVel = tempVectorA.copy( this.mouseVel ).multiplyScalar( scalar * interactionStrength * math.fit( this.properties.startTime, 0, 1, 0, 1 ) );
                    this.vel[ 3 * particleIndex ] += scaledMouseVel.x;
                    this.vel[ 3 * particleIndex + 1 ] += scaledMouseVel.y;
                    this.vel[ 3 * particleIndex + 2 ] += scaledMouseVel.z;
                }
            }
        }
    }

    preSolve( deltaTime ) {
        for ( let particleIndex = 0; particleIndex < this.numParticles; particleIndex++ ) {
            // Get the constraint position for the current particle from the spline
            const constraintPosition = tempVectorA.fromArray( this.splinePos, this.constraintsIndex[ particleIndex ] * 3 );
            // Get the current position of the particle
            const particlePosition = tempVectorB.fromArray( this.pos, particleIndex * 3 );
            // Calculate the vector from the particle to the constraint position
            const toConstraint = tempVectorC.subVectors( particlePosition, constraintPosition );

            // Retrieve the static constraint length for the current particle
            const staticLength = this.staticConstraintsLengths[ particleIndex ];
            const currentLength = toConstraint.length();

            // If the current length doesn't match the static length, adjust the particle's velocity
            if ( currentLength !== staticLength ) {
                toConstraint.normalize();
                toConstraint.multiplyScalar( ( staticLength - currentLength ) * deltaTime * 80 );
                // Update the velocity based on the constraint correction
                const particleVelocity = tempVectorA.fromArray( this.vel, particleIndex * 3 );
                particleVelocity.add( toConstraint );
                this.vel[ 3 * particleIndex ] = particleVelocity.x;
                this.vel[ 3 * particleIndex + 1 ] = particleVelocity.y;
                this.vel[ 3 * particleIndex + 2 ] = particleVelocity.z;
            }

            // Copy the current position to the previous position for the next iteration
            vecCopy( this.prevPos, particleIndex, this.pos, particleIndex );
            // Update the particle's position based on its velocity
            vecAdd( this.pos, particleIndex, this.vel, particleIndex, deltaTime );
        }
    }

    solve( timeStep ) {
        // Solve edge constraints with specified edge compliance and time step
        this.solveEdges( this.edgeCompliance, timeStep );

        // Solve volume constraints with specified volume compliance and time step
        this.solveVolumes( this.volCompliance, timeStep );
    }

    postSolve( dampingFactor ) {
        // Calculate the damping multiplier using an exponential decay formula
        const dampingMultiplier = math.mix( 1, 0.5, 1 - Math.exp( -10 * dampingFactor ) );

        // Apply the damping multiplier to the velocity of each particle
        for ( let particleIndex = 0; particleIndex < this.numParticles; particleIndex++ ) {
            this.vel[ 3 * particleIndex ] *= dampingMultiplier;     // Dampen X component
            this.vel[ 3 * particleIndex + 1 ] *= dampingMultiplier; // Dampen Y component
            this.vel[ 3 * particleIndex + 2 ] *= dampingMultiplier; // Dampen Z component
        }
    }

    solveEdges( edgeCompliance, timeStep ) {
        const complianceFactor = edgeCompliance / ( timeStep * timeStep );

        for ( let edgeIndex = 0; edgeIndex < this.edgeLengths.length; edgeIndex++ ) {
            const vertexIndexA = this.edgeIds[ edgeIndex ][ 0 ];
            const vertexIndexB = this.edgeIds[ edgeIndex ][ 1 ];
            const inverseMassA = this.invMass[ vertexIndexA ];
            const inverseMassB = this.invMass[ vertexIndexB ];
            const totalInverseMass = inverseMassA + inverseMassB;

            if ( totalInverseMass === 0 ) continue;

            // Calculate the gradient of the edge
            vecSetDiff( this.grads, 0, this.pos, vertexIndexA, this.pos, vertexIndexB );

            const currentLength = Math.sqrt( vecLengthSquared( this.grads, 0 ) );
            if ( currentLength === 0 ) continue;

            // Normalize the gradient
            vecScale( this.grads, 0, 1 / currentLength );

            const restLength = this.edgeLengths[ edgeIndex ];
            const correctionMagnitude = -( currentLength - restLength ) / ( totalInverseMass + complianceFactor );

            // Apply position corrections based on the edge gradient and correction magnitude
            vecAdd( this.pos, vertexIndexA, this.grads, 0, correctionMagnitude * inverseMassA );
            vecAdd( this.pos, vertexIndexB, this.grads, 0, -correctionMagnitude * inverseMassB );
        }
    }

    solveVolumes( volumeCompliance, timeStep ) {
        const complianceFactor = volumeCompliance / ( timeStep * timeStep );

        for ( let tetIndex = 0; tetIndex < this.numTets; tetIndex++ ) {
            let totalInverseMass = 0;

            // Compute gradients for each face of the tetrahedron
            for ( let faceIndex = 0; faceIndex < 4; faceIndex++ ) {
                const vertexIndexA = this.tetIds[ 4 * tetIndex + this.volIdOrder[ faceIndex ][ 0 ] ];
                const vertexIndexB = this.tetIds[ 4 * tetIndex + this.volIdOrder[ faceIndex ][ 1 ] ];
                const vertexIndexC = this.tetIds[ 4 * tetIndex + this.volIdOrder[ faceIndex ][ 2 ] ];

                // Compute vectors for two edges of the face
                vecSetDiff( this.temp, 0, this.pos, vertexIndexB, this.pos, vertexIndexA );
                vecSetDiff( this.temp, 1, this.pos, vertexIndexC, this.pos, vertexIndexA );

                // Compute the gradient (normal) for the face using the cross product
                vecSetCross( this.grads, faceIndex, this.temp, 0, this.temp, 1 );
                // Scale the gradient to get the correct volume contribution
                vecScale( this.grads, faceIndex, 1 / 6 );

                // Accumulate the weighted sum of the squared lengths of the gradients
                totalInverseMass += this.invMass[ this.tetIds[ 4 * tetIndex + faceIndex ] ] * vecLengthSquared( this.grads, faceIndex );
            }

            if ( totalInverseMass == 0 ) continue;

            // Compute the volume correction factor
            const currentVolume = this.getTetVolume( tetIndex );
            const restVolume = this.restVol[ tetIndex ];
            const volumeCorrection = -( currentVolume - restVolume ) / ( totalInverseMass + complianceFactor );

            // Apply the volume correction to each vertex of the tetrahedron
            for ( let vertexIndex = 0; vertexIndex < 4; vertexIndex++ ) {
                const globalVertexIndex = this.tetIds[ 4 * tetIndex + vertexIndex ];
                vecAdd( this.pos, globalVertexIndex, this.grads, vertexIndex, volumeCorrection * this.invMass[ globalVertexIndex ] );
            }
        }
    }

    endFrame( timeStep ) {
        const positionArray = this.tetMesh.geometry.attributes.position.array;

        // Update the geometry's position array with the latest positions
        for ( let index = 0; index < this.pos.length; index++ ) {
            positionArray[ index ] = this.pos[ index ];
        }
        this.tetMesh.geometry.attributes.position.needsUpdate = true;

        // Update the position texture array with the latest positions and set the fourth component to 1
        for ( let particleIndex = 0; particleIndex < this.numParticles; particleIndex++ ) {
            this.posTextureArray[ 4 * particleIndex ] = this.pos[ 3 * particleIndex ];     // X component
            this.posTextureArray[ 4 * particleIndex + 1 ] = this.pos[ 3 * particleIndex + 1 ]; // Y component
            this.posTextureArray[ 4 * particleIndex + 2 ] = this.pos[ 3 * particleIndex + 2 ]; // Z component
            this.posTextureArray[ 4 * particleIndex + 3 ] = 1; // W component (usually used for alpha or homogeneity)
        }
        this.posTexture.needsUpdate = true;
    }

}
