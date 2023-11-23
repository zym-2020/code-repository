#version 300 es
precision highp float;

in vec4 a_color;

out vec4 outColor;

void main()
{
    outColor = a_color;
}