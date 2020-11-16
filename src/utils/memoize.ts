export const defaultParamsEqual = (
  params1: any[] | undefined,
  params2: any[]
) => {
  if (params1 === undefined || params1.length !== params2.length) {
    return false
  }
  for (const i in params1) {
    if (!Object.is(params1[i], params2[i])) {
      return false
    }
  }
  return true
}

export interface MemoizedOptions<Params> {
  paramsEqual?: (prevParams: Params | undefined, currParams: Params) => boolean
}

export const memoized = <Params extends any[], Return>(
  fn: (...args: Params) => Return,
  { paramsEqual = defaultParamsEqual }: MemoizedOptions<Params> = {}
): ((...args: Params) => Return) => {
  let prevArgs: Params | undefined
  let prevReturn: any

  return (...args) => {
    if (!paramsEqual(prevArgs, args)) {
      prevArgs = args
      prevReturn = fn(...args)
    }
    return prevReturn
  }
}
