#version 300 es

layout(location = 0) in vec2 position;
layout(location = 1) in vec4 color;

out vec4 v_color;

void main() {
    gl_Position = vec4(position.xy, 0, 1);
    gl_PointSize = 20.0;
    v_color = color;
}