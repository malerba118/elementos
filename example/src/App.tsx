import React from 'react'

import { atom, molecule, observe } from 'elementos'

const a = atom(0, {
  actions: (set) => ({
    foo: () => 3
  })
})

const b = atom(0)
const c = molecule(
  {
    a,
    b
  },
  {
    deriver: ({ a, b }) => a + b,
    actions: (set) => ({
      foo: () => 3
    })
  }
)

observe(c, console.log)

const App = () => {
  return <div>hi</div>
}

export default App
