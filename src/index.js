/**
 * Performance check tool for scalable quality project.
 * Use this tool to check current state of performance based on fps/ms of project during navigation.
 * @export
 * @class PerformanceFps
 */
export default class PerformanceFps {
  /**
   * Convert FPS to ms
   * @name fpsToMs
   * @static
   * @param {number} value fps
   * @returns {number} ms
   * @memberof PerformanceFps
   */
  static fpsToMs(value) {
    return (1 / value) * 1000;
  }

  /**
   * Convert ms to FPS
   * @name msToFps
   * @static
   * @param {number} value ms
   * @returns {number} fps
   * @memberof PerformanceFps
   */
  static msToFps(value) {
    return 1000 / value;
  }

  /**
   * Creates an instance of PerformanceFps.
   * @param {object} props
   * @memberof PerformanceFps
   */
  constructor(props) {
    this.events = {};
    this.props = Object.assign(
      {
        min: -2,
        max: 2,
        start: 0,
        samples: 100,
        accuracy: 64,
        delay: 2000,
        maxFps: 60,
        minFps: 30,
        checkFps: 54,
        upperCheckFps: 58,
        maxTryToUpper: 1,
        reCheckAfter: false,
      },
      props,
    );

    this.now = () => performance.now() || Date.now;

    this.reset();

    this.pause = this.pause.bind(this);
    document.addEventListener('visibilitychange', this.pause, false);
  }

  /**
   * Create event or get if exist
   * @name getEvent
   * @returns void
   * @memberof PerformanceFps
   */
  getEvent(eventName) {
    if (typeof this.events[eventName] === 'undefined') this.events[eventName] = new Set();
    return this.events[eventName];
  }

  /**
   * Listener event
   * @name on
   * @returns void
   * @memberof PerformanceFps
   */
  on(eventName, fn) {
    this.getEvent(eventName).add(fn);
  }

  /**
   * Emit event
   * @name emit
   * @returns void
   * @memberof PerformanceFps
   */
  emit(eventName, ...args) {
    this.getEvent(eventName).forEach((fn) => {
      fn.apply(this, args);
    });
  }

  /**
   * Remove listener of events
   * @name removeListener
   * @returns void
   * @memberof PerformanceFps
   */
  removeListener(eventName, fn) {
    this.getEvent(eventName).delete(fn);
  }

  /**
   * Paused
   * @name pause
   * @returns void
   * @memberof PerformanceFps
   */
  pause() {
    this.isPaused = document.hidden;
    this.reset();
  }

  /**
   * Remove listener
   * @name destroy
   * @returns void
   * @memberof PerformanceFps
   */
  destroy() {
    document.removeEventListener('visibilitychange', this.pause, false);
    this.removeListener('change', this.performance);
  }

  /**
   * Reset/Set state
   * @name reset
   * @param {boolean} soft not reset checked performance, but can upper level
   * @returns void
   * @memberof PerformanceFps
   */
  reset(soft) {
    const {
      start,
      maxFps,
      reCheckAfter,
      checkFps,
    } = this.props;

    this.upper = 0;
    this.failIncrement = 0;
    this.ms = this.constructor.fpsToMs(maxFps);
    this.average = this.ms;

    if (!soft) {
      this.prev = this.now();
      this.performance = start;
      this.reCheckAfter = reCheckAfter;
      this.checkCurrentFps = checkFps;
      this.isTooLow = false;
      this.elapsedTime = 0;
      this.resetTime = 0;
      this.store = [];
      this.storedMs = 0;
    }

    if (!this.delay) this.delay = this.props.delay;
  }

  /**
   * Check if
   * • level is too low
   * • level is low compared to limit
   * • level is upper
   * Use limit number of times to check if level is upper, to avoid bouncing effect
   * Emit event of level change only if is changed
   * @name setPerformance
   * @returns void
   * @memberof PerformanceFps
   */
  setPerformance() {
    const {
      min,
      max,
      minFps,
      maxTryToUpper,
      checkFps,
      upperCheckFps,
    } = this.props;

    if (this.constructor.msToFps(this.average) <= minFps) {
      this.performance = min;
      this.isTooLow = true;
    } else if (this.constructor.msToFps(this.average) < this.checkCurrentFps) {
      this.performance -= 1;
      if (this.upper > 0) this.failIncrement += 1;
      this.checkCurrentFps = checkFps;
    } else if (
      this.constructor.msToFps(this.average) > upperCheckFps &&
      this.failIncrement < maxTryToUpper &&
      this.performance < max
    ) {
      this.upper += 1;
      this.performance += 1;
      this.checkCurrentFps = upperCheckFps;
    }

    if (this.prevPerformance !== this.performance) {
      this.emit('change', this.performance);
    }

    this.prevPerformance = this.performance;
  }

  /**
   * Update
   * @name update
   * @returns void
   * @memberof PerformanceFps
   */
  update() {
    if (this.isTooLow || this.isPaused) return;

    const {
      accuracy,
      min,
      samples,
    } = this.props;

    const time = this.now();
    const ms = time - this.prev;
    this.prev = time;
    this.ms = ms;

    if (time < this.delay) return;

    this.storedMs += ms;

    if (
      this.storedMs >= accuracy &&
      this.performance > min
    ) {
      if (ms === 0) return;

      this.prevPerformance = this.performance;
      this.delay = 0;

      if (this.reCheckAfter && time > this.reCheckAfter) {
        this.reset(true);
        this.reCheckAfter += time;
        this.resetTime += 1;
      }

      this.store.push(ms);

      if (this.store.length > samples - 1) {
        this.average = this.store.reduce((p, c) => p + c) / this.store.length;
        this.setPerformance();
        this.store = [];
      }
      this.storedMs = 0;
    }
  }
}
