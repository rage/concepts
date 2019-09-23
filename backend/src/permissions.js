class Role {
  static nameMap = new Map()
  static levelMap = new Map()

  static VISITOR = new Role('VISITOR', 0)
  static GUEST = new Role('GUEST', 1)
  static STUDENT = new Role('STUDENT', 2)
  static STAFF = new Role('STAFF', 3)
  static ADMIN = new Role('ADMIN', 4)

  constructor(name, level) {
    this.name = name
    this.level = level
    Role.nameMap.set(this.name, this)
    Role.levelMap.set(this.level, this)
  }

  toString() { return this.name }
  valueOf() { return this.level }

  static fromInt(int, defaultValue = Role.VISITOR) {
    return Role.levelMap.get(int) || defaultValue
  }

  static fromString(str, defaultValue = Role.VISITOR) {
    return Role.nameMap.get(str.toUpperCase()) || defaultValue
  }

  static parse(val, defaultValue = Privilege.NONE) {
    if (typeof val === 'number') {
      return Privilege.fromInt(val, defaultValue)
    } else {
      return Privilege.fromString(val, defaultValue)
    }
  }
}

class Privilege {
  static nameMap = new Map()
  static charMap = new Map()
  static levelMap = new Map()

  static NONE = new Privilege('NONE', 0)
  static CLONE = new Privilege('CLONE', 1)
  static READ = new Privilege('READ', 2)
  static EDIT = new Privilege('EDIT', 3)
  static OWNER = new Privilege('OWNER', 4)

  constructor(name, level) {
    this.name = name
    this.char = name.substr(0, 1).toLowerCase()
    this.level = level
    Privilege.nameMap.set(this.name, this)
    Privilege.charMap.set(this.char, this)
    Privilege.levelMap.set(this.level, this)
  }

  toString() { return this.name }
  valueOf() { return this.level }

  static fromInt(int, defaultValue = Privilege.NONE) {
    return Privilege.levelMap.get(int) || defaultValue
  }

  static fromChar(char, defaultValue = Privilege.NONE) {
    return Privilege.charMap.get(char.toLowerCase()) || defaultValue
  }

  static fromString(str, defaultValue = Privilege.NONE) {
    return Privilege.nameMap.get(str.toUpperCase()) || defaultValue
  }

  static parse(val, defaultValue = Privilege.NONE) {
    if (typeof val === 'number') {
      return Privilege.fromInt(val, defaultValue)
    } else if (val.length === 1) {
      return Privilege.fromChar(val, defaultValue)
    } else {
      return Privilege.fromString(val, defaultValue)
    }
  }
}

const readPrivilege = ws => Privilege.fromString(ws && ws.participants[0] && ws.participants[0].privilege)

module.exports = { Role, Privilege, readPrivilege }
