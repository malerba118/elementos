import { atom, molecule, batched } from 'elementos'

export const createPagination = ({
  page,
  totalPages
}: {
  page: number
  totalPages: number | null
}) => {
  const page$ = atom(page, {
    actions: (set) => ({
      next: () => set((prev) => prev + 1),
      prev: () => set((prev) => prev - 1),
      jumpTo: (page: number) => set(page)
    })
  })

  const totalPages$ = atom(totalPages)

  const pagination$ = molecule(
    {
      page: page$,
      totalPages: totalPages$
    },
    {
      actions: ({ page, totalPages }) => ({
        nextPage: () => {
          let nextPage = page.get() + 1
          const total = totalPages.get()
          if (total && nextPage <= total) {
            page.actions.next()
          }
        },
        prevPage: () => {
          let nextPage = page.get() - 1
          if (nextPage > 0) {
            page.actions.prev()
          }
        },
        setTotalPages: (n: number) => {
          if (page.get() > n) {
            batched(() => {
              totalPages.actions.set(n)
              page.actions.jumpTo(n)
            })()
          } else {
            totalPages.actions.set(n)
          }
        }
      })
    }
  )

  return pagination$
}
