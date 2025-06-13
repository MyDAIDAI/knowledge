export type ClassValue =
  | ClassArray
  | ClassDictionary
  | string
  | number
  | null
  | boolean
  | undefined;
export type ClassDictionary = Record<string, any>;
export type ClassArray = Array<ClassValue>;



function traverseItem(item, classes) {
  if(!item) {
    return;
  }
  if(typeof item === 'string' || typeof item === 'number') {
    classes.push(item);
    return;
  }
  if(Array.isArray(item) && item.length > 0) {
    for(let i = 0; i < item.length; i++) {
      if(!item[i]) {
        continue;
      };
      traverseItem(item[i], classes)
    }
  } else {
    const keys = Object.keys(item);
    for(let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if(!item[key] || !Object.prototype.hasOwnProperty.call(item, key)) {
        continue;
      };
      classes.push(key)
    }
  }
}



export default function classNames(...args: Array<ClassValue>): string {
  if(args.length === 0) {
    return ''
  }
  const classes: Array<string> = [];
  traverseItem(args, classes)
  return classes.join(' ')
}