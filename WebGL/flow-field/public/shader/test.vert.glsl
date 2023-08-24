#version 300 es

in ivec2 index;

uniform mat4 u_matrix;

uniform sampler2D positionTexture;


void main() {
    vec4 lon_vec = texelFetch(positionTexture, ivec2(index.x, index.y), 0);
    vec4 lat_vec = texelFetch(positionTexture, ivec2(index.x * 2, index.y), 0);
    
}