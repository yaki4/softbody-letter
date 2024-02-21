export default [
    {
        name: 'bufferTerrain',
        type: 'bufferGeometry',
        path: 'geometry/TERRAIN.buf'
    },
    {
        name: 'bufferPoints',
        type: 'bufferGeometry',
        path: 'geometry/POINTS.buf'
    },
    {
        name: 'bufferSplines',
        type: 'bufferGeometry',
        path: 'geometry/SPLINES.buf'
    },
    {
        name: 'bufferTets',
        type: 'bufferGeometry',
        path: 'geometry/TETS.buf'
    },
    {
        name: 'bufferSolid',
        type: 'bufferGeometry',
        path: 'geometry/SOLID.buf'
    },
    {
        name: 'bufferParticlesLD',
        type: 'bufferGeometry',
        path: 'geometry/PARTICLE_LD.buf'
    },
    {
        name: 'bakeTerrain',
        type: 'texture',
        path: 'textures/terrain/bake.webp'
    },
    {
        name: 'LDRTexture',
        type: 'texture',
        path: 'textures/LDR_RGB1_0.png'
    },
    // {
    //     name: 'smaaSearch',
    //     type: 'texture',
    //     path: 'textures/smaa-search.png'
    // },
    // {
    //     name: 'smaaArea',
    //     type: 'texture',
    //     path: 'textures/smaa-area.png'
    // }
    {
        name: 'cubeTetsModel',
        type: 'gltfModel',
        path: 'models/cubeTets.glb'
    },
    {
        name: 'cubeInnerModel',
        type: 'gltfModel',
        path: 'models/cubeInner.glb'
    },
    {
        name: 'suzTetsModel',
        type: 'gltfModel',
        path: 'models/suzTets.glb'
    },
    {
        name: 'suzInnerModel',
        type: 'gltfModel',
        path: 'models/suzInner.glb'
    },
]
