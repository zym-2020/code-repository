#version 300 es

layout(location = 0) in vec2 position;

uniform sampler2D tex;

out vec4 color;

void main()
{
    vec4 tex_color = texelFetch(tex, ivec2(int(position.x), int(position.y)), 0);
    int x = (int(tex_color.r * 255.0) << 8) + int(tex_color.g * 255.0);
    int y = (int(tex_color.b * 255.0) << 8) + int(tex_color.a * 255.0);
    if (int(position.x) == x && int(position.y) == y) 
    {
        color = vec4(1, 0, 0, 1);
        
    } 
    else
    {
        color = vec4(float(int(position.x) >>8) / 255.0, float(int(position.x) & 255) / 255.0, float(int(position.y) >>8) / 255.0, float(int(position.y) & 255) / 255.0);
        
    }
    gl_Position = vec4(position.x / 360.0, position.y / 180.0, 0.0, 1.0);
    gl_PointSize = 1.0;
}