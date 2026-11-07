uniform ivec2 uOffset;

void main() {
  ivec2 source = ivec2(gl_FragCoord.xy) - uOffset;
  outState = texelFetch(uState, source, 0).r;
  outLayers = texelFetch(uLayers, source, 0);
}
