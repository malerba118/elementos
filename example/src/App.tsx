import React from 'react'
import { observe } from 'elementos'
import { useInit } from './react/useInit'
import { useObservable } from './react/useObservable'
import { createRequest } from './state/request'
import { createPagination } from './state/pagination'
import * as api from './api'

const App = () => {
  const self = useInit(({ beforeUnmount }) => {
    const pagination$ = createPagination({ page: 1, totalPages: 10 })
    const request$ = createRequest([])

    beforeUnmount(
      observe(request$, ({ isPending, status, data }) => {
        console.log({ isPending, status, data })
      })
    )

    beforeUnmount(
      observe(pagination$, ({ page }) => {
        request$.actions.setPending()
        api
          .fetchTodos({ page })
          .then((data) => {
            request$.actions.setFulfilled(data)
          })
          .catch(request$.actions.setRejected)
      })
    )

    return {
      pagination$,
      request$
    }
  })

  const request = useObservable(self.request$)
  const pagination = useObservable(self.pagination$)

  return (
    <div className='App'>
      <button
        onClick={() => {
          self.pagination$.actions.prevPage()
        }}
      >
        Prev
      </button>
      <span style={{ margin: 4 }}>
        Page {pagination.page} of {pagination.totalPages}
      </span>
      <button
        onClick={() => {
          self.pagination$.actions.nextPage()
        }}
      >
        Next
      </button>
      {request.isPending && <p>loading</p>}
      {request.isFulfilled && (
        <ul>
          {request.data?.map((todo: any) => (
            <li key={todo.id}>{todo.title}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App
