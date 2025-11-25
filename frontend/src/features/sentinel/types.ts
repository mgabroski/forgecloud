export type LogSourceType = 'service' | 'audit' | 'job' | 'other';
export type LogSourceStatus = 'active' | 'inactive';

export interface SentinelSource {
  id: string;
  organizationId: string;
  projectId: string | null;
  name: string;
  type: LogSourceType;
  status: LogSourceStatus;
  description: string | null;
  environment: string | null;
  createdAt: string;
  updatedAt: string;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface SentinelLogEntry {
  id: string;
  organizationId: string;
  projectId: string | null;
  sourceId: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  context: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}
