// Author: Endy Iskandar Imam (GitHub:EndyPremier)
// Title: Binary Timer

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

#define TAU 6.28318530718
#define SS_OFFSET 0.01

#define TIME_CYCLE 4.
#define MAX_CELL_SIZE 9.
#define MIN_CELL_SIZE 7.
#define CELL_COUNT 4.


vec2 getPixPos (vec2 _uv, float _zoom, float _offset)
{
    _uv *= (1. + _offset) * _zoom - _offset - 2. * SS_OFFSET;
    _uv += SS_OFFSET;

    vec2 xy = floor(_uv / (1. + _offset));
    return xy;
}

float getBit (vec2 _uv, float _zoom, float _offset)
{
    vec2 xy = getPixPos(_uv, _zoom, _offset);
    return xy.x + xy.y * _zoom;
}


float box (vec2 _uv, float _border)
{
    vec2 bl = smoothstep(vec2(_border), vec2(_border + SS_OFFSET), _uv);
    vec2 tr = smoothstep(vec2(_border), vec2(_border + SS_OFFSET), 1. - _uv);
    float pct = bl.x * bl.y * tr.x * tr.y;
    return pct;
}


vec2 tile (vec2 _uv, float _zoom, float _offset)
{
    _uv *= (1. + _offset) * _zoom - _offset - 2. * SS_OFFSET;
    _uv += SS_OFFSET;
    return mod(_uv, 1. + _offset);
}

float cell (vec2 _uv, float _maxCell, float _minCell, float _active, float _t)
{
    float mt = sin(_t) * .5 + .5;

    float cellDelta = 1. / _maxCell;
    float cellDiff = _maxCell - _minCell;

    float maxAt = cellDelta * cellDiff * mt / 2.;
    float minAt = cellDelta + maxAt;

    float pct = box(_uv, maxAt) - _active * box(_uv, minAt);
    return pct;
}


void main ()
{
    vec2 uv = gl_FragCoord.xy/u_resolution;
    vec3 color = vec3(0.0);

    vec2 muv = gl_FragCoord.xy/u_resolution;
    muv.y = 1. - muv.y;

    float offset = 1. / MAX_CELL_SIZE;
    vec2 pixPos = getPixPos(muv, CELL_COUNT, offset);
    float bit = getBit(muv, CELL_COUNT, offset);
    muv = tile(muv, CELL_COUNT, offset);

    float globe_t = TAU / TIME_CYCLE * u_time;
    float full_t  = floor(u_time);
    float anim_t  = (pixPos.x + pixPos.y) - globe_t;
    float color_t = sin(globe_t) * .3 + .7;

    float active_bit = 1. - floor(mod(full_t / pow(2., bit), 2.));
    float pct = cell(muv, MAX_CELL_SIZE, MIN_CELL_SIZE, active_bit, anim_t);
    color = mix(vec3(0.), vec3(uv, color_t), pct);

    gl_FragColor = vec4(color,1.0);
}

