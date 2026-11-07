uniform vec4 uOps[MAX_PAINT_OPS];
uniform float uDensity[MAX_PAINT_OPS];
uniform int uOpCount;
uniform uint uSeed;

void main() {
  ivec2 cell = ivec2(gl_FragCoord.xy);
  ivec2 size = textureSize(uState, 0);
  float state = texelFetch(uState, cell, 0).r;
  vec4 layers = texelFetch(uLayers, cell, 0);

  if (!locked(cell)) {
    vec2 center = vec2(cell) + 0.5;
    for (int i = 0; i < MAX_PAINT_OPS; i++) {
      if (i >= uOpCount) break;
      vec4 op = uOps[i];
      vec2 offset = center - op.xy;
      if (uEdge == EDGE_WRAP) offset -= vec2(size) * floor(offset / vec2(size) + 0.5);
      if (dot(offset, offset) > op.z * op.z) continue;

      int kind = int(op.w);
      float chance = hash(cell, uSeed + uint(i));
      if (kind == PAINT_ERASE) {
        state = 0.0;
        layers.r = 0.0;
      } else if (kind == PAINT_SET) {
        if (chance < uDensity[i]) {
          state = 1.0;
          layers.r = 1.0;
        }
      } else if (kind == PAINT_ADD) {
        state = min(1.0, state + 0.5 * (0.5 + chance));
        layers.r = state;
      }
    }
  }

  outState = state;
  outLayers = layers;
}
