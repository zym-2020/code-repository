#version 300 es

layout(location = 0) in int ID;

uniform float position_x[6];
uniform float position_y[6];

void main()
{
    gl_Position = vec4(position_x[int(ID)], position_y[int(ID)], 0, 1);
    gl_PointSize = 20.0;
}