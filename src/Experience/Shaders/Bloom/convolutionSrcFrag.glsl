#define GLSLIFY 1
uniform vec2 u_aspect;
varying vec2 v_uv;

void main () {
    // Do some modulo arithmetic to put (0, 0) at each of the four corners, which will place the convolution
    // kernel origin at each respective pixel of the image
    vec2 toCenter = (fract(v_uv + 0.5) - 0.5) * 0.35 * u_aspect;
    vec2 rotToCenter = mat2(0.7071067811865476, -0.7071067811865476, 0.7071067811865476, 0.7071067811865476) * toCenter;

    float res =
    exp(-length(toCenter) * 2.0) * 0.02+
    exp(-length(toCenter) * 15.0) * 0.5 +
    exp(-length(toCenter) * 50.0) * 3. +

    exp(-length(rotToCenter * vec2(1.0, 8.0)) * 75.0) * 8. +
    exp(-length(rotToCenter * vec2(8.0, 1.0)) * 75.0)  * 8.+

    exp(-length(rotToCenter * vec2(1.0, 20.0)) * 150.0) * 40. +
    exp(-length(rotToCenter * vec2(20.0, 1.0)) * 150.0)  * 40.+

    exp(-length(toCenter * vec2(1.0, 10.0)) * 60.0) * 8. +
    exp(-length(toCenter * vec2(10.0, 1.0)) * 60.0) * 8.+

    exp(-length(toCenter * vec2(1.0, 20.0)) * 120.0) * 75. +
    exp(-length(toCenter * vec2(20.0, 1.0)) * 120.0) * 75.
    ;

    gl_FragColor = vec4(res, 0.0, res, 0.0);

}
