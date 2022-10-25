# Ali Lowcode Engine with React Webpack Typescript Starter
> Minimal starter with hot module replacement (HMR) for rapid development.
## Ali Lowcode Engine and formily lowcode material
* **[Ali Lowcode Engine](https://lowcode-engine.cn/)**
* **[formily lowcode](https://github.com/seada-low-code/lowcode-ecology)**

## React Webpack Typescript
* **[React](https://facebook.github.io/react/)** (18.x)
* **[Webpack](https://webpack.js.org/)** (5.x)
* **[Typescript](https://www.typescriptlang.org/)** (4.x)
* **[Hot Module Replacement (HMR)](https://webpack.js.org/concepts/hot-module-replacement/)** + [Fast Refresh](https://github.com/pmmmwh/react-refresh-webpack-plugin)
* Image support ([Image Webpack Loader](https://github.com/tcoopman/image-webpack-loader))
* [SASS](http://sass-lang.com/) support
* Production build script
* Code linting ([ESLint](https://github.com/eslint/eslint)) and formatting ([Prettier](https://github.com/prettier/prettier))
* Test frameworks ([Jest](https://facebook.github.io/jest/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro))

## Installation
1. Clone/download repo
2. `yarn install`

## Usage
**Development**

`yarn run start`

* Build app continuously (HMR enabled)
* Designer page served @ `http://localhost:8080`
* Preview page served @ `http://localhost:8080/preview.html`
* List page served @ `http://localhost:8080/list.html`

**Production**

`yarn run start-prod`

* Build app once (HMR disabled) to `/dist/`
* App served @ `http://localhost:3000`

---

**All commands**

Command | Description
--- | ---
`yarn run start-dev` | Build app continuously (HMR enabled) and serve @ `http://localhost:8080`
`yarn run start-prod` | Build app once (HMR disabled) to `/dist/` and serve @ `http://localhost:3000`
`yarn run build` | Build app to `/dist/`
`yarn run test` | Run tests
`yarn run lint` | Run linter
`yarn run lint --fix` | Run linter and fix issues
`yarn run start` | (alias of `yarn run start-dev`)

**Note**: replace `yarn` with `npm` in `package.json` if you use npm.

## See also
* [Create React App](https://github.com/facebook/create-react-app)
* [Vite](https://vitejs.dev/)
* [Parsel](https://parceljs.org/)
