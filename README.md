# Performance FPS

Performance check tool for **scalable** quality project.
Use this tool to check current state of performance based on fps/ms of project during navigation.

Used in different awarded site (soon a list).

## Features

Long description wip...

	🎲 highly configurable
	☮️ dependecy free
	📦 only 2Kb
	🚀 every frame ~0.07ms
	⚾ no bouncing effect (increase/decrease perf)
	🧟 execeute live only on rAF (no internal timing)
	🙈 check reset when change tab (visibilitychange)


## Getting Started

Supports UMD, AMD and CommonJS format.

With NPM or yarn or download and use script

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
checkFps.onChange((e) => {
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
    max: 3,
    start: 0,
    samples: 30,
    accuracy: 96,
    delay: 1000,
    maxFps: 60,
    minFps: 30,
    checkFps: 55,
    upperCheckFps: 58,
    maxTryToUpper: 3,
    reCheckAfter: 60000,
});
```

Options | Default | Unit | Info
--- | --- | --- | ---
`min|max`| `-2` | `level` |use this option to limit level of performance returned
`start`| `0` | `level` | start value of level
`samples`| `30` | `-` | used to take the average of fps, more (not much) samples make the average more accurate but increase the time to check, one sample take every ms value on accuracy option
`accuracy`| `96` | `ms` | time between every samples, more time less quality of check, this depends on current performance, if you have ~16ms/60fps the sample is taken every ~96ms
`delay`| `1000` | `ms` | start to check after this value
`maxFps`| `60` | `fps` | change if limit is upper than 60fps
`minFps`| `30` | `fps` | if current performance is lower a minimum level of performance is setted
`checkFps`| `55` | `fps` | limit of check, if lower decrease the level
`upperCheckFps`| `58` | `fps` | check update with this value to try upper level
`maxTryToUpper`| `3` | `times` | used to try to increase value if check fail more than 3 times
`reCheckAfter`| `60000` | `ms` | after 60 seconds start recheck (and try to increase value)



## Next features and improvements

An external GUI with check properties 	to get configuration more simply and 	realtime for single project. 


## Motivation

It allows to make the project usable on different devices, able to make scalable and more adaptive to device.

## Author

William Manco @ https://twitter.com/williammanco

## License

[MIT](http://opensource.org/licenses/mit-license.php)