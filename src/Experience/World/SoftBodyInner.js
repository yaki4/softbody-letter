import * as THREE from 'three'
import Experience from '../Experience.js'
import Hash from '../utils/Hash.js'

function vecSetZero( a, anr ) {
    anr *= 3;
    a[ anr++ ] = 0.0;
    a[ anr++ ] = 0.0;
    a[ anr ] = 0.0;
}

function vecScale( a, anr, scale ) {
    anr *= 3;
    a[ anr++ ] *= scale;
    a[ anr++ ] *= scale;
    a[ anr ] *= scale;
}

function vecCopy( a, anr, b, bnr ) {
    anr *= 3;
    bnr *= 3;
    a[ anr++ ] = b[ bnr++ ];
    a[ anr++ ] = b[ bnr++ ];
    a[ anr ] = b[ bnr ];
}

function vecAdd( a, anr, b, bnr, scale = 1.0 ) {
    anr *= 3;
    bnr *= 3;
    a[ anr++ ] += b[ bnr++ ] * scale;
    a[ anr++ ] += b[ bnr++ ] * scale;
    a[ anr ] += b[ bnr ] * scale;
}

function vecSetDiff( dst, dnr, a, anr, b, bnr, scale = 1.0 ) {
    dnr *= 3;
    anr *= 3;
    bnr *= 3;
    dst[ dnr++ ] = ( a[ anr++ ] - b[ bnr++ ] ) * scale;
    dst[ dnr++ ] = ( a[ anr++ ] - b[ bnr++ ] ) * scale;
    dst[ dnr ] = ( a[ anr ] - b[ bnr ] ) * scale;
}

function vecLengthSquared( a, anr ) {
    anr *= 3;
    let a0 = a[ anr ], a1 = a[ anr + 1 ], a2 = a[ anr + 2 ];
    return a0 * a0 + a1 * a1 + a2 * a2;
}

function vecDistSquared( a, anr, b, bnr ) {
    anr *= 3;
    bnr *= 3;
    let a0 = a[ anr ] - b[ bnr ], a1 = a[ anr + 1 ] - b[ bnr + 1 ], a2 = a[ anr + 2 ] - b[ bnr + 2 ];
    return a0 * a0 + a1 * a1 + a2 * a2;
}

function vecDot( a, anr, b, bnr ) {
    anr *= 3;
    bnr *= 3;
    return a[ anr ] * b[ bnr ] + a[ anr + 1 ] * b[ bnr + 1 ] + a[ anr + 2 ] * b[ bnr + 2 ];
}

function vecSetCross( a, anr, b, bnr, c, cnr ) {
    anr *= 3;
    bnr *= 3;
    cnr *= 3;
    a[ anr++ ] = b[ bnr + 1 ] * c[ cnr + 2 ] - b[ bnr + 2 ] * c[ cnr + 1 ];
    a[ anr++ ] = b[ bnr + 2 ] * c[ cnr + 0 ] - b[ bnr + 0 ] * c[ cnr + 2 ];
    a[ anr ] = b[ bnr + 0 ] * c[ cnr + 1 ] - b[ bnr + 1 ] * c[ cnr + 0 ];
}

function matGetDeterminant( A ) {
    let a11 = A[ 0 ], a12 = A[ 3 ], a13 = A[ 6 ];
    let a21 = A[ 1 ], a22 = A[ 4 ], a23 = A[ 7 ];
    let a31 = A[ 2 ], a32 = A[ 5 ], a33 = A[ 8 ];
    return a11 * a22 * a33 + a12 * a23 * a31 + a13 * a21 * a32 - a13 * a22 * a31 - a12 * a21 * a33 - a11 * a23 * a32;
}

function matSetMult( A, a, anr, b, bnr ) {
    bnr *= 3;
    var bx = b[ bnr++ ];
    var by = b[ bnr++ ];
    var bz = b[ bnr ];
    vecSetZero( a, anr );
    vecAdd( a, anr, A, 0, bx );
    vecAdd( a, anr, A, 1, by );
    vecAdd( a, anr, A, 2, bz );
}

function matSetInverse( A ) {
    let det = matGetDeterminant( A );
    if ( det == 0.0 ) {
        for ( let i = 0; i < 9; i++ )
            A[ anr + i ] = 0.0;
        return;
    }
    let invDet = 1.0 / det;
    let a11 = A[ 0 ], a12 = A[ 3 ], a13 = A[ 6 ];
    let a21 = A[ 1 ], a22 = A[ 4 ], a23 = A[ 7 ];
    let a31 = A[ 2 ], a32 = A[ 5 ], a33 = A[ 8 ]
    A[ 0 ] = ( a22 * a33 - a23 * a32 ) * invDet;
    A[ 3 ] = -( a12 * a33 - a13 * a32 ) * invDet;
    A[ 6 ] = ( a12 * a23 - a13 * a22 ) * invDet;
    A[ 1 ] = -( a21 * a33 - a23 * a31 ) * invDet;
    A[ 4 ] = ( a11 * a33 - a13 * a31 ) * invDet;
    A[ 7 ] = -( a11 * a23 - a13 * a21 ) * invDet;
    A[ 2 ] = ( a21 * a32 - a22 * a31 ) * invDet;
    A[ 5 ] = -( a11 * a32 - a12 * a31 ) * invDet;
    A[ 8 ] = ( a11 * a22 - a12 * a21 ) * invDet;
}

export default class SoftBodyInner {

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
        this.softBodyTets = this.experience.world.softBodyTets

    }

    preInit() {
        this.geometry = this.resources.items.bufferSolid
        //this.geometry = this.resources.items.cubeTetsModel.scene.children[0].geometry
        this.geometry = this.resources.items.cubeInnerModel.scene.children[0].geometry
        //this.geometry = this.resources.items.suzInnerModel.scene.children[0].geometry

    }


    init() {
        this.computeVisualData()
        // this.tetIndices = this.geometry.attributes.tet.array
        // this.baryWeights = this.geometry.attributes.bary.array

        this.tetIndices = this.tet
        this.baryWeights = this.bary

        this.endFrame()
    }

    computeVisualData() {
        this.numVisVerts = this.geometry.attributes.position.array.length / 3
        this.skinningInfo = new Float32Array( 4 * this.numVisVerts )
        this.tetIds = this.softBodyTets.tetGeometry.userData.tetArray
        this.pos = this.softBodyTets.tetGeometry.attributes.position.array
        this.numTets = this.tetIds.length / 4;

        this.bary = new Float32Array( this.geometry.attributes.position.array.length );
        this.tet = new Float32Array( this.geometry.attributes.position.array.length / 3 );

        this.computeSkinningInfo(this.geometry.attributes.position.array);
    }

    computeSkinningInfo( visVerts ) {
        // create a hash for all vertices of the visual mesh

        var hash = new Hash( 0.05, this.numVisVerts );
        hash.create( visVerts );

        this.skinningInfo.fill( -1.0 );		// undefined

        var minDist = new Float32Array( this.numVisVerts );
        minDist.fill( Number.MAX_VALUE );
        var border = 0.05;

        // each tet searches for containing vertices

        var tetCenter = new Float32Array( 3 );
        var mat = new Float32Array( 9 );
        var bary = new Float32Array( 4 );

        for ( var i = 0; i < this.numTets; i++ ) {

            // compute bounding sphere of tet

            tetCenter.fill( 0.0 );
            for ( var j = 0; j < 4; j++ )
                vecAdd( tetCenter, 0, this.pos, this.tetIds[ 4 * i + j ], 0.25 );

            var rMax = 0.0;
            for ( var j = 0; j < 4; j++ ) {
                var r2 = vecDistSquared( tetCenter, 0, this.pos, this.tetIds[ 4 * i + j ] );
                rMax = Math.max( rMax, Math.sqrt( r2 ) );
            }

            rMax += border;

            hash.query( tetCenter, 0, rMax );
            if ( hash.queryIds.length == 0 )
                continue;

            var id0 = this.tetIds[ 4 * i ];
            var id1 = this.tetIds[ 4 * i + 1 ];
            var id2 = this.tetIds[ 4 * i + 2 ];
            var id3 = this.tetIds[ 4 * i + 3 ];

            vecSetDiff( mat, 0, this.pos, id0, this.pos, id3 );
            vecSetDiff( mat, 1, this.pos, id1, this.pos, id3 );
            vecSetDiff( mat, 2, this.pos, id2, this.pos, id3 );

            matSetInverse( mat );

            for ( var j = 0; j < hash.queryIds.length; j++ ) {
                var id = hash.queryIds[ j ];

                // we already have skinning info

                if ( minDist[ id ] <= 0.0 )
                    continue;

                if ( vecDistSquared( visVerts, id, tetCenter, 0 ) > rMax * rMax )
                    continue;

                // compute barycentric coords for candidate

                vecSetDiff( bary, 0, visVerts, id, this.pos, id3 );
                matSetMult( mat, bary, 0, bary, 0 );
                bary[ 3 ] = 1.0 - bary[ 0 ] - bary[ 1 ] - bary[ 2 ];

                var dist = 0.0;
                for ( var k = 0; k < 4; k++ )
                    dist = Math.max( dist, -bary[ k ] );

                if ( dist < minDist[ id ] ) {
                    minDist[ id ] = dist;
                    this.skinningInfo[ 4 * id ] = i;
                    this.skinningInfo[ 4 * id + 1 ] = bary[ 0 ];
                    this.skinningInfo[ 4 * id + 2 ] = bary[ 1 ];
                    this.skinningInfo[ 4 * id + 3 ] = bary[ 2 ];

                    this.tet[ id ] = i;
                    this.bary[ 3 * id ] = bary[ 0 ];
                    this.bary[ 3 * id + 1 ] = bary[ 1 ];
                    this.bary[ 3 * id + 2 ] = bary[ 2 ];
                }
            }
        }
    }

    endFrame() {
        const positions = this.geometry.attributes.position.array;
        let weightIndex = 0;

        for ( let vertIndex = 0; vertIndex < this.numVisVerts; vertIndex++ ) {
            let tetIndex = this.tetIndices[ vertIndex ] * 4;

            const weight1 = this.baryWeights[ weightIndex++ ]
            const weight2 = this.baryWeights[ weightIndex++ ]
            const weight3 = this.baryWeights[ weightIndex++ ]
            const weight4 = 1 - weight1 - weight2 - weight3

            const tetVertexId1 = this.softBodyTets.tetIds[ tetIndex++ ]
            const tetVertexId2 = this.softBodyTets.tetIds[ tetIndex++ ]
            const tetVertexId3 = this.softBodyTets.tetIds[ tetIndex++ ]
            const tetVertexId4 = this.softBodyTets.tetIds[ tetIndex ]

            vecSetZero( positions, vertIndex );

            vecAdd( positions, vertIndex, this.softBodyTets.pos, tetVertexId1, weight1 );
            vecAdd( positions, vertIndex, this.softBodyTets.pos, tetVertexId2, weight2 );
            vecAdd( positions, vertIndex, this.softBodyTets.pos, tetVertexId3, weight3 );
            vecAdd( positions, vertIndex, this.softBodyTets.pos, tetVertexId4, weight4 );
        }

        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.computeVertexNormals();
    }

}
