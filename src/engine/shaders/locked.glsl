uniform vec4 uLocked[MAX_ZONES];
uniform int uLockedCount;

bool locked(ivec2 cell) {
  vec2 point = vec2(cell);
  for (int i = 0; i < MAX_ZONES; i++) {
    if (i >= uLockedCount) break;
    vec4 box = uLocked[i];
    if (all(greaterThanEqual(point, box.xy)) && all(lessThan(point, box.zw))) return true;
  }
  return false;
}
