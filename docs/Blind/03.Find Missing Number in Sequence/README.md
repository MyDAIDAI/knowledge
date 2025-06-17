# Find Missing Number in Sequence

给定一个整数数组，数组大小为`size`，定义一个数据范围`[0, size]`，找到数组中不在`[0, size]`的数

## Input

- numbers: number[]: An array of integers

## Examples

```
Input: numbers = [1,3,0]
Output: 2
Explanation: The array has a size of 3, and within the range from 0 to 3, the number 2 is missing from the array
```

```
Input: numbers = [1]
Output: 0
Explanation: The array has a size of 1, and within the range from 0 to 1, the number 0 is missing from the array
```

```
Input: numbers = [3,0,4,2,1]
Output: 5
Explanation: The array has a size of 5, and within the range from 0 to 5, the number 5 is missing from the array
```

## Solution

这个题比较简单，拿到了数据范围，遍历数据范围，判断是否在数组中存在即可

### 暴力破解法

```ts
export default function findMissingNumberInSequence(numbers: number[]): number {
  const n: number = numbers.length;

  for (let i = 0; i <= n; i++) {
    let found = false;
    // 遍历数组
    for (let j = 0; j < n; j++) {
      if (numbers[j] === i) {
        found = true;
        break;
      }
    }

    if (!found) {
      return i;
    }
  }

  return -1;
}

```

时间复杂度：`O(n^2)`，空间复杂度：`O(1)`

### 排序法

由于需要在`[0, size]`范围内的每一个值都需要在数组中存在，那么可以将数组进行排序，比较前后的值，如果后面的值等于前面的值加1，则符合

```ts
export default function findMissingNumberInSequence(numbers: number[]): number {
  if (!numbers || numbers.length === 0) return -1;
  
  numbers.sort((a, b) => a - b);

  // 处理最后一个值与第一个值
  if(numbers[numbers.length - 1] !== numbers.length) return numbers.length;
  if(numbers[0] !== 0) return 0;

  for(let i = 1; i < numbers.length; i++) {
    const expectNumber = numbers[i - 1] + 1;
    if(numbers[i] !== expectNumber) {
      return expectNumber;
    }
  }
  return -1;
}

```
