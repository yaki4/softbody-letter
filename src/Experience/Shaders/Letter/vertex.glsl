#define GLSLIFY 1
attribute vec2 center;
attribute float letterIndex;

varying vec2 v_uv;

uniform float u_scale;
uniform float u_paddingY;
uniform float u_time;
uniform float u_startTime;
uniform float u_lettersStartTime;
uniform float u_letterDuration;
uniform float u_letterStagger;

vec4 quaternion (vec3 axis, float halfAngle) {
    float s = sin(halfAngle);
    return vec4(axis * s, cos(halfAngle));
}
vec3 qrotate (vec4 q, vec3 v) {
    return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
}
float linearStep(float edge0, float edge1, float x) {
    return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

void main () {

    float letterStart = u_lettersStartTime + u_letterStagger * letterIndex;
    float t = smoothstep(letterStart, letterStart + u_letterDuration, u_startTime);

    vec3 pos = position;
    vec2 origin = center * vec2(1., 2.);
    pos.xy -= origin;
    vec4 q = quaternion(normalize(vec3(1.0, 0.0, -0.1)), 3.1415926 * mix(0.5, 0., t));
    pos = qrotate(q, pos);
    pos.xy += origin;

    pos.x += mix(10., 0., t * t);
    pos.y -= u_paddingY + mix(35., 0., sqrt(t));
    pos.y *= -1.0;
    pos *= u_scale;

    vec4 mvPosition = vec4(pos, 1.0);
    mvPosition = modelViewMatrix * mvPosition;
    gl_Position = projectionMatrix * mvPosition;

    v_uv = uv;
}
