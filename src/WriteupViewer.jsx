PS C:\Users\test\Desktop\forrof-portfolio-final.tar\forrof-portfolio-final\forrof-portfolio> npm run deploy

> forrof-portfolio@0.1.0 predeploy
> npm run build


> forrof-portfolio@0.1.0 build
> cross-env NODE_OPTIONS=--localstorage-file=./.localstorage react-scripts build

PS C:\Users\test\Desktop\forrof-portfolio-final.tar\forrof-portfolio-final\forrof-portfolio>
Failed to compile.

SyntaxError: C:\Users\test\Desktop\forrof-portfolio-final.tar\forrof-portfolio-final\forrof-portfolio\src\WriteupViewer.jsx: Support for the experimental syntax 'decorators' isn't currently enabled (1:1):
> 1 | @tailwind base;
    | ^
  2 | @tailwind components;
  3 | @tailwind utilities;
  4 |

Add @babel/plugin-proposal-decorators (https://github.com/babel/babel/tree/main/packages/babel-plugin-proposal-decorators) to the 'plugins' section of your Babel config to enable transformation.
If you want to leave it as-is, add @babel/plugin-syntax-decorators (https://github.com/babel/babel/tree/main/packages/babel-plugin-syntax-decorators) to the 'plugins' section to enable parsing.

If you already added the plugin for this syntax to your config, it's possible that your config isn't being loaded.
You can re-run Babel with the BABEL_SHOW_CONFIG_FOR environment variable to show the loaded configuration:
        npx cross-env BABEL_SHOW_CONFIG_FOR=C:\Users\test\Desktop\forrof-portfolio-final.tar\forrof-portfolio-final\forrof-portfolio\src\WriteupViewer.jsx <your build command>
See https://babeljs.io/docs/configuration#print-effective-configs for more info.
    at parser.next (<anonymous>)
    at normalizeFile.next (<anonymous>)
    at run.next (<anonymous>)
    at transform.next (<anonymous>)