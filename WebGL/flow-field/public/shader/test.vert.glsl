#version 300 es

layout(location=0) in vec4 sampleInfo;
layout(location=1) in vec2 geoPosition;
layout(location=2) in float rotation;

uniform sampler2D symbolTexture;
uniform sampler2D paletteTexture;

uniform mat4 u_matrix;
uniform mat4 u_symbolMatrix;
uniform vec2 u_bufferSize;
out vec4 color;

mat4 matRotZ(float rad) 
{
   return transpose(mat4(
        vec4(cos(rad), -sin(rad), 0, 0), 
        vec4(sin(rad), cos(rad), 0, 0), 
        vec4(0, 0, 1, 0), 
        vec4(0, 0, 0, 1)
    )); 
}

void main(){
    float symbolTextureWidth = float(textureSize(symbolTexture, 0).x);
    float index = clamp(sampleInfo.x + 62.0 * sampleInfo.z + float(gl_VertexID), 0.0, sampleInfo.x + sampleInfo.y - 1.0);

    int u = int(mod(index, symbolTextureWidth));
    int v = int(floor(index / symbolTextureWidth));

    vec4 posColor = texelFetch(symbolTexture, ivec2(u, v), 0);

    int intR = int(posColor.r * 255.0);
    int intG = int(posColor.g * 255.0);
    float fractX = float(intR & 252) / 255.0;
    float fractY = float(intG & 252) / 255.0;

    int intX = int(posColor.b * 255.0);
    int intY = int(posColor.a * 255.0);

    float x = ((fractX + float(intX)) / 255.0) * 2.0 - 1.0;
    float y = ((fractY + float(intY)) / 255.0) * 2.0 - 1.0;

    vec4 symbolOffset_ss = matRotZ(rotation) * u_symbolMatrix * vec4(x, -y, 0.0, 1.0);
    vec4 geoPos_cs = u_matrix * vec4(geoPosition.xy, 0.0, 1.0);
    gl_Position = vec4(geoPos_cs.xy + symbolOffset_ss.xy * geoPos_cs.w / u_bufferSize, geoPos_cs.zw);

    int colorIndex = ((intR & 3) << 2) + (intG & 3);
    color = vec4(texelFetch(paletteTexture, ivec2(colorIndex, int(sampleInfo.w)), 0).rgb, 1);

}