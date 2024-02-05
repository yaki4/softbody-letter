#define GLSLIFY 1
uniform sampler2D u_texture;
uniform vec2 u_texelSize;
uniform float u_subtransformSize, u_normalization;
uniform bool u_isHorizontal, u_isForward;

const float TWOPI = 6.283185307179586;

void main () {
    float index = (u_isHorizontal ? gl_FragCoord.x : gl_FragCoord.y) - 0.5;
    float evenIndex = floor(index / u_subtransformSize) *
    (u_subtransformSize * 0.5) +
    mod(index, u_subtransformSize * 0.5) +
    0.5;
    vec2 evenPos = (u_isHorizontal ? vec2(evenIndex, gl_FragCoord.y) : vec2(gl_FragCoord.x, evenIndex)) * u_texelSize;
    vec2 oddPos = evenPos + vec2(u_isHorizontal, !u_isHorizontal) * .5;
    vec4 even = texture2D(u_texture, evenPos);
    vec4 odd = texture2D(u_texture, oddPos);
    float twiddleArgument = (u_isForward ? TWOPI : -TWOPI) * (index / u_subtransformSize);
    vec2 twiddle = vec2(cos(twiddleArgument), sin(twiddleArgument));
    gl_FragColor = (even.rgba + vec4(
    twiddle.x * odd.xz - twiddle.y * odd.yw,
    twiddle.y * odd.xz + twiddle.x * odd.yw
    ).xzyw) * u_normalization;
}
