#version 300 es

layout(location = 0) in vec3 position;
layout(location = 1) in float alive;

uniform float height;
uniform float width;
uniform float max_height;
uniform float max_width;
uniform float r;
uniform vec2 board_center;
uniform vec2 ball_center;
uniform vec4 color;

out vec4 a_color;

void main()
{
    if (alive == -1.0)
    {
        // gl_Position = vec4((position.x * 2.0 / max_width) - 1.0, 1.0 - (position.y * 2.0 / max_height), 0.0, 1.0);
        return;
    }
    vec2 temp_position;
    if (position.z == 0.0)
    {
        if (gl_VertexID == 0)
        {
            temp_position = position.xy;
        } 
        else if (gl_VertexID == 1)
        {
            temp_position = vec2(position.x, position.y + height);
        }
        else if (gl_VertexID == 2)
        {
            temp_position = vec2(position.x + width, position.y + height);
        }
        else
        {
            temp_position = vec2(position.x + width, position.y);
        }
    }
    else if (position.z == 1.0)
    {
        if (gl_VertexID == 0)
        {
            temp_position = board_center;
        } 
        else if (gl_VertexID == 1)
        {
            temp_position = vec2(board_center.x, board_center.y + position.y);
        }
        else if (gl_VertexID == 2)
        {
            temp_position = vec2(board_center.x + position.x, board_center.y + position.y);
        }
        else
        {
            temp_position = vec2(board_center.x + position.x, board_center.y);
        }
    }
    else
    {
        if (gl_VertexID == 0)
        {
            temp_position = ball_center;
        } 
        else if (gl_VertexID == 1)
        {
            temp_position = vec2(cos(position.x) * r + ball_center.x, sin(position.x) * r + ball_center.y);
        }
        else if (gl_VertexID == 2)
        {
            temp_position = vec2(cos(position.x + position.y) * r + ball_center.x, sin(position.x + position.y) * r + ball_center.y);
        }
        else
        {
            temp_position = vec2(cos(position.x + position.y * 2.0) * r + ball_center.x, sin(position.x + position.y * 2.0) * r + ball_center.y);
        }
    }
    
    gl_Position = vec4((temp_position.x * 2.0 / max_width) - 1.0, 1.0 - (temp_position.y * 2.0 / max_height), 0.0, 1.0);
    // gl_PointSize = 10.0;
    a_color = color;
}