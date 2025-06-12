type ArrayValue = any | Array<ArrayValue>;

// export default function flatten(value: Array<ArrayValue>): Array<any> {
//   const result: Array<any> = [];
//   const copy = value.slice();
  
//   while(copy.length) {
//     const item = copy.shift();
//     if(Array.isArray(item)) {
//       // 从前面取出的数据，则需要放回最前面，否则数据顺序会出错，所以这里需要用unshift而不是push
//       copy.unshift(...item)
//     } else {
//       result.push(item)
//     }
//   }
//   return result;
// }
export default function flatten(value: Array<ArrayValue>): Array<any> {
  const result: Array<ArrayValue> = []
  function traverse(list: ArrayValue) {
    if(!Array.isArray(list)) {
      result.push(list);
      return;
    }
    for(let i = 0; i < list.length; i++) {
      const item: ArrayValue = list[i];
      traverse(item)
    }
  }
  traverse(value);
  return result;
}