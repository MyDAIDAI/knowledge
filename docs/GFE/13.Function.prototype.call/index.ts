interface Function {
  myCall(this: Function, thisArg: any, ...argArray: any[]): any;
}

Function.prototype.myCall = function (thisArg, ...argArray) {
  const fn = this;
  let result = fn.call(thisArg, ...argArray);
  return result;
};