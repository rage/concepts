import { Privilege } from '../../util/accessControl'
import makeTypeResolvers from './typeutil'

export const Workspace = makeTypeResolvers('workspace', [
  'participants',
  'sourceProject',
  'asTemplate',
  'courses',
  'conceptLinks',
  'courseLinks',
  'concepts',
  'clones',
  'mainCourse',
  'courseTags',
  'conceptTags',
  {
    name: 'pointGroups',
    checkPrivilegeArgs: root => ({
      minimumPrivilege: Privilege.EDIT,
      workspaceId: root.id
    }),
    insufficientPrivilegeValue: () => []
  },
  {
    name: 'tokens',
    checkPrivilegeArgs: root => ({
      minimumPrivilege: Privilege.OWNER,
      workspaceId: root.id
    }),
    insufficientPrivilegeValue: () => []
  }
])
