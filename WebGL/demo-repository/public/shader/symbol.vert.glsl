#version 300 es

layout(location = 0) in vec4 sampleInfo;

uniform sampler2D symbolTexture;
uniform sampler2D paletteTexture;



out vec4 v_color;


void main() {
    float symbolTextureWidth=float(textureSize(symbolTexture,0).x);
    float offset=sampleInfo.x+sampleInfo.z*62.;
    float index=clamp(offset+float(gl_VertexID),0.,sampleInfo.x+sampleInfo.y-1.);
    
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
    


    gl_Position = vec4(x,-y,0.,1.);
    // gl_Position = vec4(0., 0., 0., 1.0);

    gl_PointSize=10.;

    
    
    int colorIndex=((intR&3)<<2)+(intG&3);
    // v_color=posColor;
    v_color=vec4(texelFetch(paletteTexture,ivec2(colorIndex,int(sampleInfo.w)),0).rgb, 1.0);
    // color=vec4(symbolTextureWidth / 2.0,0.,0.,1.);
    // v_color=vec4(1.0, 0.0, 0.0, 1.0);
}
