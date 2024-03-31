import * as THREE from 'three'
import Experience from '../Experience.js'
import * as math from '../Utils/math.js';
import Grass from './Grass.js';

function Float32ToFloat16( data ) {
    const data16 = new Uint16Array( data.length );
    for ( let i = 0; i < data.length; i++ ) {
        data16[ i ] = THREE.DataUtils.toHalfFloat( data[ i ] );
    }
    return data16;
}

function GetImageData_( image ) {
    const canvas = document.createElement( 'canvas' );
    canvas.width = image.width;
    canvas.height = image.height;

    const context = canvas.getContext( '2d' );
    context.drawImage( image, 0, 0 );

    return context.getImageData( 0, 0, image.width, image.height );
}

class Heightmap {
    constructor( params, img ) {
        this.params_ = params;
        this.data_ = GetImageData_( img );
    }

    Get( x, y ) {
        const _GetPixelAsFloat = ( x, y ) => {
            const position = ( x + this.data_.width * y ) * 4;
            const data = this.data_.data;
            return data[ position ] / 255.0;
        }

        // Bilinear filter
        const offset = this.params_.offset;
        const dimensions = this.params_.dimensions;

        const xf = math.sat( ( x - offset.x ) / dimensions.x );
        const yf = 1.0 - math.sat( ( y - offset.y ) / dimensions.y );
        const w = this.data_.width - 1;
        const h = this.data_.height - 1;

        const x1 = Math.floor( xf * w );
        const y1 = Math.floor( yf * h );
        const x2 = math.clamp( x1 + 1, 0, w );
        const y2 = math.clamp( y1 + 1, 0, h );

        const xp = xf * w - x1;
        const yp = yf * h - y1;

        const p11 = _GetPixelAsFloat( x1, y1 );
        const p21 = _GetPixelAsFloat( x2, y1 );
        const p12 = _GetPixelAsFloat( x1, y2 );
        const p22 = _GetPixelAsFloat( x2, y2 );

        const px1 = math.lerp( xp, p11, p21 );
        const px2 = math.lerp( xp, p12, p22 );

        return math.lerp( yp, px1, px2 ) * this.params_.height;
    }
}

const TERRAIN_HEIGHT = 3;
const TERRAIN_OFFSET = 2;
const TERRAIN_DIMS = 50;

export default class GenerativeTerrain {
    expirience = new Experience()
    scene = this.expirience.scene
    resources = this.expirience.resources
    renderer = this.expirience.renderer.instance
    debug = this.expirience.debug
    time = this.expirience.time

    #heightmap_ = null

    constructor() {
        // const albedo = this.resources.items.whiteSquareTexture
        // albedo.anisotropy = this.renderer.capabilities.getMaxAnisotropy()
        // albedo.wrapS = THREE.RepeatWrapping;
        // albedo.wrapT = THREE.RepeatWrapping;
        // albedo.colorSpace = THREE.SRGBColorSpace;

        //console.log(albedo)

        const geometry = new THREE.PlaneGeometry( TERRAIN_DIMS, TERRAIN_DIMS, 256, 256 );
        const heightmapTexture = this.resources.items.terrainTexture;


        const heightmapGenerator = new Heightmap( {
            dimensions: new THREE.Vector2( 1.0, 1.0 ),
            offset: new THREE.Vector2( 0.0, 0.0 ),
            height: TERRAIN_HEIGHT
        }, heightmapTexture.image );

        this.#heightmap_ = heightmapGenerator;


        const positions = geometry.attributes.position;
        const uv = geometry.attributes.uv;
        for ( let i = 0; i < positions.count; i++ ) {
            const h = heightmapGenerator.Get( uv.array[ i * 2 + 0 ], uv.array[ i * 2 + 1 ] ) - TERRAIN_OFFSET;
            positions.array[ i * 3 + 2 ] = h;
        }

        geometry.computeVertexNormals();
        geometry.computeTangents();

        const position16 = Float32ToFloat16( geometry.attributes.position.array );
        const normal16 = Float32ToFloat16( geometry.attributes.normal.array );
        const tangent16 = Float32ToFloat16( geometry.attributes.tangent.array );
        const uv16 = Float32ToFloat16( geometry.attributes.uv.array );

        geometry.setAttribute( 'position', new THREE.Float16BufferAttribute( position16, 3 ) );
        geometry.setAttribute( 'normal', new THREE.Float16BufferAttribute( normal16, 3 ) );
        geometry.setAttribute( 'tangent', new THREE.Float16BufferAttribute( tangent16, 3 ) );
        geometry.setAttribute( 'uv', new THREE.Float16BufferAttribute( uv16, 2 ) );
        geometry.rotateX( -Math.PI / 2 );
        geometry.rotateY( -Math.PI / 2 );

        heightmapTexture.colorSpace = THREE.LinearSRGBColorSpace;

        const grid = this.resources.items.gridTexture;
        grid.anisotropy = 16;
        grid.repeat.set( 1, 1 );

        const terrainMaterial = new THREE.MeshStandardMaterial( {
            color: 0x00ff00,
        } );
        //const terrainMaterial = new shaders.GamePBRMaterial('TERRAIN', {});
        // terrainMaterial.setTexture('heightmap', heightmapTexture);
        // terrainMaterial.setTexture('grid', grid);
        // terrainMaterial.setVec4('heightParams', new THREE.Vector4(TERRAIN_DIMS, TERRAIN_DIMS, TERRAIN_HEIGHT, TERRAIN_OFFSET));

        this.mesh = new THREE.Mesh( geometry, terrainMaterial );
        this.mesh.position.set( 0, 0, 0 );
        this.mesh.receiveShadow = true;
        this.mesh.castShadow = false;

        this.scene.add( this.mesh );

        this.grass = new Grass({
            terrain: this,
            height: TERRAIN_HEIGHT,
            offset: TERRAIN_OFFSET,
            dims: TERRAIN_DIMS,
            heightmap: heightmapTexture
        })
    }

    GetHeight(x, y) {
        const xn = (x + TERRAIN_DIMS * 0.5) / TERRAIN_DIMS;
        const yn = 1 - (y + TERRAIN_DIMS * 0.5) / TERRAIN_DIMS;
        return this.#heightmap_.Get(xn, yn) - TERRAIN_OFFSET;
    }

    update() {
        this.grass?.update(this.time.delta)
    }

}
