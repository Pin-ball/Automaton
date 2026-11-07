uniform sampler2D uState;
uniform sampler2D uLayers;
uniform int uEdge;

layout(location = 0) out float outState;
layout(location = 1) out vec4 outLayers;

float neighbor(ivec2 cell, ivec2 size) {
  if (uEdge == EDGE_WRAP) {
    ivec2 wrapped = (cell + size * MAX_RADIUS) % size;
    return texelFetch(uState, wrapped, 0).r;
  }
  if (any(lessThan(cell, ivec2(0))) || any(greaterThanEqual(cell, size))) return 0.0;
  return texelFetch(uState, cell, 0).r;
}

float hash(ivec2 cell, uint seed) {
  uvec3 v = uvec3(uvec2(cell), seed) * 1664525u + 1013904223u;
  v.x += v.y * v.z;
  v.y += v.z * v.x;
  v.z += v.x * v.y;
  v ^= v >> 16u;
  v.x += v.y * v.z;
  v.y += v.z * v.x;
  v.z += v.x * v.y;
  return float(v.x >> 8u) / 16777216.0;
}
