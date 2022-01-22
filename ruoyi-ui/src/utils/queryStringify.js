export default function qs(o) {
  let str = ''
  for (let k in o) {
    if (!(o[k] instanceof Object)) {
      str += '&' + k + '=' + o[k]
    }
  }
  str = str.substr(1)
  return str
}