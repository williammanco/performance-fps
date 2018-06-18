import toy from 'gl-toy';
import PerformanceFps from './main';
import fragment from './fragment.glsl';

document.getElementById('app').innerHTML = 'Check the performance ...';

const perf = new PerformanceFps();

const rAF = () => {
  perf.tick();
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
  console.log(program.shader.uniforms); /* eslint-disable-line */
  document.getElementById('app').innerHTML = `Ok! Your performace level is <b>${e}</b>`;
});
