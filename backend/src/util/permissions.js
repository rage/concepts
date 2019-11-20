class Permission {
  constructor(name, level) {
    this.name = name
    this.level = level
  }

  toString() {
    return this.name
  }

  toLowerCase() {
    return this.name.toLowerCase()
  }

  toUpperCase() {
    return this.name.toUpperCase()
  }

  valueOf() {
    return this.level
  }

  [Symbol.toPrimitive](hint) {
    switch (hint) {
    case 'number':
      return this.level
    case 'string':
    default:
      return this.name
    }
  }
}

export class Role extends Permission {
  static nameMap = new Map()
  static levelMap = new Map()

  static VISITOR = new Role('VISITOR', 0)
  static GUEST = new Role('GUEST', 1)
  static STUDENT = new Role('STUDENT', 2)
  static STAFF = new Role('STAFF', 3)
  static ADMIN = new Role('ADMIN', 4)

  constructor(name, level) {
    super(name, level)
    Role.nameMap.set(this.name, this)
    Role.levelMap.set(this.level, this)
  }

  static fromInt(int, defaultValue = Role.VISITOR) {
    return Role.levelMap.get(int) || defaultValue
  }

  static fromString(str, defaultValue = Role.VISITOR) {
    return Role.nameMap.get(str?.toUpperCase()) || defaultValue
  }

  static parse(val, defaultValue = Role.VISITOR) {
    if (val instanceof Role) {
      return val
    } else if (typeof val === 'number') {
      return Role.fromInt(val, defaultValue)
    } else {
      return Role.fromString(val, defaultValue)
    }
  }
}

export class Privilege extends Permission {
  static nameMap = new Map()
  static charMap = new Map()
  static levelMap = new Map()

  static NONE = new Privilege('NONE', 0)
  static CLONE = new Privilege('CLONE', 1)
  static VIEW = new Privilege('VIEW', 2)
  static EDIT = new Privilege('EDIT', 3)
  static OWNER = new Privilege('OWNER', 4)

  constructor(name, level) {
    super(name, level)
    this.char = name.substr(0, 1).toLowerCase()
    Privilege.nameMap.set(this.name, this)
    Privilege.charMap.set(this.char, this)
    Privilege.levelMap.set(this.level, this)
  }

  static fromInt(int, defaultValue = Privilege.NONE) {
    return Privilege.levelMap.get(int) || defaultValue
  }

  static fromChar(char, defaultValue = Privilege.NONE) {
    return Privilege.charMap.get(char?.toLowerCase()) || defaultValue
  }

  static fromToken(token, defaultValue = Privilege.NONE) {
    return Privilege.fromChar(token?.[1], defaultValue)
  }

  static fromString(str, defaultValue = Privilege.NONE) {
    return Privilege.nameMap.get(str?.toUpperCase()) || defaultValue
  }

  static parse(val, defaultValue = Privilege.NONE) {
    if (val instanceof Privilege) {
      return val
    } else if (typeof val === 'number') {
      return Privilege.fromInt(val, defaultValue)
    } else if (val.length === 1) {
      return Privilege.fromChar(val, defaultValue)
    } else {
      return Privilege.fromString(val, defaultValue)
    }
  }
}

export const readPrivilege = ws => Privilege.fromString(ws?.participants?.[0]?.privilege)
