import fs from 'fs'
import log from 'electron-log'
import { orgRepo } from '../database/repository'
import type { MoveOperation } from '../../../src/shared/types'

export async function undoMoveOperation(operationId: string): Promise<void> {
  log.info(`Undoing move operation: ${operationId}`)
  // This will be fully implemented when move execution is built
  // Placeholder that verifies the operation exists
  log.warn(`Undo operation ${operationId} - implementation pending`)
}

export async function undoSession(sessionId: string): Promise<{ undone: number; failed: number }> {
  const operations = orgRepo.findMoveOpsBySession(sessionId)
  const completed = operations.filter(op => op.status === 'completed')

  let undone = 0
  let failed = 0

  // Reverse order - undo last moves first
  for (const op of [...completed].reverse()) {
    try {
      await reverseMoveOperation(op)
      orgRepo.undoMoveOperation(op.id)
      undone++
    } catch (err) {
      log.error(`Failed to undo operation ${op.id}:`, err)
      failed++
    }
  }

  log.info(`Undo session complete: ${undone} undone, ${failed} failed`)
  return { undone, failed }
}

async function reverseMoveOperation(op: MoveOperation): Promise<void> {
  if (!fs.existsSync(op.destinationPath)) {
    throw new Error(`Destination file not found: ${op.destinationPath}`)
  }

  if (fs.existsSync(op.sourcePath)) {
    throw new Error(`Source path already occupied: ${op.sourcePath}`)
  }

  fs.renameSync(op.destinationPath, op.sourcePath)
  log.info(`Reversed move: ${op.destinationPath} → ${op.sourcePath}`)
}
