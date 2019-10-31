import { checkPrivilege } from '../../util/accessControl'

const makeTypeResolver = (type, field) => {
  // We return Object.values({...}) instead of an array
  // to make the functions have nice names in stack traces.
  if (typeof field === 'object') {
    return Object.values({
      name: field.name,
      [`${field.type || type}/${field.name}`]: async (root, args, context) => {
        if (field.checkPrivilegeArgs &&
            !await checkPrivilege(context, field.checkPrivilegeArgs(root, args, context))) {
          return await field.insufficientPrivilegeValue(root, args, context) || null
        }
        return await context.prisma[field.type || type](
          field.args?.(root, args, context) || { id: root.id }
        )[field.name]()
      }
    })
  } else {
    return Object.values({
      name: field,
      [`${type}/${field.name}`]: (root, args, context) =>
        context.prisma[type]({ id: root.id })[field]()
    })
  }
}

const makeTypeResolvers = (type, fields) =>
  Object.fromEntries(fields.map(field => makeTypeResolver(type, field)))

export default makeTypeResolvers
