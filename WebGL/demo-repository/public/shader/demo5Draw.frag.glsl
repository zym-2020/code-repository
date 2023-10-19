#version 300 es
precision highp float;

out vec4 outColor;

void main() {
    float dist = distance(gl_PointCoord, vec2(0.5, 0.5));
    if (dist < 0.5) {
        outColor = vec4(1.0, 0.0, 0.0, 1.0);
    } else {
        discard;
    }
}