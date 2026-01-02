export enum BatchStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export const BATCH_STATUS_LABELS: Record<BatchStatus, string> = {
  [BatchStatus.PENDING]: 'Pending',
  [BatchStatus.IN_PROGRESS]: 'In Progress',
  [BatchStatus.COMPLETED]: 'Completed',
  [BatchStatus.CANCELLED]: 'Cancelled',
}

export const BATCH_STATUS_COLORS: Record<BatchStatus, string> = {
  [BatchStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  [BatchStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  [BatchStatus.COMPLETED]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  [BatchStatus.CANCELLED]: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
}
