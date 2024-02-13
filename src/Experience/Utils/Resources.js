import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import EventEmitter from './EventEmitter.js'

export default class Resources extends EventEmitter {
    constructor( sources ) {
        super()

        this.sources = sources

        this.items = {}
        this.toLoad = this.sources.length
        this.loaded = 0
        this.loadedAll = false

        this.setLoaders()
        this.startLoading()
    }

    setLoaders() {
        this.loaders = {}
        this.loaders.gltfLoader = new GLTFLoader()
        this.loaders.objLoader = new OBJLoader()
        this.loaders.textureLoader = new THREE.TextureLoader()
        this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader()
        this.loaders.RGBELoader = new RGBELoader()
        this.loaders.fontLoader = new FontLoader()
        this.loaders.AudioLoader = new THREE.AudioLoader()
    }

    startLoading() {
        // Load each source
        for ( const source of this.sources ) {
            if ( source.type === 'gltfModel' ) {
                this.loaders.gltfLoader.load(
                    source.path,
                    ( file ) => {
                        this.sourceLoaded( source, file )
                    }
                )
            } else if ( source.type === 'objModel' ) {
                this.loaders.objLoader.load(
                    source.path,
                    ( file ) => {
                        this.sourceLoaded( source, file )
                    }
                )
            } else if ( source.type === 'texture' ) {
                this.loaders.textureLoader.load(
                    source.path,
                    ( file ) => {
                        this.sourceLoaded( source, file )
                    }
                )
            } else if ( source.type === 'cubeTexture' ) {
                this.loaders.cubeTextureLoader.load(
                    source.path,
                    ( file ) => {
                        this.sourceLoaded( source, file )
                    }
                )
            } else if ( source.type === 'rgbeTexture' ) {
                this.loaders.RGBELoader.load(
                    source.path,
                    ( file ) => {
                        this.sourceLoaded( source, file )
                    }
                )
            } else if ( source.type === 'font' ) {
                this.loaders.fontLoader.load(
                    source.path,
                    ( file ) => {
                        this.sourceLoaded( source, file )
                    }
                )
            } else if ( source.type === 'audio' ) {
                this.loaders.AudioLoader.load(
                    source.path,
                    ( file ) => {
                        this.sourceLoaded( source, file )
                    }
                )
            } else if ( source.type === 'bufferGeometry' ) {
                // fetch
                fetch( source.path )
                    .then( response => response.arrayBuffer() )
                    .then( buffer => {
                        const e = buffer;
                        let t = new Uint32Array( e, 0, 1 )[ 0 ],
                            i = JSON.parse( String.fromCharCode.apply( null, new Uint8Array( e, 4, t ) ) ),
                            n = i.vertexCount,
                            r = i.indexCount, a = 4 + t, l = new THREE.BufferGeometry, u = i.attributes, c = !1, f = {};
                        for ( let v = 0, S = u.length; v < S; v++ ) {
                            let g = u[ v ], x = g.id, M = x === "indices" ? r : n, A = g.componentSize,
                                b = window[ g.storageType ],
                                w = new b( e, a, M * A ), C = b.BYTES_PER_ELEMENT, P;
                            if ( g.needsPack ) {
                                let E = g.packedComponents, T = E.length, L = g.storageType.indexOf( "Int" ) === 0,
                                    F = 1 << C * 8,
                                    k = L ? F * .5 : 0, q = 1 / F;
                                P = new Float32Array( M * A );
                                for ( let O = 0, B = 0; O < M; O++ ) for ( let G = 0; G < T; G++ ) {
                                    let J = E[ G ];
                                    P[ B ] = ( w[ B ] + k ) * q * J.delta + J.from, B++
                                }
                            } else f[ x ] = a, P = w;
                            x === "normal" && ( c = !0 ), x === "indices" ? l.setIndex( new THREE.BufferAttribute( P, 1 ) ) : l.setAttribute( x, new THREE.BufferAttribute( P, A ) ), a += M * A * C
                        }
                        let p = i.meshType, _ = [];
                        if ( i.sceneData ) {
                            let v = i.sceneData, S = new THREE.Object3D, g = [],
                                x = p === "Mesh" ? 3 : p === "LineSegments" ? 2 : 1;
                            for ( let M = 0, A = v.length; M < A; M++ ) {
                                let b = v[ M ], w;
                                if ( b.vertexCount == 0 ) w = new THREE.Object3D; else {
                                    let C = new THREE.BufferGeometry, P = l.index, E = P.array, T = E.constructor,
                                        L = T.BYTES_PER_ELEMENT;
                                    C.setIndex( new THREE.BufferAttribute( new E.constructor( E.buffer, b.faceIndex * P.itemSize * L * x + ( f.indices || 0 ), b.faceCount * P.itemSize * x ), P.itemSize ) );
                                    for ( let F = 0, k = C.index.array.length; F < k; F++ ) C.index.array[ F ] -= b.vertexIndex;
                                    for ( let F in l.attributes ) P = l.attributes[ F ], E = P.array, T = E.constructor, L = T.BYTES_PER_ELEMENT, C.setAttribute( F, new THREE.BufferAttribute( new E.constructor( E.buffer, b.vertexIndex * P.itemSize * L + ( f[ F ] || 0 ), b.vertexCount * P.itemSize ), P.itemSize ) );
                                    p === "Mesh" ? w = new THREE.Mesh( C, new THREE.MeshNormalMaterial( { flatShading: !c } ) ) : p === "LineSegments" ? w = new THREE.LineSegments( C, new THREE.LineBasicMaterial ) : w = new THREE.Points( C, new TREEE.PointsMaterial( {
                                        sizeAttenuation: !1,
                                        size: 2
                                    } ) ), g.push( w )
                                }
                                b.parentIndex > -1 ? _[ b.parentIndex ].add( w ) : S.add( w ), w.position.fromArray( b.position ), w.quaternion.fromArray( b.quaternion ), w.scale.fromArray( b.scale ), w.name = b.name, w.userData.material = b.material, _[ M ] = w
                            }
                            l.userData.meshList = g, l.userData.sceneObject = S
                        }

                        this.sourceLoaded( source, l )
                    } )
            }
        }

        if ( this.sources.length === 0 ) {
            setTimeout( () => {
                this.loadedAll = true
                this.trigger( 'ready' )
            } );
        }
    }

    sourceLoaded( source, file ) {
        this.items[ source.name ] = file

        this.loaded++

        if ( this.loaded === this.toLoad ) {
            this.loadedAll = true
            this.trigger( 'ready' )
        }
    }
}
