// Author: Endy Iskandar Imam (GitHub:EndyPremier)
// Title: Masked Lighting

#ifdef GL_ES
precision mediump float;
#endif


// Position from origin of camera view
uniform vec3 u_camera;
uniform vec2 u_resolution;

// Normal created by input 3D object file
varying vec3 v_normal;

// Global Up
#define UP vec3(0., 1., 0.)

#define DIFFUSE   pow(.125, .5) * vec3(1., .6, 0.)
#define SHADOW    vec3(.15, .05, .00)
#define HIGHLIGHT vec3(.90, .60, .20)
#define WEIGHT    3.


// Camera Utilities
vec3 rightFromForward(vec3 forward)
{
	return normalize(cross(forward, UP));
}

vec3 upFromForward(vec3 forward)
{
	return normalize(cross(cross(forward, UP), forward));
}

vec3 lightByCamera()
{
	return upFromForward(-u_camera) + rightFromForward(-u_camera);
}


// dot effect
float dither()
{
	vec2 xy = step(WEIGHT, mod(gl_FragCoord.xy, WEIGHT * 2.));
	return xy.x * xy.y;
}

// stripe effect
float hatch()
{
	return step(mod(dot(gl_FragCoord.xy, vec2(1.)), WEIGHT * 3.), WEIGHT);
}


// Main Output
void main(void) {
	vec3 color = vec3(1.);
	vec2 uv = gl_FragCoord.xy / u_resolution.xy;

	// main diffuse object color
	color = DIFFUSE;

	// mask weight for light and shadow
	vec3 n = normalize(v_normal);
	vec3 l = normalize(lightByCamera());
	float shade_diffuse = max(0., dot(n, -l));
	float light_diffuse = max(0., dot(n,  l));

	// shade shadow
	float shade = shade_diffuse * max(pow(.5, .5), hatch());
	color = mix(color, SHADOW, shade);

	// shade lighting
	float l_base = light_diffuse * pow(.9, .5);
	float l_dith = max(0., light_diffuse * 1.2 - .2) * dither() * 1.5;
	color = mix(color, HIGHLIGHT, max(l_base, l_dith));

	// final output
	gl_FragColor = vec4(color, 1.0);
}
