export default function qs(o) {
  let str = ''
  for (let k in o) {
    if (!(o[k] instanceof Object)) {
      let value = encodeURIComponent(o[k]);
      str += '&' + k + '=' + value
    }
  }
  str = str.substr(1)
  return str
}