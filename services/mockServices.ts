export type MockResult<T> = { data: T; illustrative: true };

const mockDelay = (milliseconds = 120) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export async function projectService<T>(project: T): Promise<MockResult<T>> {
  await mockDelay();
  return { data: project, illustrative: true };
}

export async function roadmapService<T>(roadmap: T): Promise<MockResult<T>> {
  await mockDelay();
  return { data: roadmap, illustrative: true };
}

export async function applicationService<T>(application: T): Promise<MockResult<T>> {
  await mockDelay();
  return { data: application, illustrative: true };
}

export async function documentService<T>(document: T): Promise<MockResult<T>> {
  await mockDelay(240);
  return { data: document, illustrative: true };
}

export async function assistantService<T>(response: T): Promise<MockResult<T>> {
  await mockDelay(320);
  return { data: response, illustrative: true };
}

export async function regulatoryService<T>(update: T): Promise<MockResult<T>> {
  await mockDelay(420);
  return { data: update, illustrative: true };
}

export async function inspectionService<T>(inspection: T): Promise<MockResult<T>> {
  await mockDelay();
  return { data: inspection, illustrative: true };
}

export async function grievanceService<T>(grievance: T): Promise<MockResult<T>> {
  await mockDelay();
  return { data: grievance, illustrative: true };
}

export async function incentiveService<T>(scheme: T): Promise<MockResult<T>> {
  await mockDelay();
  return { data: scheme, illustrative: true };
}

export async function notificationService<T>(notification: T): Promise<MockResult<T>> {
  await mockDelay();
  return { data: notification, illustrative: true };
}

export async function analyticsService<T>(analytics: T): Promise<MockResult<T>> {
  await mockDelay();
  return { data: analytics, illustrative: true };
}

export async function adminService<T>(record: T): Promise<MockResult<T>> {
  await mockDelay();
  return { data: record, illustrative: true };
}
