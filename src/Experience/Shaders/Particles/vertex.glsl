attribute vec2 a_simUv;
attribute float a_dist;

uniform sampler2D u_currPositionLifeTexture;
uniform float u_particleSize;

varying vec3 v_viewNormal;

uniform sampler2D u_lightFieldSlicedTexture;
#include ../AboutHeroLightField/sliceShader.glsl

varying float v_ao;
varying float v_dist;
varying vec3 v_color;
varying float v_emission;

float linearStep(float edge0, float edge1, float x) {
    return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

void main () {
    vec4 positionLife = texture2D( u_currPositionLifeTexture, a_simUv );
    float life = positionLife.w;

    float scale = linearStep(-1.0, -0.2, life) * (linearStep(1.5, 1.0, life) + max(0., (1. - abs(life - 1.25) / 0.25)) * 0.5);

    vec3 pos = position * u_particleSize *  scale + positionLife.xyz;
    v_viewNormal = normalMatrix * normal;

    vec3 worldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
    vec3 worldNormal = normalize((vec4(v_viewNormal, 0.) * viewMatrix).xyz);

    vec3 lightPos = vec3(-5.01478, 1.8478, 0.890606);
    vec3 toLight = lightPos - worldPosition;
    float distToLight = length(toLight);
    vec3 L = normalize(lightPos - worldPosition);
    vec3 V = normalize(cameraPosition - worldPosition);

    vec3 rayGridDir = worldNormal;
    vec3 rayGridPos = lightFieldPosToGrid(worldPosition);
    vec4 indirectDiffuse = sampleLightField(u_lightFieldSlicedTexture, rayGridPos + normalize(rayGridDir + vec3(0., 0., 0.35) * 2. ));

    vec3 refl = reflect(-V, worldNormal);
    float RdL = dot(refl, L);
    vec4 indirectL = sampleLightField(u_lightFieldSlicedTexture, rayGridPos + L);

    float attenuation = 5. / (distToLight * distToLight);
    float NdL = dot(worldNormal, L);

    float dist = a_dist;
    float ao = 1. - indirectDiffuse.w;
    float contactShadow = 1. - indirectL.w;

    float brightness = 1.;
    float emissionMultiplier = 1.;
    if (dist > 0.75) {
        brightness = max(0., life - 1.);
        emissionMultiplier += brightness;
        brightness *= 0.1;
    } else if (dist > 0.55) {
        brightness = clamp(1. - life, 0., 1.);
    }

    vec3 emission = mix(vec3(0.44,0.322,0.816), vec3(0., 1., 1.), max(emissionMultiplier - 1., 1. - sqrt(dist * dist))) * emissionMultiplier;

    vec3 albedo = mix(vec3(0.44,0.322,0.816) * 0.25, emission, brightness) * emissionMultiplier;
    vec3 color = albedo * linearStep(-1.0, 1.0, NdL) * attenuation * ao * contactShadow;
    color += linearStep(0., 1.0, RdL) * 1.35 * attenuation * contactShadow;
    color += max(0., indirectDiffuse.x * 2. - indirectDiffuse.w) * emission * ao * (dist > 0.75 ? 1. : 0.);

    color += albedo * ao * ao * 0.65;

    v_color = color;
    v_dist = a_dist;
    v_emission = brightness * emissionMultiplier;

//    if (dist < 0.3) {
//        pos.x += 0.5;
//    }


    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
}
