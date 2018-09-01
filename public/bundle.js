(function (toy) {
  'use strict';

  toy = toy && toy.hasOwnProperty('default') ? toy['default'] : toy;

  class PerformanceFps {
    static fpsToMs(value) {
      return (1 / value) * 1000;
    }
    static msToFps(value) {
      return 1000 / value;
    }
    get currentFps() {
      return Math.min(1000 / this.ms, this.props.maxFps);
    }
    get currentPerformance() {
      return this.performance;
    }
    constructor(props) {
      this.events = {};
      this.props = Object.assign(
        {
          min: -2, // ? min value of performance level
          max: 3, // ? max value of performance level
          start: 0, // ? start performance level
          samples: 30, // ? one sample every value of accuracy
          accuracy: 96, // ? a check every ~96ms
          delay: 1000, // ? delay check after ~1000ms
          maxFps: 60, // ? limit max fps
          minFps: 30, // ? if lower set true toolow
          checkFps: 55, // ? limit fps to check
          upperCheckFps: 58, // ? if can try more
          maxTryToUpper: 3, // ? time to try upper level
          reCheckAfter: 60000, // ? reset performance after 60s
        },
        props,
      );

      this.now = () => performance.now() || Date.now;

      this.reset();

      this.onPause = this.onPause.bind(this);
      document.addEventListener('visibilitychange', this.onPause, false);
    }
    getEvent(eventName) {
      if (typeof this.events[eventName] === 'undefined') this.events[eventName] = new Set();
      return this.events[eventName];
    }
    on(eventName, fn) {
      this.getEvent(eventName).add(fn);
    }
    emit(eventName, ...args) {
      this.getEvent(eventName).forEach((fn) => {
        fn.apply(this, args);
      });
    }
    removeListener(eventName, fn) {
      this.getEvent(eventName).delete(fn);
    }
    onChange(args) {
      return this.on('change', args);
    }
    onPause() {
      this.isPaused = document.hidden;
      this.reset();
    }
    destroy() {
      document.removeEventListener('visibilitychange', this.onPause, false);
      this.removeListener('change', this.performance);
    }
    reset(soft) {
      this.upper = 0;
      this.ms = this.constructor.fpsToMs(this.props.maxFps);
      this.average = this.ms;

      if (!soft) {
        this.prev = this.now();
        this.performance = this.props.start;
        this.reCheckAfter = this.props.reCheckAfter;
        this.checkCurrentFps = this.props.checkFps;
        this.isTooLow = false;
        this.failIncrement = 0;
        this.elapsedTime = 0;
        this.resetTime = 0;
        this.store = [];
        this.storedMs = 0;
      }

      if (!this.delay) this.delay = this.props.delay;
    }
    update() {
      if (this.isTooLow || this.isPaused) return;
      const time = this.now();
      const ms = time - this.prev;
      this.prev = time;
      this.ms = ms;

      if (time < this.delay) return;

      this.storedMs += ms;

      if (
        this.storedMs >= this.props.accuracy &&
        this.performance > this.props.min
      ) {
        if (ms === 0) return;
        this.delay = 0;
        if (time > this.reCheckAfter) {
          this.reset(true);
          this.reCheckAfter += time;
          this.resetTime += 1;
        }

        this.store.push(ms);

        if (this.store.length > this.props.samples - 1) {
          // calc average in ms
          this.average =
          this.store.reduce((p, c) => p + c) / this.store.length;
          // check performance
          if (this.constructor.msToFps(this.average) <= this.props.minFps) {
            this.performance = this.props.min;
            this.isTooLow = true;
          } else if (this.constructor.msToFps(this.average) < this.checkCurrentFps) {
            this.performance -= 1;
            if (this.upper > 0) this.failIncrement += 1;
            this.checkCurrentFps = this.props.checkFps;
          } else if (
            this.constructor.msToFps(this.average) > this.props.maxFps - 2 &&
            this.failIncrement < this.props.maxTryToUpper &&
            this.performance < this.props.max
          ) {
            this.upper += 1;
            this.performance += 1;
            this.checkCurrentFps = this.props.upperCheckFps;
          }

          this.emit('change', this.performance);

          this.store = [];
        }
        this.storedMs = 0;
      }
    }
  }

  var fragment = "precision highp float;uniform vec2 uScreenSize;uniform float uTime;uniform int uPerfLevel;float hash(vec2 p){return fract(1e4*sin(17.0*p.x+p.y*0.1)*(0.1+abs(sin(p.y*13.0+p.x))));}float noise(vec2 st){vec2 i=floor(st);vec2 f=fract(st);float a=hash(i);float b=hash(i+vec2(1.0,0.0));float c=hash(i+vec2(0.0,1.0));float d=hash(i+vec2(1.0,1.0));vec2 u=f*f*(3.0-2.0*f);return mix(a,b,u.x)+(c-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y;}float fbm(in vec2 st){float value=0.0;float amplitude=0.3;float frequency=3.0;for(int i=0;i<50;i++){value+=noise(st*frequency)*amplitude;}return value;}void main(){vec2 st=gl_FragCoord.xy/uScreenSize.xy;st.x*=uScreenSize.x/uScreenSize.y;vec2 shift=vec2(uTime*0.001);vec2 f=vec2(2.0);f+=fbm(st+shift*0.1)*1.9;if(uPerfLevel>-1){f+=fbm(st+shift*0.2)*1.5;}if(uPerfLevel==1){for(int i=0;i<5;i++){f+=fbm(st+shift*0.2)*float(i)*0.5;}}if(uPerfLevel==2){for(int i=0;i<20;i++){f+=fbm(st+shift*0.5)*float(i)*0.1;}}if(uPerfLevel==3){for(int i=0;i<40;i++){f+=fbm(st+shift*0.5)*float(i)*0.1;}}vec3 color=vec3(0.0);color+=fbm(f)*1.0;gl_FragColor=vec4(color,1.0);}";

  document.getElementById('info').innerHTML = 'Check the performance ...';

  const perf = new PerformanceFps();
  const round = (value, precision) => {
    const multiplier = window.Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
  };

  const rAF = () => {
    perf.update();
    document.getElementById('onupdate').innerHTML = `
    <ul>
      <li><span>Check minimum fps</span><span><b>${perf.checkCurrentFps}</b></span></li>
      <li><br /></li>
      <li><span>Is too low</span><span><b>${!!perf.isTooLow}</b></span></li>
      <li><span>Fail increment?</span><span><b>${perf.failIncrement}</b></span></li>
      <li><span>How many time upper?</span><span><b>${perf.upper}</b></span></li>
      <li><span>How many reset?</span><span><b>${perf.resetTime}</b></span></li>
      <li><br /></li>
      <li><span>Average Ms</span><span><b>${round(perf.average, 1)}</b></span></li>
      <li><span>Average FPS</span><span><b>${round(1000 / perf.average, 1)}</b></span></li>
      <li><br /></li>
      <li><span>Ms</span><span><b>${round(perf.ms, 1)}</b></span></li>
      <li><span>FPS</span><span><b>${round(perf.currentFps, 1)}</b></span></li>
    </ul>
  `;
    requestAnimationFrame(rAF);
  };

  rAF();

  const start = Date.now();

  const program = toy(fragment, (gl, shader) => {
    shader.uniforms.uScreenSize = [gl.drawingBufferWidth, gl.drawingBufferHeight]; /* eslint-disable-line */
    shader.uniforms.uTime = Date.now() - start; /* eslint-disable-line */
  });

  perf.onChange((e) => {
    program.shader.uniforms.uPerfLevel = e;
    const level = [
      'damn get off 😭',
      'low 😫',
      '🤞',
      'high 🤖',
      '😱 very high',
      'oh 💩 absurd! ',
    ];
    document.getElementById('onevent').innerHTML = `Ok! Your performance level is: <b>${level[e + 2]}</b>`;
  });

}(toy));
