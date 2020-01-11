#ifdef GL_ES
precision mediump float;
#endif

#define E 2.71828182846
#define PI 3.141592653589

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;


float sigma (float x) { return pow(E, -x*x); }

float rand (in vec2 uv) { return fract(999. * sin(dot(uv, vec2(1., -777.)))); }

float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = rand(i);
    float b = rand(i + vec2(1.0, 0.0));
    float c = rand(i + vec2(0.0, 1.0));
    float d = rand(i + vec2(1.0, 1.0));

    vec2 u = smoothstep(0.,1.,f);

    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fractNoise (in vec2 uv) {
    float s = 0., t = 0.;
    for (int i = 0; i < 5; ++i)
    {
        float e = pow(2., float(i));
        t += 1. / e;
        s += noise(uv * e) / e;
    }
    return s / t;
}

float sdCirc (in vec2 uv, float r) { return length(uv) - r; }
float sdBox  (in vec2 uv, in vec2 dim) {
    vec2 d = abs(uv) - dim;
    return length(max(d, vec2(0.))) + min(max(d.x, d.y), 0.);
}

float highlighted (float d, float w, float wd) {
    return 1. - smoothstep(w, w + wd, abs(d));
}



void main () {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    float glow_dist = sdBox (uv - 0.5, vec2(.25));
          //glow_dist = sdCirc(uv - 0.5, .25);
    float glow_pct  = (1. - abs(glow_dist * 8.)) * .85 + .15;

    vec2  noise_uv = 4. * uv + u_time * vec2(.8, .5) / 3.;
    float noise_pct = fractNoise(noise_uv);

    float final_glow_pct = noise_pct * glow_pct;
    float highlight_pct  = highlighted(glow_dist, .005, .025);

    float t = mix(final_glow_pct, 1., highlight_pct);
    color = vec3(t);

    gl_FragColor = vec4(color, 1.0);
}
