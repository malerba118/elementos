import { transaction } from './transaction'
import { getCurrentTransaction, setCurrentTransaction } from './context'

export const batched = <ExecutorParams extends any[], ExecutorReturn>(
  executor: (...args: ExecutorParams) => ExecutorReturn
) => {
  return (...args: ExecutorParams): ExecutorReturn => {
    // nested batch calls should be ignored in favor of the outermost
    let currentTransaction = getCurrentTransaction()
    if (currentTransaction) {
      //no-op
      return executor(...args)
    } else {
      currentTransaction = transaction()
      setCurrentTransaction(currentTransaction)
      try {
        let returnVal = executor(...args)
        currentTransaction.commit()
        setCurrentTransaction(undefined)
        return returnVal
      } catch (err) {
        if (currentTransaction) {
          currentTransaction.rollback()
        }
        setCurrentTransaction(undefined)
        throw err
      }
    }
  }
}
