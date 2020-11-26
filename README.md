![foo](https://github.com/malerba118/elementos-docs/blob/main/static/img/logo.svg)

[![NPM](https://img.shields.io/npm/v/elementos.svg)](https://www.npmjs.com/package/elementos) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Elementos is a framework-agnostic, reactive state management library with an emphasis on state composition and encapsulation.

**Please see the [full documentation](https://malerba118.github.io/elementos-docs)!**
 
## Install

```bash
npm install --save elementos
```

## Basic Usage

[Open in CodeSandbox](https://codesandbox.io/s/elementos-dialog-state-p02d5)

```jsx
import { atom, molecule, batched } from 'elementos'

const createVisibility$ = (defaultValue) => {
  return atom(defaultValue, {
    actions: (set) => ({
      open: () => set(true),
      close: () => set(false)
    })
  });
};

const createDialog$ = ({ isOpen = false, context = null } = {}) => {
  const visibility$ = createVisibility$(isOpen);
  const context$ = atom(context);

  const dialog$ = molecule(
    {
      visibility: visibility$,
      context: context$
    },
    {
      actions: ({ visibility, context }) => ({
        open: batched((nextContext) => {
          context.actions.set(nextContext);
          visibility.actions.open();
        }),
        close: batched(() => {
          context.actions.set(null);
          visibility.actions.close();
        })
      }),
      deriver: ({ visibility, context }) => ({
        isOpen: visibility,
        context
      })
    }
  );

  return dialog$;
};
```

## License

MIT © [malerba118](https://github.com/malerba118)
