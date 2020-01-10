// Author: Endy Iskandar Imam (GitHub:EndyPremier)
// Title: Pattern Shift

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;


vec2 DIM_RATIO = vec2(1., pow(3., .5));
float SCALAR = 6.;
float SS_DEL = 0.01;


mat2 rotate (float _angle)
{
    return mat2(cos(_angle), -sin(_angle),
                sin(_angle),  cos(_angle));
}


float circ (vec2 _uv, float _d)
{
    return 1. - smoothstep(_d, _d + SS_DEL, length(_uv));
}

void circTile (vec2 _uv, float _d, vec3 _color, inout vec3 _in)
{

    _uv = mod(_uv, DIM_RATIO) - vec2(.5);
    _in = mix(_in, _color, circ(_uv, _d));
}

void circHex (vec2 _uv, float _d, float _t, vec3 _color, inout vec3 _in)
{
    vec2 _vx = _uv + DIM_RATIO / 2.;
    vec2 _td = vec2(u_time * _t, 0.);
    circTile(_uv + _td, _d, _color, _in);
    circTile(_vx - _td, _d, _color, _in);
}


void main ()
{
    vec2 uv = gl_FragCoord.xy / u_resolution.y;
    vec3 color = vec3(0.12);

    float diam = DIM_RATIO.y / 4. - .1;
    vec3 accent = vec3(.91, .91, .10);

    circHex(rotate(.3) * uv * 9., diam * 1., 1., accent  , color);
    circHex(rotate(.3) * uv * 9., diam * .4, 1., vec3(0.), color);

    circHex(uv * 3.6, diam * 1., 1., vec3(0.80), color);
    circHex(uv * 3.6, diam * .4, 1., vec3(0.12), color);

    gl_FragColor = vec4(color, 1.);
}
