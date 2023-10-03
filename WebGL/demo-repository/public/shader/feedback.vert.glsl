#version 300 es

uniform int numPoints;
out vec2 position;
out vec4 color;

#define PI radians(180.0)

void main() {
    float u = float(gl_VertexID) / float(numPoints);
    float a = u * PI * 2.0;
    position = vec2(cos(a), sin(a)) * 0.5;
    // position = vec2(-1.0, -0.5);
    color = vec4(u, 0.0, 1.0 - u, 1);
}