#version 300 es

layout(location = 0) in vec2 position;
layout(location = 1) in float alive;

uniform float height;
uniform float width;
uniform float max_height;
uniform float max_width;
uniform vec4 color;

out vec4 a_color;

void main()
{
    if (alive == 0.0)
    {
        gl_Position = vec4((position.x * 2.0 / max_width) - 1.0, 1.0 - (position.y * 2.0 / max_height), 0.0, 1.0);
        return;
    }
    vec2 temp_position;
    if (gl_VertexID == 0)
    {
        
        temp_position = vec2(position.x, position.y + height);
    } 
    else if (gl_VertexID == 1)
    {
        temp_position = position;
    }
    else if (gl_VertexID == 2)
    {
        temp_position = vec2(position.x + width, position.y + height);
    }
    else
    {
        temp_position = vec2(position.x + width, position.y);
    }
    gl_Position = vec4((temp_position.x * 2.0 / max_width) - 1.0, 1.0 - (temp_position.y * 2.0 / max_height), 0.0, 1.0);
    gl_PointSize = 10.0;
    a_color = color;
}