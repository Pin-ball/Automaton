uniform int uKind;
uniform float uAmount;
uniform int uReach;
uniform uint uSeed;

float aliveAround(ivec2 cell, ivec2 size) {
  float count = 0.0;
  for (int dy = -uReach; dy <= uReach; dy++) {
    for (int dx = -uReach; dx <= uReach; dx++) {
      if (dx * dx + dy * dy > uReach * uReach) continue;
      count += step(ALIVE, neighbor(cell + ivec2(dx, dy), size));
    }
  }
  return count;
}

void main() {
  ivec2 cell = ivec2(gl_FragCoord.xy);
  ivec2 size = textureSize(uState, 0);
  float state = texelFetch(uState, cell, 0).r;
  vec4 layers = texelFetch(uLayers, cell, 0);

  if (locked(cell)) {
    outState = state;
    outLayers = layers;
    return;
  }

  float chance = hash(cell, uSeed);
  bool alive = state >= ALIVE;
  float next = state;
  if (uKind == ADAPT_THICKEN) {
    next = float(alive || chance < 1.0 - pow(1.0 - uAmount, aliveAround(cell, size)));
  } else if (uKind == ADAPT_THIN) {
    next = float(alive && chance < uAmount);
  } else if (uKind == ADAPT_SOFTEN) {
    next = alive ? uAmount + (1.0 - uAmount) * chance : 0.0;
  } else if (uKind == ADAPT_THRESHOLD) {
    next = float(state > uAmount);
  }

  outState = next;
  outLayers = vec4(next, layers.gba);
}
