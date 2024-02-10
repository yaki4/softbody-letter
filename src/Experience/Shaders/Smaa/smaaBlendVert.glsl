attribute vec3 position;

uniform vec2 u_texelSize;

varying vec2 v_uv;
varying vec4 v_offsets[ 2 ];

void SMAANeighborhoodBlendingVS( vec2 texcoord ) {
    v_offsets[ 0 ] = texcoord.xyxy + u_texelSize.xyxy * vec4( -1.0, 0.0, 0.0, 1.0 ); // WebGL port note: Changed sign in W component
    v_offsets[ 1 ] = texcoord.xyxy + u_texelSize.xyxy * vec4( 1.0, 0.0, 0.0, -1.0 ); // WebGL port note: Changed sign in W component
}

void main() {
    v_uv = position.xy * 0.5 + 0.5;

    SMAANeighborhoodBlendingVS( v_uv );

    // gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    gl_Position = vec4( position, 1.0 );

}
