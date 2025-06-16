# `Balanced Brackets`

给与一个由下列字符`'(', ')', '{', '}', '[' and ']'`组成的字符串，判断该字符的括号是否完全闭合

## Examples

```
Input: str = "[]"
Output: true
Explanation: The string contains correctly paired and ordered parentheses.
```

```
Input: str = "([)]"
Output: false
Explanation: The string contains correctly paired but incorrectly ordered parentheses.
```

```
Input: str = "([]){}"
Output: true
Explanation: The string contains correctly paired and ordered parentheses.
```

## Constraints

- 1 <= strs.length <= 1000
- The string str contains only the characters (, ), {, }, [ and ]

## Solution

遍历字符，使用一个栈来保存遇到的字符串，为了方便比较，可以使用`map`将需要匹配的字符进行映射

- 当遇到`{`、`[`以及`(`符号时，将其对应的匹配符号加入`}`、`]`、`)`
- 当遇到其匹配的符号`}`、`]`、`)`，判断栈的顶部符号是否相同，相同则将其弹出，不相同则返回`false`

如符号`([{()}])`遍历时在栈中会存入如下数据`)]})`，最里面的括号，在后面进行匹配时会在最前面，也就是栈的顶部，这也是使用栈这个数据结构原因，保留了符号之间的相对位置，并且先进后出

## Code

```ts
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
```
