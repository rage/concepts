import adjectives from '../static/adjectives'
import animals from '../static/animals'

export const randomAdjective = () => adjectives[Math.floor(Math.random() * adjectives.length)]
export const randomAnimal = () => animals[Math.floor(Math.random() * animals.length)]

const generateName = () =>
  `${randomAdjective()} ${randomAdjective()} ${randomAnimal()}`.toTitleCase()

export default generateName
