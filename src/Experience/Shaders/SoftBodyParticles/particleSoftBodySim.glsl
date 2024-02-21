uniform float u_time;
uniform float u_deltaTime;
uniform sampler2D u_tetsTexture;
uniform sampler2D u_baryWeightsTexture;
uniform sampler2D u_tetsUvXTexture;
uniform sampler2D u_tetsUvYTexture;
uniform vec2 u_tetsTextureSize;

varying vec2 v_uv;

void main () {
    vec4 uvX = texture2D(u_tetsUvXTexture, v_uv);
    vec4 uvY = texture2D(u_tetsUvYTexture, v_uv);
    vec4 baryWeights = texture2D(u_baryWeightsTexture, v_uv);

    vec3 pos = vec3(0.0);
    pos += texture2D(u_tetsTexture, vec2(uvX.x, uvY.x)).xyz * baryWeights.x;
    pos += texture2D(u_tetsTexture, vec2(uvX.y, uvY.y)).xyz * baryWeights.y;
    pos += texture2D(u_tetsTexture, vec2(uvX.z, uvY.z)).xyz * baryWeights.z;
    pos += texture2D(u_tetsTexture, vec2(uvX.w, uvY.w)).xyz * baryWeights.w;

    gl_FragColor = vec4(pos, 1.0);
}
