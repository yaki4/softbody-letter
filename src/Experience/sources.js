export default [
    {
        name: 'bufferTerrain',
        type: 'bufferGeometry',
        path: 'geometry/TERRAIN.buf'
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
        name: 'e2InnerModel',
        type: 'gltfModel',
        path: 'models/e2Inner.glb'
    },
    {
        name: 'e2TetsModel',
        type: 'gltfModel',
        path: 'models/e2Tets.gltf'
    },
    // {
    //     name: 'e2SplineModel',
    //     type: 'gltfModel',
    //     path: 'models/e2Spline.glb'
    // },
    {
        name: 'e2ParticlesModel',
        type: 'gltfModel',
        path: 'models/e2Particles.gltf'
    }
]
