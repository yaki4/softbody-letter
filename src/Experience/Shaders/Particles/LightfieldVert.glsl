attribute vec2 position;
attribute float dist;
uniform sampler2D u_currPositionLifeTexture;
uniform vec3 u_color;

#include ../AboutHeroLightField/sliceShader.glsl

varying vec4 v_color;

float linearStep(float edge0, float edge1, float x) {
    return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

void main () {
    vec4 positionLife = texture2D(u_currPositionLifeTexture, position);
    vec3 pos = positionLife.xyz;
    float life = positionLife.w;
    float scale = linearStep(-1.0, -0.2, life) * (linearStep(1.5, 1.0, life) + max(0., (1. - abs(life - 1.25) / 0.25)) * 0.5);

    vec3 lightFieldGrid = clampedLightFieldPosToGrid(pos);
    vec2 lightFieldUv = lightFieldGridToUv(lightFieldGrid);

    gl_Position = vec4(lightFieldUv * 2.0 - 1.0, 0.0, 1.0);
    gl_PointSize = 1.0;

    float brightness = 1.;
    if (dist > 0.75) {
        brightness = max(0., life - 1.);
    } else if (dist > 0.55) { // 0.55
        brightness = clamp(1. - life, 0., 1.);
    }
    brightness *= pow(scale, 0.75);
    v_color = vec4(brightness, brightness, brightness, scale);
}
