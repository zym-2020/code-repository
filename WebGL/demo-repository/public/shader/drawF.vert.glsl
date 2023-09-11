#version 300 es

layout(location=0)in vec4 a_position;
layout(location=1)in vec4 a_color;

uniform mat4 u_matrix;

out vec4 v_color;

void main(){
    gl_Position=u_matrix*a_position;
    v_color=a_color;
}