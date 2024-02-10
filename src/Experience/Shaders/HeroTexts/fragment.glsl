uniform sampler2D u_texture;
uniform float u_time;
uniform vec2 u_resolution;

varying vec3 v_color;
varying vec2 v_uv;

varying vec3 v_worldPosition;

float linearStep(float edge0, float edge1, float x) {
    return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

float getFresnel(vec3 normal, vec3 viewDir, float power) {
    float d = max(0., dot(normal, viewDir));
    return 1.0 - pow(abs(d), power);
}

void main () {
    vec4 map = texture2D(u_texture, v_uv);
    float dark = map.r;
    float light = map.g;

    vec2 screenUv = gl_FragCoord.xy / u_resolution.xy;

    vec3 color = dark * 0.35 + light * (v_color + 0.05);
    color *= (1. + sin(u_time * -2. + (screenUv.x + screenUv.y) * 5.) * 0.3);

    // float u_startRatio = mod(u_time, 2.) / 2.;
    // float zRatio = (v_worldPosition.z - (-2.399479)) / 4.087055;
    // float r = linearStep(0., 1., u_startRatio * 2. - (1. - zRatio));
    // color *= 0.08 + r * r * 0.92;
    gl_FragColor = vec4(color, 0.);
}
