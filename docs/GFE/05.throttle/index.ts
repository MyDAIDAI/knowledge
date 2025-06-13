type ThrottleFunction<T extends any[]> = (...args: T) => any;
type TimeIDType = ReturnType<typeof setTimeout>

export default function throttle<T extends any[]>(func: ThrottleFunction<T>, wait: number): ThrottleFunction<T> {
  let timerId: TimeIDType | null = null;

  return function(...args) {
    if(timerId) {
      return;
    }
    func.apply(this, args);
    timerId = setTimeout(function () {
      clearTimeout(timerId as TimeIDType);
      timerId = null
    }, wait);
  }
}