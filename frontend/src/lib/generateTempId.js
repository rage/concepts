const randomString = () => Math.random().toString(36).substring(2, 15)
const generateTempId = () => '__tmp' + randomString() + randomString()

export default generateTempId
