#define GLSLIFY 1
varying vec2 v_uv;

uniform sampler2D u_texture;
uniform sampler2D u_cacheTexture;
uniform vec2 u_aspect;
uniform float u_transitionRatio;

void main() {
    vec2 uv = v_uv - 0.5;
    float transitionRatioInverse = 1.0 - u_transitionRatio;
    uv *= u_aspect;

    float d = length(uv);
    float oriDist = d;

    float distortedDist = d * 3.1415926 * 2.5 * transitionRatioInverse;
    float distortion = cos(distortedDist * distortedDist);
    uv *= mix(1.0, distortion * distortion, u_transitionRatio);

    uv /= u_aspect;
    vec4 color = texture2D(u_texture, uv + 0.5);
    vec4 sceneColor = texture2D(u_cacheTexture, uv * (1.0 - u_transitionRatio * 0.75) + 0.5);

    float blend = smoothstep(0.4, 0.6, transitionRatioInverse);
    color = mix(color, sceneColor, blend);

    gl_FragColor = color;
}
