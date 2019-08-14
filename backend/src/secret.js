const secretCharset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
module.exports = length => Array.from({ length },
  () => secretCharset[Math.floor(Math.random() * secretCharset.length)]).join('')
