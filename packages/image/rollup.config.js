import { dts } from 'rollup-plugin-dts';
import del from 'rollup-plugin-delete';
import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import ignore from 'rollup-plugin-ignore';
import alias from '@rollup/plugin-alias';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import nodePolyfills from 'rollup-plugin-polyfill-node';

import pkg from './package.json' with { type: 'json' };

const input = './src/index.ts';

const getExternal = ({ browser }) => {
  const deps = Object.keys(pkg.dependencies);
  const nodeBuiltins = ['fs', 'path', 'url'];

  if (browser) {
    // For browser: bundle pngjs (and subpaths like pngjs/browser.js)
    return (id) => {
      if (id.startsWith('pngjs')) return false; // bundle it
      if (nodeBuiltins.includes(id)) return false; // ignored by plugin
      return deps.includes(id);
    };
  }
  return [...deps, ...nodeBuiltins];
};

const getPlugins = ({ browser }) => [
  ...(browser
    ? [
        alias({
          entries: [{ find: 'pngjs', replacement: 'pngjs/browser.js' }],
        }),
      ]
    : []),
  typescript(),
  replace({
    preventAssignment: true,
    values: { BROWSER: JSON.stringify(browser) },
  }),
  ...(browser
    ? [
        ignore(['fs', 'path', 'url']),
        commonjs(),
        nodeResolve({ browser: true, preferBuiltins: false }),
        nodePolyfills({ include: null }),
      ]
    : []),
];

const serverConfig = {
  input,
  output: { format: 'es', file: 'lib/index.js' },
  external: getExternal({ browser: false }),
  plugins: getPlugins({ browser: false }),
};

const browserConfig = {
  input,
  output: { format: 'es', file: 'lib/index.browser.js' },
  external: getExternal({ browser: true }),
  plugins: getPlugins({ browser: true }),
};

const dtsConfig = {
  input: './lib/types/index.d.ts',
  output: [{ file: 'lib/index.d.ts', format: 'es' }],
  plugins: [dts(), del({ targets: 'lib/types', hook: 'buildEnd' })],
};

export default [serverConfig, browserConfig, dtsConfig];
