varying vec3 v_color;
varying vec2 v_uv;

uniform sampler2D u_lightFieldSlicedTexture;
#include ../AboutHeroLightField/sliceShader.glsl;
#include ../BlueNoise/getBlueNoiseShader.glsl;

varying vec3 v_worldPosition;

void main () {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    vec3 viewNormal = normalMatrix * normal;
    vec3 worldNormal = normalize((vec4(viewNormal, 0.) * viewMatrix).xyz);
    vec3 worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;

    v_worldPosition = worldPosition;

    worldNormal.z *= 0.1;
    worldPosition.z *= 0.25;
    vec3 rayGridDir = normalize(worldNormal);
    vec3 rayGridPos = lightFieldPosToGrid(worldPosition);

    vec4 indirectDiffuse = vec4(0.);
    vec3 halfGridSize = u_lightFieldGridCount * .5;
    vec3 ro = rayGridPos - halfGridSize - rayGridDir;
    vec3 rd = rayGridDir;
    vec3 m = 1.0/rayGridDir; // can precompute if traversing a set of aligned boxes
    vec3 n = m*ro;   // can precompute if traversing a set of aligned boxes
    vec3 k = abs(m)*halfGridSize;
    vec3 t1 = -n - k;
    vec3 t2 = -n + k;
    float tN = max( max( t1.x, t1.y ), t1.z ) - 1.;
    float tF = min( min( t2.x, t2.y ), t2.z ) - 1.;
    if( tN<tF && tF>0.0) {
        for (int i = 0; i < 16; i++) {
            float dist = mix(tN, tF, float(i) / 15.);
            vec3 offset = rayGridDir * dist;
            vec4 result = sampleLightField(u_lightFieldSlicedTexture, rayGridPos + offset);
            indirectDiffuse += (1. - indirectDiffuse.w) * result * vec4(vec3(min(1., 1./ (1. + dist * 0.01))), 1.);
            if (indirectDiffuse.w > 0.9) {
                break;
            }
        }
    }
    float brightness = max(0., indirectDiffuse.x * 1.35 - indirectDiffuse.w);
    v_color = mix(vec3(0.44,0.322,0.816), vec3(0., 3., 3.), brightness) * brightness + vec3(0.44,0.322,0.816) * 0.25;
    v_uv = uv;
}
