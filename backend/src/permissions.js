class Role {
  static VISITOR = new Role('VISITOR', 0)
  static GUEST = new Role('GUEST', 1)
  static STAFF = new Role('STAFF', 2)
  static STUDENT = new Role('STUDENT', 3)
  static ADMIN = new Role('ADMIN', 4)

  static nameMap = new Map()
  static levelMap = new Map()

  constructor(name, level) {
    this.name = name
    this.level = level
    Role.nameMap.set(this.name, this)
    Role.levelMap.set(this.level, this)
  }

  toString() { return this.name }
  valueOf() { return this.level }

  static fromInt(int) {
    return Role.levelMap.get(int) || Role.VISITOR
  }

  static fromString(str) {
    return Role.nameMap.get(str) || Role.VISITOR
  }
}

class Privilege {
  static NONE = new Privilege('NONE', 0)
  static CLONE = new Privilege('CLONE', 0)
  static READ = new Privilege('READ', 0)
  static EDIT = new Privilege('EDIT', 0)
  static OWNER = new Privilege('OWNER', 0)

  static nameMap = new Map()
  static charMap = new Map()
  static levelMap = new Map()

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

  static fromInt(int) {
    return Privilege.levelMap.get(int) || Privilege.NONE
  }

  static fromChar(char) {
    return Privilege.charMap.get(char) || Privilege.NONE
  }

  static fromString(str) {
    return Privilege.nameMap.get(str) || Privilege.NONE
  }
}

const readPrivilege = ws => Privilege.fromString(ws && ws.participants[0] && ws.participants[0].privilege)

module.exports = { Role, Privilege, readPrivilege }
