#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;


float circle(in vec2 _st, in float _radius) {
    vec2 l = _st - vec2(0.5);
    return 1. - smoothstep(_radius-(_radius*0.01),
                           _radius+(_radius*0.01),
                           dot(l,l) * 4.0);
}

float rand (float x) { return fract(sin(x*x)); }

void main()
{
    vec2 uv = gl_FragCoord.xy/u_resolution;
    vec3 color = vec3(0.0);
    uv -= vec2(0.02);
    uv -= vec2(rand(u_time), rand(u_time + 1000.)) / 10.;
    uv *= 1.2;

    uv.x += uv.y * .05;
    uv.x *= 1.3;

    color = mix(color, vec3(.9), circle(uv, .4));
    color = mix(color, vec3(.2), circle(uv - vec2(-.05,-.1), .1));
    color = mix(color, vec3(.9), circle(uv - vec2(.5,.0), .4));
    color = mix(color, vec3(.2), circle(uv - vec2(.45,-.1), .1));

    gl_FragColor = vec4(color,1.0);
}
