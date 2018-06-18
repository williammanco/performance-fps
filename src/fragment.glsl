precision highp float;
  uniform vec2 uScreenSize;
  uniform float uTime;
  uniform int uPerfLevel;
  
  float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }

  float noise (vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
  
      // Four corners in 2D of a tile
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
  
      // Smooth Interpolation
  
      // Cubic Hermine Curve.  Same as SmoothStep()
      vec2 u = f*f*(3.0-2.0*f);
      // u = smoothstep(0.,1.,f);
  
      // Mix 4 coorners porcentages
      return mix(a, b, u.x) +
              (c - a)* u.y * (1.0 - u.x) +
              (d - b) * u.x * u.y;
  }
  
  float fbm (in vec2 st) {
      float value = 0.0;
      float amplitude = 0.3;
      float frequency = 3.0;
      for (int i = 0; i < 50; i++) {
          value += noise(st * frequency) * amplitude;
      }
      return value;
  }

  void main() {
    vec2 st = gl_FragCoord.xy/uScreenSize.xy;
    st.x *= uScreenSize.x/uScreenSize.y;
    
    vec2 shift = vec2(uTime * 0.001);
        
    vec2 f = vec2(2.0);
    f += fbm(st + shift * 0.1) * 1.9;
    
    if (uPerfLevel > -1) {
      f += fbm(st + shift * 0.2) * 1.5;
    }

    if (uPerfLevel == 1) {
      for (int i = 0; i < 5; i++) {
          f += fbm(st + shift * 0.2) * float(i) * 0.5;
      }
    }

    if (uPerfLevel == 2) {
      for (int i = 0; i < 30; i++) {
          f += fbm(st + shift * 0.5) * float(i) * 0.1;
      }
    }

    vec3 color = vec3(0.0);
    
    color += fbm(f) * 1.0;
    gl_FragColor = vec4(color,1.0);
}