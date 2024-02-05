#define GLSLIFY 1
varying vec2 v_uv;
uniform sampler2D u_texture;
uniform sampler2D u_kernelTexture;

void main() {
    vec4 a = texture2D(u_texture, v_uv);
    vec4 b = texture2D(u_kernelTexture, v_uv);
    gl_FragColor = vec4(
    a.xz * b.xz - a.yw * b.yw,
    a.xz * b.yw + a.yw * b.xz
    ).xzyw;
}
