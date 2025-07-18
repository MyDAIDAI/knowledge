function shouldDeepEqual(type: string) {
  return type === '[object Object]' || type === '[object Array]';
}


function getType(value: unknown): string {
  return Object.prototype.toString.call(value);
}

export default function deepEqual(valueA: unknown, valueB: unknown): boolean {

  const typeA = getType(valueA);
  const typeB = getType(valueB);
  
  if(typeA !== typeB) {
    return false;
  }

  if(shouldDeepEqual(typeA) && shouldDeepEqual(typeB)) {
    const entriesA = Object.entries(valueA);
    const entriesB = Object.entries(valueB);

    if(entriesA.length !== entriesB.length) {
      return false;
    }

    return entriesA.every(([key, value]) => Object.hasOwn(valueB, key) && deepEqual(value, valueB[key]));
  }

  return Object.is(valueA, valueB);
}