import Experience from '../Experience.js'

function vecSetZero( vectorArray, index ) {
    index *= 3;
    vectorArray[ index++ ] = 0;
    vectorArray[ index++ ] = 0;
    vectorArray[ index ] = 0;
}

function vecAdd( resultArray, resultIndex, sourceArray, sourceIndex, multiplier = 1 ) {
    resultIndex *= 3;
    sourceIndex *= 3;
    resultArray[ resultIndex++ ] += sourceArray[ sourceIndex++ ] * multiplier;
    resultArray[ resultIndex++ ] += sourceArray[ sourceIndex++ ] * multiplier;
    resultArray[ resultIndex ] += sourceArray[ sourceIndex ] * multiplier;
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
    }

    init() {
        this.computeVisualData()
        this.tetIndices = this.geometry.attributes.tet.array
        this.baryWeights = this.geometry.attributes.bary.array
        this.endFrame()
    }

    computeVisualData() {
        this.numVisVerts = this.geometry.attributes.position.array.length / 3
        this.skinningInfo = new Float32Array( 4 * this.numVisVerts )
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
