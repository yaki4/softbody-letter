#define GLSLIFY 1
varying vec2 v_uv;

void main () {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    v_uv = uv;
}
