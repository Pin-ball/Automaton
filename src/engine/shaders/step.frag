uniform sampler2D uTaps;
uniform sampler2D uTable;
uniform int uTapCount;
uniform int uTableStride;
uniform int uGrowth;
uniform int uSteps;
uniform float uMu;
uniform float uSigma;
uniform float uDt;
uniform float uFadeFirst;
uniform float uFadeDecay;

ivec2 packed(int index) {
  return ivec2(index % PACK_WIDTH, index / PACK_WIDTH);
}

float fadeTrail(float next, float trail) {
  if (uSteps != 1) return next;
  if (next >= ALIVE) return 1.0;
  if (trail >= 1.0) return uFadeFirst;
  return trail * uFadeDecay;
}

void main() {
  ivec2 cell = ivec2(gl_FragCoord.xy);
  ivec2 size = textureSize(uState, 0);
  float self = texelFetch(uState, cell, 0).r;
  vec4 layers = texelFetch(uLayers, cell, 0);
  bool counts = uGrowth == GROWTH_COUNTS;

  float sum = 0.0;
  for (int i = 0; i < uTapCount; i++) {
    vec4 tap = texelFetch(uTaps, packed(i), 0);
    float value = neighbor(cell + ivec2(tap.xy), size);
    sum += tap.z * (counts ? step(ALIVE, value) : value);
  }

  float growth;
  if (counts) {
    int entry = int(step(ALIVE, self)) * uTableStride + int(sum + 0.5);
    growth = texelFetch(uTable, packed(entry), 0).r - self;
  } else {
    float delta = sum - uMu;
    growth = 2.0 * exp(-delta * delta / (2.0 * uSigma * uSigma)) - 1.0;
  }

  float next = clamp(self + uDt * growth, 0.0, 1.0);
  if (uSteps > 0) next = floor(next * float(uSteps) + 0.5) / float(uSteps);

  outState = next;
  outLayers = vec4(fadeTrail(next, layers.r), layers.gba);
}
