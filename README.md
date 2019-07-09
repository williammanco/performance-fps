# Performance FPS

⭐️ [New fast, small and functional version] (https://github.com/williammanco/check-performance)

Performance check tool for **scalable** quality project.
Use this tool to check current state of performance based on fps/ms of project during navigation.

[Demo](https://williammanco.github.io/performance-fps/public/)

## Features

	🎲 highly configurable
	☮️ dependecy free
	📦 only 2kB
	🚀 every frame ~0.07ms
	⚾ control bouncing effect (increase/decrease perf)
	🧟 execute live only on rAF (no internal timing)
	🙈 check reset when change tab (visibilitychange)


## Getting Started

Supports UMD, AMD and CommonJS format.

With NPM or yarn or download and use script

Clone this repository to generate build or take "performance-fps.min.js" from root

```
npm i performance-fps
```
```
yarn add performance-fps
```
```
<script src="performance-fps.min.js" type="text/javascript"></script>
```

## Usage

First instantiate the class
```
const checkFps = new PerformanceFps();
```
Push instance with update method on your rAF
```
const rAF = () => {
	checkFps.update();
	requestAnimationFrame(rAF);
};
```
Use onChange method to update your code with the performance when level change or check simply properties `checkFps.performance` in your code when deserve
```
checkFps.on('change', (e) => {
  this.yourPerformanceLevel = e;
});
```

## Default configuration and Options

You can set all or one of this option  with your parameters.
This configuration is setting with take balanced speed/quality of checked performance.

Use samples and accuracy to increase the speed and quality of check. 

```
const checkFps = new PerformanceFps({
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
});
```

Options | Default | Unit | Info
--- | --- | --- | ---
`min`| `-2` | `level` | use this option to limit min level of performance returned
`max`| `2` | `level` | use this option to limit max level of performance returned
`start`| `0` | `level` | start value of level
`samples`| `100` | `-` | used to take the average of fps, more (not much) samples make the average more accurate but increase the time to check, one sample take every ms value on accuracy option
`accuracy`| `64` | `ms` | time between every samples, more time less quality of check, this depends on current performance, if you have ~16ms/60fps the sample is taken every ~64ms
`delay`| `2000` | `ms` | start to check after this value
`maxFps`| `60` | `fps` | change if limit is upper than 60fps
`minFps`| `30` | `fps` | if current performance is lower a minimum level of performance is setted
`checkFps`| `54` | `fps` | limit of check, if lower decrease the level
`upperCheckFps`| `58` | `fps` | check update with this value to try upper level
`maxTryToUpper`| `1` | `times` | used to try to increase value if check fail more than 1 times
`reCheckAfter`| `false` | `ms` | after this time start recheck (and try to increase value)



## Next features and improvements

An external GUI with check properties 	to get configuration more simply and 	realtime for single project. 


## Motivation

It allows to make the project usable on different devices, able to make scalable and more adaptive to device.

## Author

William Manco @ https://twitter.com/williammanco

## License

[MIT](http://opensource.org/licenses/mit-license.php)
