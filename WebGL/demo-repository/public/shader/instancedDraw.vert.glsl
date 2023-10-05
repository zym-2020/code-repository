#version 300 es

layout(location = 0) in vec4 a_position;
layout(location = 1) in vec4 color;
layout(location = 2) in mat4 matrix;

out vec4 v_color;

void main() {
    gl_Position = matrix * a_position;
    v_color = color;
}