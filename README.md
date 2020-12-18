![foo](https://github.com/malerba118/elementos-docs/blob/main/static/img/logo.svg)

[![NPM](https://img.shields.io/npm/v/elementos.svg)](https://www.npmjs.com/package/elementos) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Elementos is a framework-agnostic, reactive state management library with an emphasis on state composition and encapsulation.

**Please see the [full documentation](https://malerba118.github.io/elementos-docs)!**
 
## Install

```bash
npm install --save elementos
```

## Basic Usage

[Open in CodeSandbox](https://codesandbox.io/s/elementos-basic-usage-7yng7?file=/src/index.js)

```js
import { atom, molecule, observe } from "elementos";

document.getElementById("app").innerHTML = `
  <button id="inc-count-one">
    Increment Count One
  </button>
  <button id="inc-count-two">
    Increment Count Two
  </button>
  <p>
    Count One: <span id="count-one"></span>
  </p>
  <p>
    Count Two: <span id="count-two"></span>
  </p>
  <p>
    Sum: <span id="sum"></span>
  </p>
`;

const createCount$ = (defaultVal) => {
  return atom(defaultVal, {
    actions: (set) => ({
      increment: () => set((prev) => prev + 1)
    })
  });
};

const countOne$ = createCount$(0);
const countTwo$ = createCount$(0);
const sum$ = molecule(
  {
    countOne: countOne$,
    countTwo: countTwo$
  },
  {
    deriver: ({ countOne, countTwo }) => countOne + countTwo
  }
);

const elements = {
  incCountOne: document.getElementById("inc-count-one"),
  incCountTwo: document.getElementById("inc-count-two"),
  countOne: document.getElementById("count-one"),
  countTwo: document.getElementById("count-two"),
  sum: document.getElementById("sum")
};

elements.incCountOne.onclick = () => {
  countOne$.actions.increment();
};

elements.incCountTwo.onclick = () => {
  countTwo$.actions.increment();
};

observe(countOne$, (countOne) => {
  elements.countOne.innerHTML = countOne;
});

observe(countTwo$, (countTwo) => {
  elements.countTwo.innerHTML = countTwo;
});

observe(sum$, (sum) => {
  elements.sum.innerHTML = sum;
});
```

## License

MIT © [malerba118](https://github.com/malerba118)
