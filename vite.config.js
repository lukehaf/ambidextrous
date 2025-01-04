import eslint from 'vite-plugin-eslint';
// As of 1/4/2025, there are 3 dots underneath 1st char of 'vite-plugin-eslint'. Here's the popup description, upon hover: "Could not find a declaration file for module 'vite-plugin-eslint'. '/Users/lukehafermann/CodeProjects/ambidextrous/node_modules/vite-plugin-eslint/dist/index.mjs' implicitly has an 'any' type. There are types at '/Users/lukehafermann/CodeProjects/ambidextrous/node_modules/vite-plugin-eslint/dist/index.d.ts', but this result could not be resolved when respecting package.json "exports". The 'vite-plugin-eslint' library may need to update its package.json or typings.ts(7016)"
// eslint functions perfectly, however, so I'm ignoring it. (eslint currently creates red squiggly lines in VScode, and the lint errors/warnings also successfully go to the command line & browser.
// It functions due to my following bit of troubleshooting: my .eslint.config.js file wasn't being found by VScode, so I created a .vscode/settings.json file which points to it. Likewise for vite. I had to edit this vite.config.js file (shown below) so vite can find the .eslint.config.js file.
//  (I think the 3 dots actually congrue with my troubleshooting, if I'm interpreting correctly that they mean that vite was unable to AUTOMATICALLY find its desired user-specified config file. (This is probably an issue with the 'vite-plugin-eslint' package not giving the correct default filename, now that eslint's moved to "flat specifications" and these .eslint.config.js files (instead of the original .eslintrc.js spec file).))

import { defineConfig } from 'vite';
import autoprefixer from 'autoprefixer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    eslint({
      overrideConfigFile: './.eslint.config.js',
    }),
  ],
  css: {
    postcss: {
      plugins: [
        autoprefixer(),
      ],
    },
  },
});

// Low-priority: here's a linting plugin I could try.
// Supposedly allows vscode to autocomplete (and lint) the 'import' statements at the top of each react component file. It's called eslint-plugin-import. (It becomes another dependency that gets installed when you run npm install.
// I originally heard about it bc this vite.config.js file (from Tim) originally included this line to disable one of its linting rules: /* eslint-disable import/no-extraneous-dependencies */
// If I want to try it, go to https://www.npmjs.com/package/eslint-plugin-import. It shows you how to add a little bit to this flat-config vite.config.js. Very straightforward
