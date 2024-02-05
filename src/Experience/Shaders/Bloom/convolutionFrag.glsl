#define GLSLIFY 1
varying vec2 v_uv;
uniform sampler2D u_texture;
uniform sampler2D u_bloomTexture;
uniform float u_convolutionBuffer;

#include <common>
// based on https://www.shadertoy.com/view/MslGR8
vec3 dithering( vec3 color ) {
    //Calculate grid position
    float grid_position = rand( gl_FragCoord.xy );

    //Shift the individual colors differently, thus making it even harder to see the dithering pattern
    vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );

    //modify shift acording to grid position.
    dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );

    //shift the color by dither_shift
    return color + dither_shift_RGB;
}

void main() {
    vec4 c = texture2D(u_texture, v_uv);
    // vec3 luma = vec3( 0.299, 0.587, 0.114 );
    // float v = dot( c.xyz, luma );
    // float a = 1.0 - v;//max(0.0, 1.2 - v);//mix(1.0, 0.1, v);

    vec2 bloomUv = (v_uv - 0.5) * (1.0 - u_convolutionBuffer) + 0.5;

    gl_FragColor = c + texture2D(u_bloomTexture, bloomUv);
    gl_FragColor.rgb = dithering( gl_FragColor.rgb );
    gl_FragColor.a = 1.0;
}
