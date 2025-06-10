// export default function debounce(func: Function, wait: number): Function {
//   let timerId: NodeJS.Timeout | null = null;
//   return function (...args: any[]) {
//     if(timerId !== null) {
//       clearTimeout(timerId!);
//     }
//     timerId = setTimeout(function () {
//       clearTimeout(timerId!);
//       timerId = null;
//       func.apply(this, args);
//     }, wait);
//   }
// }

export default function debounce(func: Function, wait: number): Function {
  let timerId: ReturnType<typeof setTimeout> | null = null;
  return function (...args: any[]) {
    clearTimeout(timerId ?? undefined);
    console.log('this', this);
    timerId = setTimeout(() => {
      timerId = null;
      func.apply(this, args);
    }, wait);
  }
}