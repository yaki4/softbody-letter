#define GLSLIFY 1
uniform sampler2D u_texture;
uniform float u_amount;
varying vec2 v_uv;
void main() {
    gl_FragColor = texture2D(u_texture, v_uv) * u_amount;
}
