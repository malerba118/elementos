import { atom, molecule, batched } from 'elementos'

const createVisibility$ = (defaultValue: boolean) => {
  return atom(defaultValue, {
    actions: (set) => ({
      open: () => set(true),
      close: () => set(false)
    })
  })
}

type CreateDialogOptions<Context> = {
  defaultVisibility?: boolean
  defaultContext?: Context | null
}

export const createDialog$ = <Context>({
  defaultVisibility = false,
  defaultContext = null
}: CreateDialogOptions<Context> = {}) => {
  const visibility$ = createVisibility$(defaultVisibility)
  const context$ = atom<Context | null>(defaultContext)

  const dialog$ = molecule(
    {
      visibility: visibility$,
      context: context$
    },
    {
      actions: ({ visibility, context }) => ({
        open: batched((nextContext: Context) => {
          context.actions.set(nextContext)
          visibility.actions.open()
        }),
        close: batched(() => {
          context.actions.set(null)
          visibility.actions.close()
        })
      }),
      deriver: ({ visibility, context }) => ({
        isOpen: visibility,
        context
      })
    }
  )

  return dialog$
}

type User = {
  firstName: string
  lastName: string
  email: string
}

const dialog$ = createDialog$<User>()

dialog$.actions.open({
  firstName: '1',
  lastName: '1',
  email: '1'
})
