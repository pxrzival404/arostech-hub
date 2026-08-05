import { prisma } from '../../db/prisma'
import { NotificationType, JobStatus, NotificationJob } from '@prisma/client'
import { sendRfqAcknowledgment, sendInternalNotification } from './resend'
import { alertNewRfq, alertQueueFailure } from './telegram'

export class NotificationQueue {
  /**
   * Enqueues a notification job to Postgres database
   */
  static async enqueue(
    type: NotificationType,
    leadId: string,
    payload: any
  ): Promise<NotificationJob> {
    const job = await prisma.notificationJob.create({
      data: {
        type,
        leadId,
        payload: payload || {},
        status: JobStatus.PENDING,
        attempts: 0,
        maxAttempts: 3,
        nextAttemptAt: new Date(),
      },
    })

    // Execute first attempt asynchronously in the background
    void this.processJob(job.id).catch((err) => {
      console.error(`Error executing initial processJob for ${job.id}:`, err)
    })

    return job
  }

  /**
   * Processes a single notification job by ID
   */
  static async processJob(jobId: string): Promise<void> {
    const job = await prisma.notificationJob.findUnique({
      where: { id: jobId },
      include: { lead: true },
    })

    if (!job || job.status === JobStatus.PROCESSING || job.status === JobStatus.COMPLETED) {
      return
    }

    let updatedJob: NotificationJob
    try {
      updatedJob = await prisma.notificationJob.update({
        where: {
          id: jobId,
          status: { in: [JobStatus.PENDING, JobStatus.FAILED] }, // optimistic concurrency check
        },
        data: {
          status: JobStatus.PROCESSING,
          lastAttemptAt: new Date(),
          attempts: { increment: 1 },
        },
      })
    } catch (err) {
      // Concurrency lock collision: already processed or processing
      return
    }

    try {
      // Execute based on notification type
      switch (updatedJob.type) {
        case NotificationType.EMAIL_ACK:
          await sendRfqAcknowledgment(job.lead)
          break
        case NotificationType.EMAIL_INTERNAL:
          await sendInternalNotification(job.lead)
          break
        case NotificationType.TELEGRAM:
          await alertNewRfq(job.lead)
          break
        default:
          throw new Error(`Unsupported notification type: ${updatedJob.type}`)
      }

      // Mark COMPLETED on success
      await prisma.notificationJob.update({
        where: { id: jobId },
        data: {
          status: JobStatus.COMPLETED,
          nextAttemptAt: null,
          errorLog: null,
        },
      })
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error))
      const currentAttempts = updatedJob.attempts // increment was already applied and returned

      if (currentAttempts < updatedJob.maxAttempts) {
        // Schedule next retry with exponential backoff (1s, 2s, 4s)
        const delaySeconds = Math.pow(2, currentAttempts - 1)
        const nextAttemptAt = new Date(Date.now() + delaySeconds * 1000)

        await prisma.notificationJob.update({
          where: { id: jobId },
          data: {
            status: JobStatus.PENDING,
            nextAttemptAt,
            errorLog: errorObj.message,
          },
        })
      } else {
        // Max attempts reached - mark as permanently FAILED and trigger admin Telegram alert
        const finalJob = await prisma.notificationJob.update({
          where: { id: jobId },
          data: {
            status: JobStatus.FAILED,
            nextAttemptAt: null,
            errorLog: errorObj.message,
          },
        })

        // Fire Telegram alert to admin
        try {
          await alertQueueFailure({ ...finalJob, lead: job.lead }, errorObj)
        } catch (tgErr) {
          console.error('Failed to send Telegram admin alert for queue failure:', tgErr)
        }
      }
    }
  }

  /**
   * Processes all pending or retryable failed jobs
   */
  static async processAllPending(): Promise<void> {
    const now = new Date()
    const pendingJobs = await prisma.notificationJob.findMany({
      where: {
        status: { in: [JobStatus.PENDING, JobStatus.FAILED] },
        nextAttemptAt: { lte: now },
      },
    })

    if (pendingJobs.length === 0) {
      return
    }

    // Process all jobs in parallel
    await Promise.allSettled(
      pendingJobs.map((job) => this.processJob(job.id))
    )
  }
}
