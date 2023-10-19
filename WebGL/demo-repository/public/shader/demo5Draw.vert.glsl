#version 300 es

layout(location = 0) in vec3 position_info;

uniform mat4 u_matrix;

void main() {
    gl_Position = u_matrix * vec4(position_info.xy, 0, 1);
    gl_PointSize = position_info.z;
}