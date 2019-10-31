const secretCharset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
export default length => Array.from({ length },
  () => secretCharset[Math.floor(Math.random() * secretCharset.length)]).join('')
