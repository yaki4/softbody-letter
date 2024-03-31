uniform float u_time;
uniform float u_deltaTime;
uniform sampler2D u_softBodyTexture;
uniform sampler2D u_positionLifeTexture;
uniform sampler2D u_velocityDistTexture;
uniform bool u_isMobile;

varying vec2 v_uv;

#define saturate( a ) clamp( a, 0.0, 1.0 )

float linearStep(float edge0, float edge1, float x) {
    return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

void main () {
    vec4 softBodyPosition = texture2D(u_softBodyTexture, v_uv);
    vec4 positionLife = texture2D(u_positionLifeTexture, v_uv);
    vec4 velocityDist = texture2D(u_velocityDistTexture, v_uv);
    vec3 velocity = velocityDist.xyz;
    float distFromCenter = velocityDist.w;

    vec3 pos = softBodyPosition.xyz;
    float life = positionLife.w;

    bool isInner = distFromCenter < 0.5;
    if( u_isMobile ) {
        isInner = distFromCenter < 0.1;
    }

    // inner particles are always alive
    if (!isInner) {
        // with life from 2 to 1 the particle is respawned
        if (life > 1.0) {
            float restoreSpeed = 1.0;
            life -= restoreSpeed * u_deltaTime;
        }

        // the particle is alive and attached to the body
        // the life value is reduced by the velocity strength
        if (life > 0.0 && life <= 1.0) {
            float velocityStrength = length(velocity) * 0.35;
            velocityStrength = 50.0 * pow(min(1.0, velocityStrength), 5.);
            life -= u_deltaTime * velocityStrength;
            life += u_deltaTime;
            life = min(life, 1.0);
        }

        // the particle has been detached from the body and the decay begins
        if (life > -1.0 && life <= 0.0) {
            pos = positionLife.xyz;
            pos += 0.7 * velocity * u_deltaTime;

            float fallSpeed = 1.3;
            life -= fallSpeed * u_deltaTime;
        }

        // the particle has scale = 0, so it can be restored
        if (life <= -1.0) {
            pos = softBodyPosition.xyz;
            life = 2.0;
        }
    } else {
        pos = softBodyPosition.xyz;
    }

    gl_FragColor = vec4(pos, life);
}
