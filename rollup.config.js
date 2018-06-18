import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
// import builtins from 'rollup-plugin-node-builtins';
import replace from 'rollup-plugin-replace';
import serve from 'rollup-plugin-serve';
import eslint from 'rollup-plugin-eslint';
import glsl from 'rollup-plugin-glsl'; // eslint-disable-line
import eslintConfig from 'eslint-config-airbnb-base';

import pkg from './package.json';

// const production = !process.env.ROLLUP_WATCH;

export default [
  {
    input: 'src/main.js',
    output: {
      name: 'index',
      file: pkg.browser,
      format: 'umd',
    },
    plugins: [
      resolve(),
      eslint(eslintConfig),
      commonjs({
        include: 'node_modules/**',
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
    ],
  },
  {
    input: 'src/index.js',
    output: {
      file: 'public/bundle.js',
      format: 'iife',
      sourcemap: true,
    },
    plugins: [
      resolve(),
      eslint(eslintConfig),
      glsl({
        include: 'src/**/*.glsl',
        sourceMap: false,
      }),
      commonjs(),
      serve('public'),
    ],
  },
];
