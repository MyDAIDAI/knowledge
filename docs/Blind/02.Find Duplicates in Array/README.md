# Find Duplicates in Array

给定一个整数数组，判断数组内是否包含重复项

## Input

- `numbers: number[]`: 整数数组

## Examples

```
Input: numbers = [5,7,1,3]
Output: false
Explanation: All elements in the array are unique.
```

```
Input: numbers = [10,7,0,0,9]
Output: true
Explanation: 0 appears more than once.
```

```
Input: numbers = [3,2,6,5,0,3,10,3,10,5]
Output: true
Explanation: 3,5, and 10 appears more than once.
```

## Constraints

1 <= numbers.length <= 10,000
-1,000,000 <= numbers[i] <= 1,000,000

## Solution

### 暴力法

在当前遍历时，直接在后面的数组内判断是否有当前值

```ts
export default function findDuplicates(numbers: number[]): boolean {
  if(!numbers || numbers.length === 0) return false;
  for(let i = 0; i < numbers.length; i++) {
    for(let j = i + 1; j < numbers.length; j++) {
      if(numbers[i] === numbers[j]) {
        return true;
      }
    }
  }
  return false
}
```

时间复杂度：`O(n^2)`，空间复杂度：`O(1)`

### 排序法

将当前数组进行排序，那么相同的数字一定会挨在一起，则只需要比较前面的数字跟后面的数字是否相同即可

```ts
export default function findDuplicates(numbers: number[]): boolean {
  if(!numbers || numbers.length === 0) return false;
  numbers.sort((a, b) => a - b)
  for(let i = 1; i < numbers.length; i++) {
    if(numbers[i] === numbers[i - 1]) {
      return true;
    }
  }
  return false;
}
```

时间复杂度：`O(n)`，空间复杂度：`O(1)`，但是会破坏原有数组的有序性

### 使用`Set`或者`Map`

使用一个`Set`或者`Map`结构来记录前面没有重复的数字，每加入一个数字之前，就判断是否在其中存在，如果存在，则说明有重复数字

```ts
export default function findDuplicates(numbers: number[]): boolean {
  if(!numbers || numbers.length === 0) return false;
  const map: {[key: string]: number} = {}
  for(let i = 0; i < numbers.length; i++) {
    const item = numbers[i];
    if(map[item]) return true;
    map[item] = i
  }
  return false
}
```

时间复杂度：`O(n)`，空间复杂度：`O(n)`
