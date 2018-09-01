import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import serve from 'rollup-plugin-serve';
import eslint from 'rollup-plugin-eslint';
import glsl from 'rollup-plugin-glsl'; // eslint-disable-line
import cleaner from 'rollup-plugin-cleaner';
import { terser } from 'rollup-plugin-terser';

import eslintConfig from 'eslint-config-airbnb-base';

import pkg from './package.json';

const production = !process.env.ROLLUP_WATCH;

export default [
  {
    input: 'src/main.js',
    output: {
      name: 'PerformanceFps',
      file: pkg.browser,
      format: 'umd',
      sourceMap: !production,
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
      production && terser(),
      cleaner({
        targets: [
          './dist/',
        ],
      }),
    ],
  },
  {
    input: 'src/main.js',
    external: ['ms'],
    output: [
      { file: pkg.main, format: 'cjs', sourceMap: !production },
      { file: pkg.module, format: 'es', sourceMap: !production },
    ],
    plugins: [
      production && terser(),
    ],
  },
  {
    input: 'src/main.js',
    external: ['ms'],
    output: {
      name: 'PerformanceFps',
      file: 'performance-fps.min.js',
      format: 'umd',
      sourceMap: !production,
    },
    plugins: [
      production && terser(),
    ],
  },
  {
    input: 'src/test/index.js',
    output: {
      name: 'PerformanceFps',
      file: 'public/bundle.js',
      format: 'umd',
    },
    plugins: [
      production && resolve(),
      cleaner({
        targets: [
          './public/bundle.*',
        ],
      }),
      eslint(eslintConfig),
      glsl({
        include: 'src/**/*.glsl',
        sourceMap: !production,
      }),
      commonjs(),
      !production && serve('public'),
    ],
  },
];
