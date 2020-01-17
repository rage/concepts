import makeTypeResolvers from './typeutil'

export const GoalLink = makeTypeResolvers('goalLink', [
  'goal',
  'course',
  'workspace'
])
