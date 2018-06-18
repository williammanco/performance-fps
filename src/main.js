import Events from 'nanoevents';

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
    this.props = Object.assign(
      {
        min: -2,
        max: 2,
        start: 0,
        samples: 10,
        accuracy: 500, // a check every 1000ms
        maxFps: 60,
        minFps: 20,
        checkFps: 40,
        upperCheckFps: 58,
        maxPerformance: false, // checkFps = 58
      },
      props,
    );
    this.now = () => performance.now() || Date.now;
    this.checkFps = this.props.checkFps;
    this.prev = this.now();
    this.performance = this.props.start;
    this.store = [];
    this.storedMs = 0;
    this.emitter = new Events();

    if (this.props.maxPerformance) this.checkFps = 58;
  }
  onChange(args) {
    return this.emitter.on('change', args);
  }
  tick() {
    if (this.isTooLow) return;
    const time = this.now();
    const ms = time - this.prev;
    this.prev = time;
    this.ms = ms;

    this.storedMs += ms;

    if (
      this.storedMs >= this.props.accuracy &&
      this.performance > this.props.min
    ) {
      if (ms === 0) return;
      this.store.push(ms);
      if (this.store.length > this.props.samples - 1) {
        // calc average in ms
        this.average =
          this.store.reduce((p, c) => p + c) / this.store.length;

        // check performance
        if (PerformanceFps.msToFps(this.average) <= this.props.minFps) {
          this.performance = this.props.min;
          this.isTooLow = true;
        } else if (PerformanceFps.msToFps(this.average) < this.checkFps) {
          this.performance -= 1;
          this.hasTried = true;
          this.checkFps = this.props.checkFps;
        } else if (
          PerformanceFps.msToFps(this.average) > this.props.maxFps - 2 &&
            !this.hasTried
        ) {
          this.performance += 1;
          this.checkFps = this.props.upperCheckFps;
        }

        this.emitter.emit('change', this.performance);

        this.store = [];
      }
      this.storedMs = 0;
    }
  }
}
