float discretize(float time, float interval) {
  return floor(time / interval) * interval;
}