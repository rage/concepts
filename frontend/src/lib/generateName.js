import adjectives from '../static/adjectives'
import animals from '../static/animals'

export const randomAdjective = () => adjectives[Math.floor(Math.random() * adjectives.length)]
export const randomAnimal = () => animals[Math.floor(Math.random() * animals.length)]

const toTitleCase = str => str
  .split(' ')
  .map(word => word
    .substr(0, 1).toUpperCase()
    + word.substr(1)
  )
  .join(' ')

const generateName = () => toTitleCase(
  `${randomAdjective()} ${randomAdjective()} ${randomAnimal()}`)

export default generateName
