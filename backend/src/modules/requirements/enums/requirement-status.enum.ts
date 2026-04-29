export enum RequirementStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

export const REQUIREMENT_STATUSES: readonly RequirementStatus[] = [
  RequirementStatus.OPEN,
  RequirementStatus.CLOSED,
] as const;
