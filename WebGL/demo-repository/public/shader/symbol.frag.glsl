#version 300 es
precision highp float;

in vec4 v_color;
out vec4 outColor;

void main() {
    outColor = vec4(0,0,0,1);
    // outColor = v_color;
}
