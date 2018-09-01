export default class PerformanceFps {
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
