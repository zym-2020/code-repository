#version 300 es

layout(location = 0) in vec4 geoPosition;
layout(location = 1) in float rotation;

uniform vec2 u_bufferSize;
uniform mat4 u_matrix;
uniform vec2 u_mercatorCenterHigh;
uniform vec2 u_mercatorCenterLow;
uniform mat4 u_symbolMatrix;

out vec2 textureCoorXY;

vec2 translateRelativeToEye(vec2 high, vec2 low)
{
    vec2 highDiff = high - u_mercatorCenterHigh;
    vec2 lowDiff = low - u_mercatorCenterLow;

    return highDiff + lowDiff;
}

mat4 matRotZ(float rad){
    return transpose(mat4(
        vec4(cos(rad),-sin(rad),0,0),
        vec4(sin(rad),cos(rad),0,0),
        vec4(0,0,1,0),
        vec4(0,0,0,1)
    ));
}

float textureCoor[] = float[8](0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0);
float pointCoor[] = float[8](-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0);

void main() {
    textureCoorXY = vec2(textureCoor[gl_VertexID * 2], textureCoor[gl_VertexID * 2 + 1]);
    vec2 pointCoorXY = vec2(pointCoor[gl_VertexID * 2], pointCoor[gl_VertexID * 2 + 1]);

    vec4 symbolOffset_ss=matRotZ(rotation)*u_symbolMatrix*vec4(pointCoorXY.xy,0.,1.);
    vec4 geoPos_cs = u_matrix * vec4(translateRelativeToEye(geoPosition.xy, geoPosition.zw), 0.0, 1.0);
    gl_Position=vec4(geoPos_cs.xy+symbolOffset_ss.xy*geoPos_cs.w/u_bufferSize,geoPos_cs.zw);
}
