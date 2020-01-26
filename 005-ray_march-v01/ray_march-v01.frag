#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.141592653589

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define DURATION 4.

const int MAX_STEPS = 255;
const float MIN_DIST = 0.0;
const float MAX_DIST = 100.0;
const float EPSILON = 0.0001;


float  intersectSDF (float distA, float distB) { return max(distA, distB); }
float      unionSDF (float distA, float distB) { return min(distA, distB); }
float differenceSDF (float distA, float distB) { return max(distA,-distB); }


float cubeSDF (vec3 p, vec3 dim) {
    vec3 d = abs(p) - dim / 2.;
    float  insideDistance = min(max(d.x, max(d.y, d.z)), 0.);
    float outsideDistance = length(max(d, 0.));
    return insideDistance + outsideDistance;
}

float sphereSDF (vec3 p, float r) {
    return length(p) - r;
}


float sceneSDF (vec3 samplePoint) {
    float cDist = cubeSDF(samplePoint, vec3(1.));
    float s1Dist = sphereSDF(samplePoint, .75);
    float s2Dist = sphereSDF(samplePoint, .65);
    return unionSDF(differenceSDF(cDist, s1Dist),
                     intersectSDF(cDist, s2Dist));
}


float shortestDistanceToSurface (vec3 eye, vec3 dir, float start, float end)
{
    float depth = start;
    for (int i = 0; i < MAX_STEPS; ++i) {
        float dist = sceneSDF(eye + depth * dir);
        if (dist < EPSILON) { return depth; }
        depth += dist;
        if (depth >= end) { return end; }
    }
    return start;
}


vec3 rayDirection (float FOV, vec2 res, vec2 coord)
{
    vec2 xy = coord - res / 2.;
    float z = res.y / tan(radians(FOV) / 2.);
    return normalize(vec3(xy, -z));
}


vec3 estimateNormal (vec3 p)
{
    return normalize(vec3(
        sceneSDF(vec3(p.x + EPSILON, p.y, p.z)) - sceneSDF(vec3(p.x - EPSILON, p.y, p.z)),
        sceneSDF(vec3(p.x, p.y + EPSILON, p.z)) - sceneSDF(vec3(p.x, p.y - EPSILON, p.z)),
        sceneSDF(vec3(p.x, p.y, p.z + EPSILON)) - sceneSDF(vec3(p.x, p.y, p.z - EPSILON))
    ));
}


vec3 phongContrib (vec3 k_d, vec3 k_s, float alpha, vec3 p, vec3 eye,
                   vec3 lightPos, vec3 lightPower)
{
    vec3 N = estimateNormal(p);
    vec3 L = normalize(lightPos - p);
    vec3 V = normalize(eye - p);
    vec3 R = normalize(reflect(-L, N));

    float dotLN = dot(L, N);
    float dotRV = dot(R, V);

    // Light not visible from this point on the surface
    if (dotLN < 0.) { return vec3(0.); }
    if (dotRV < 0.) { return lightPower * (k_d * dotLN); }

    return lightPower * (k_d * dotLN + k_s * pow(dotRV, alpha));
}

vec3 phongIllumination (vec3 k_a, vec3 k_d, vec3 k_s, float alpha, vec3 p, vec3 eye)
{
    float t = u_time * PI * 2. / DURATION;

    // Ambience
    const vec3 ambientLight = vec3(.5);
    vec3 color = ambientLight * k_a;

    // Diffuse + Specular for light 1
    vec3 lightPos = 3. * vec3(3. * cos(t + 1.), 1., 3. * sin(t + 1.));
    vec3 lightIntensity = vec3(.8);
    color += phongContrib(k_d, k_s, alpha, p, eye, lightPos, lightIntensity);

    lightPos = -1.5 * vec3(1. * cos(t + 1.), 1., 1. * sin(t + 1.));
    lightIntensity = vec3(.4);
    color += phongContrib(k_d, k_s, alpha, p, eye, lightPos, lightIntensity);

    lightPos = 5. * vec3(1. * cos(t - PI), 1., 1. * sin(t - PI));
    lightIntensity = vec3(1.);
    color += phongContrib(k_d, k_s, alpha, p, eye, lightPos, lightIntensity);

    return color;
}


mat4 viewMatrix (vec3 eye, vec3 center, vec3 up)
{
    vec3 f = normalize(center - eye);
    vec3 s = normalize(cross(f, up));
    vec3 u = cross(s, f);
    return mat4 (
        vec4 ( s        , 0.),
        vec4 ( u        , 0.),
        vec4 (-f        , 0.),
        vec4 (0., 0., 0., 1.)
    );
}


void main()
{
    //float t = u_time * PI / 4.; t = PI / 3.;
    float t = u_time * PI * 2. / DURATION;

    vec3 viewDir = rayDirection(45., u_resolution, gl_FragCoord.xy);
    vec3 eye = vec3(5. * cos(t), 3., 5. * sin(t));
    vec3 target = vec3(.0, .0, .0);
    //vec3 target = vec3(cos(t), 0., sin(t)) + eye;

    mat4 viewToWorld = viewMatrix(eye, target, vec3(0., 1., 0.));
    vec3 worldDir = (viewToWorld * vec4(viewDir, 0.)).xyz;

    float dist = shortestDistanceToSurface(eye, worldDir, MIN_DIST, MAX_DIST);

    // if didn't hit anything
    if (dist > MAX_DIST - EPSILON) {
        gl_FragColor = vec4(0.);
        return;
    }

    // if hit
    // get pos
    vec3 p = eye + dist * worldDir;
    // get lighting
    vec3 K_a = vec3(.1, .05, .00);
    vec3 K_d = vec3(.60, .3, .10);
    vec3 K_s = vec3(.9, .5, .1);
    float shininess = 10.;

    vec3 color = phongIllumination(K_a, K_d, K_s, shininess, p, eye);

    gl_FragColor = vec4(color, 1.);
}
