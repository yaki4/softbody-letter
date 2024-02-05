#define GLSLIFY 1
varying float v_softness;
varying float v_opacity;
varying vec2 v_uv;

float linearStep(float edge0, float edge1, float x) {
    return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

void main() {
    float d = length(2.0 * (v_uv-0.5));
    float b = linearStep(0.0, 0.5 * v_softness + fwidth(d), 1.0 - d);
    gl_FragColor = vec4(vec3(0.5), b * v_opacity);
}
