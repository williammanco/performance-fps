import toy from 'gl-toy'; // eslint-disable-line import/no-extraneous-dependencies
import PerformanceFps from '../index';
import fragment from './fragment.glsl';

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
      <li><span>FPS</span><span><b>${round(1000 / perf.ms, 1)}</b></span></li>
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
