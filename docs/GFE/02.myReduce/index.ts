interface Array<T> {
  myReduce<U>(callbackFn: (previousValue: U, currentValue: T, index: number, arr: Array<T>) => U, initialValue?: U)
}
Array.prototype.myReduce = function(callbackFn: Function, initialValue: any) {
  const noInitialValue = initialValue === undefined;
  const len = this.length;

  if(noInitialValue && len === 0) {
    throw new TypeError('Reduce of empty array with no initialValue');
  }
  let acc = noInitialValue ? this[0] : initialValue;
  let startingIndex = noInitialValue ? 1 : 0;

  for(let i = startingIndex; i < len; i++) {
    if(Object.prototype.hasOwnProperty.call(this, i)) {
      acc = callbackFn(acc, this[i], i, this)
    }
  }
  return acc;
}