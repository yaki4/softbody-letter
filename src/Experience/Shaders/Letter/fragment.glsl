uniform float u_opacity;
uniform float u_time;
uniform vec3 u_color;
uniform vec2 u_resolution;
uniform sampler2D u_map;

varying vec2 v_uv;

float median(float r, float g, float b) {
    return max(min(r, g), min(max(r, g), b));
}

void main () {
    vec2 screenUv = gl_FragCoord.xy / u_resolution.xy;

    // Texture sample
    vec3 s = texture2D(u_map, v_uv).rgb;

    // Signed distance
    float sigDist = median(s.r, s.g, s.b) - 0.5;
    float alpha = clamp(sigDist / fwidth(sigDist) + 0.5, 0.0, 1.0);

    // Alpha Test
    if (alpha < 0.01) discard;

    // Output: Common
    gl_FragColor.rgb = u_color * (1. + sin(u_time * -2. + (screenUv.x + screenUv.y) * 5.) * 0.15);
    gl_FragColor.a = alpha * u_opacity;
}
