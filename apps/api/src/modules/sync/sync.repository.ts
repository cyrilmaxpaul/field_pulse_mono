import type { PrismaClient, SyncOperationStatus, SyncOperationType } from "@prisma/client";

export function createSyncRepository(prisma: PrismaClient) {
  return {
    upsertDevice: (
      organizationId: string,
      userId: string,
      deviceId: string,
      meta: { deviceName?: string; platform?: string; appVersion?: string },
    ) =>
      prisma.device.upsert({
        where: { userId_deviceId: { userId, deviceId } },
        update: { ...meta, lastSyncAt: new Date() },
        create: { organizationId, userId, deviceId, ...meta, lastSyncAt: new Date() },
      }),

    findDevice: (organizationId: string, userId: string, deviceId: string) =>
      prisma.device.findFirst({ where: { organizationId, userId, deviceId } }),

    createSyncOperation: (data: {
      organizationId: string;
      userId: string;
      deviceId: string;
      entityType: string;
      entityId: string;
      operation: SyncOperationType;
      clientVersion: number;
      payload: unknown;
    }) =>
      prisma.syncOperation.create({
        data: { ...data, payload: data.payload as never },
      }),

    updateSyncOperationStatus: (
      id: string,
      status: SyncOperationStatus,
      details?: { errorCode?: string; errorMessage?: string },
    ) =>
      prisma.syncOperation.update({
        where: { id },
        data: { status, processedAt: new Date(), ...details },
      }),

    findSyncOperation: (organizationId: string, userId: string, id: string) =>
      prisma.syncOperation.findFirst({ where: { id, organizationId, userId } }),

    listConflicts: (organizationId: string, userId: string) =>
      prisma.syncOperation.findMany({
        where: { organizationId, userId, status: "CONFLICT" },
        orderBy: { createdAt: "asc" },
      }),

    listAssignedActiveInspections: (organizationId: string, userId: string, since?: Date) =>
      prisma.inspection.findMany({
        where: {
          organizationId,
          assignedTo: userId,
          status: { in: ["ASSIGNED", "IN_PROGRESS", "REWORK_REQUIRED"] },
          ...(since ? { updatedAt: { gt: since } } : {}),
        },
        include: { responses: { select: { questionId: true, serverVersion: true, value: true } } },
      }),
  };
}
