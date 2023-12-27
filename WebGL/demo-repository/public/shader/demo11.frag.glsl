#version 300 es

precision highp float;

uniform sampler2D symbolTexture;
in vec2 textureCoorXY;

out vec4 outColor;

void main() {
    outColor = texture(symbolTexture, textureCoorXY);
}