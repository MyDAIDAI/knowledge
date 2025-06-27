export function deepClone<T>(obj: T): T {
  if(!obj || typeof obj !== 'object') {
    return obj;
  }
  const result: T = Array.isArray(obj) ? [] as T : {} as T;
  if(Array.isArray(obj)) {
    for(let i = 0; i < obj.length; i++) {
      result[i] = deepClone(obj[i]);
    }
  } else {
    for(let key in obj) {
      result[key] = deepClone(obj[key]);
    }
  }
  return result;
}