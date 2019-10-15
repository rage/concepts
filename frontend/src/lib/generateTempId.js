const randomString = () => Math.random().toString(36)
const generateTempId = () => randomString().substring(2, 15) + randomString().substring(2, 15)

export default generateTempId