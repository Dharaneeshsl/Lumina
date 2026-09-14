export interface CohortPoint {
  cohort: string
  returning: number
  total: number
  rate: number
}

export function cohortRetention(
  cohorts: Record<string, string[]>,
  returning: Record<string, string[]>,
): CohortPoint[] {
  return Object.entries(cohorts).map(([cohort, users]) => {
    const set = new Set(returning[cohort] ?? [])
    const count = users.filter((user) => set.has(user)).length
    return {
      cohort,
      returning: count,
      total: users.length,
      rate: users.length ? count / users.length : 0,
    }
  })
}