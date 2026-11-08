uniform sampler2D uSource;
uniform bool uFromState;

layout(location = 0) out vec2 outSum;

void main() {
  ivec2 origin = ivec2(gl_FragCoord.xy) * REDUCE_BLOCK;
  ivec2 size = textureSize(uSource, 0);
  vec2 sum = vec2(0.0);
  for (int dy = 0; dy < REDUCE_BLOCK; dy++) {
    for (int dx = 0; dx < REDUCE_BLOCK; dx++) {
      ivec2 cell = origin + ivec2(dx, dy);
      if (any(greaterThanEqual(cell, size))) continue;
      vec4 texel = texelFetch(uSource, cell, 0);
      sum += uFromState ? vec2(step(ALIVE, texel.r), texel.r) : texel.rg;
    }
  }
  outSum = sum;
}
