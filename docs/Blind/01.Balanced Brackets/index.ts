export default function isBalancedBrackets(str: string): boolean {
  if(!str || str.length === 0) return true;
  const charMap: {[key: string] : string} = {
    '[': ']',
    '(': ')',
    '{': '}'
  }
  const stack:string[] = [];
  for(let i = 0; i < str.length; i++) {
    let item = str[i];
    if(charMap[item]) {
      stack.push(charMap[item])
    }
    if(['}', ')', ']'].includes(item)) {
      let lastItem = stack[stack.length - 1];
      if(item === lastItem) {
        stack.pop();
      } else {
        return false;
      }
    }
  }
  return stack.length === 0;
}