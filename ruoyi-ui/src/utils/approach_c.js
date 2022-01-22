/*
 * 自定义的全局方法 - czy
 */

/**
 * @description 拷贝和深拷贝，第一个参数为需要拷贝的目标，传入第二个参数true则深拷贝
 */
export function copy() {
  var target = arguments[0]
  var isDept = arguments[1] === true
  var count = arguments[2] || 0
  count++
  if (count > 10) {
    var errMsg = 'Error: loopCount has been over maximum count limits, which is \"10\"!'
    console.error(errMsg)
    return errMsg
  }
  if (isDept) {
    var duplicate
    if (target instanceof Array) {
      duplicate = []
      for (var i = 0; i < target.length; i++) {
        duplicate.push(copy(target[i], isDept, count))
      }
    } else if (target instanceof Function) {
      duplicate = target
    } else if (target instanceof Object) {
      duplicate = {}
      for (var k in target) {
        duplicate[k] = copy(target[k], isDept, count)
      }
    } else {
      duplicate = target
    }
    return duplicate
  } else {
    var duplicate
    if (target instanceof Array) {
      duplicate = []
      for (var i = 0; i < target.length; i++) {
        duplicate.push(target[i])
      }
    } else if (target instanceof Function) {
      duplicate = target
    } else if (target instanceof Object) {
      duplicate = {}
      for (var k in target) {
        duplicate[k] = target[k]
      }
    } else {
      duplicate = target
    }
    return duplicate
  }
}

// 转换为原始数据
export function transToRaw(row, key) {
  let correspondence = row;
  let data = this.rawData || {};
  let needTrans = false;
  for (let k in row) {
    if (row[k] === '-') needTrans = true;
  }
  if (needTrans && key) {
    data.forEach(item => {
      if (item[key] === row[key]) correspondence = item;
    });
  }
  return correspondence;
}