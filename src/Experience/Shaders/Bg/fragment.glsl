#define GLSLIFY 1
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;
uniform float u_p1;
uniform float u_p2;
uniform float u_threshold;
uniform float u_time;
uniform float u_opacity;

varying vec2 v_uv;

#define PI	3.141592653589793
#define TWO_PI 6.2831853071795864

#include <getBlueNoise>

vec3 LinearTosRGB( in vec3 value ) {
    return mix( pow( value, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value * 12.92, vec3( lessThanEqual( value, vec3( 0.0031308 ) ) ) );
}

void main () {
    vec3 blueNoise = getBlueNoise(gl_FragCoord.xy + vec2(32.0, 16.0));
    float t = cos(u_time * -2.) * 0.5 + 0.5;

    float r = 1. - min(1., length(v_uv * vec2(2., 1.) - vec2(0.9, 0.)));
    float r2 = pow(r, u_p2 + t * 0.5);

    vec3 color = (r2 > u_threshold ?
    mix(u_color2, u_color3, (r2 - u_threshold) / (1. - u_threshold)) :
    mix(u_color1, u_color2, r2 / u_threshold)
    ) * pow(r, u_p1 + t) * mix(0.75, 1., t) * u_opacity;

    gl_FragColor.rgb = LinearTosRGB(color);

    gl_FragColor.rgb += blueNoise.x / 255.0;
    gl_FragColor.a = 0.0;
    // gl_FragColor = vec4(v_uv, 0. ,1.);
}
