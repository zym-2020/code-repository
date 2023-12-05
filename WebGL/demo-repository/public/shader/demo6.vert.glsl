#version 300 es

layout(location = 0) in vec4 position;

out vec2 texturePosition;

void main()
{
    gl_Position = vec4(position.xy, 0.0, 1.0);
    texturePosition = position.zw;
}