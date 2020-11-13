import { Transaction } from './transaction'

let currentTransaction: Transaction | undefined

export const getCurrentTransaction = () => currentTransaction
export const setCurrentTransaction = (transaction: Transaction | undefined) => {
  currentTransaction = transaction
}
