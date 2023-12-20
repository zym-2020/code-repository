#version 300 es

layout(location = 0) in vec2 sampleInfo;
layout(location = 1) in vec4 geoPosition;
layout(location = 2) in float rotation;

uniform sampler2D symbolTexture;
uniform sampler2D paletteTexture;

uniform mat4 u_symbolMatrix;
uniform vec2 u_bufferSize;
uniform mat4 u_matrix;
uniform vec2 u_mercatorCenterHigh;
uniform vec2 u_mercatorCenterLow;
uniform float base[100];
uniform float len[100];

out vec4 v_color;

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

void main() {
    float symbolTextureWidth=float(textureSize(symbolTexture,0).x);
    float offset=base[int(sampleInfo.y)]+sampleInfo.x*62.;
    float index=clamp(offset+float(gl_VertexID),0.,base[int(sampleInfo.y)]+len[int(sampleInfo.y)]-1.);
    
    int u=int(mod(index,symbolTextureWidth));
    int v=int(floor(index/symbolTextureWidth));
    
    vec4 posColor=texelFetch(symbolTexture,ivec2(u,v),0);
    
    int intR=int(posColor.r*255.);
    int intG=int(posColor.g*255.);
    float fractX=float(intR&252)/255.;
    float fractY=float(intG&252)/255.;
    
    float intX=posColor.b*255.;
    float intY=posColor.a*255.;
    
    float x=((fractX+intX)/255.)*2.-1.;
    float y=((fractY+intY)/255.)*2.-1.;
    
    vec4 symbolOffset_ss=matRotZ(rotation)*u_symbolMatrix*vec4(x,-y,0.,1.);
    // vec4 geoPos_cs=u_matrix*vec4(geoPosition.xy,0.,1.);
    vec4 geoPos_cs = u_matrix * vec4(translateRelativeToEye(geoPosition.xy, geoPosition.zw), 0.0, 1.0);
    gl_Position=vec4(geoPos_cs.xy+symbolOffset_ss.xy*geoPos_cs.w/u_bufferSize,geoPos_cs.zw);

    // gl_Position=u_matrix*vec4(geoPosition,0.,1.);
    // gl_PointSize=10.;
 
    
    
    int colorIndex=((intR&3)<<2)+(intG&3);

    v_color=vec4(texelFetch(paletteTexture,ivec2(colorIndex,int(sampleInfo.y)),0).rgb, 1.0);
    // color=vec4(symbolTextureWidth / 2.0,0.,0.,1.);
}
