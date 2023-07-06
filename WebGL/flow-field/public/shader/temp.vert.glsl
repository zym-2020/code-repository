#version 300 es

in vec2 geoPosition;
uniform mat4 u_matrix;

void main() {
    gl_Position = u_matrix * vec4(geoPosition, 0.0, 1.0);
    gl_PointSize = 60.0;
}