import { atom, molecule, batched } from 'elementos'

enum Status {
  Initial = 'initial',
  Pending = 'pending',
  Fulfilled = 'fulfilled',
  Rejected = 'rejected'
}

export const createRequest = <T>(initialData: T) => {
  const status$ = atom(Status.Initial)
  const data$ = atom(initialData)
  const error$ = atom(null as Error | null)

  return molecule(
    {
      status: status$,
      data: data$,
      error: error$
    },
    {
      actions: ({ status, data, error }) => ({
        setPending: batched(() => {
          status.actions.set(Status.Pending)
          error.actions.set(null)
        }),
        setFulfilled: batched((result) => {
          status.actions.set(Status.Fulfilled)
          data.actions.set(result)
          error.actions.set(null)
        }),
        setRejected: batched((err) => {
          status.actions.set(Status.Rejected)
          error.actions.set(err)
        })
      }),
      deriver: ({ status, data, error }) => {
        return {
          isInitial: status === Status.Initial,
          isPending: status === Status.Pending,
          isFulfilled: status === Status.Fulfilled,
          isRejected: status === Status.Rejected,
          status,
          data,
          error
        }
      }
    }
  )
}
