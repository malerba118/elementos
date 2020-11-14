import React from 'react'

import { atom, molecule, observe } from 'elementos'

const a = atom(0, {
  actions: (set) => ({
    foo: () => set(3)
  })
})

const b = atom(0)
const c = molecule(
  {
    a,
    b
  },
  {
    deriver: ({ a, b }) => a + b
  }
)

observe(c, console.log)
a.actions.foo()

const App = () => {
  return <div>hi</div>
}

export default App
