# Flatten

实现一个函数`Flatten`，返回一个新数组，将传入的子数组进行扁平化

## Example

```ts
flatten([1, 2, 3]); // [1, 2, 3]

flatten([1, [2, 3]]); // [1, 2, 3]
flatten([
  [1, 2],
  [3, 4],
]); // [1, 2, 3, 4]

flatten([1, [2, [3, [4, [5]]]]]); // [1, 2, 3, 4, 5]
```

## Solution

核心思想就是，判断数据是否是数组，不是数组，则放进结果中，是数组的话，将其层级减少一次，直到最后只有最外面一层结构

- 使用递归

  ```ts
  export default function flatten(value: Array<ArrayValue>): Array<any> {
    const result: Array<ArrayValue> = []
    function traverse(list: ArrayValue) {
      if(!Array.isArray(list)) {
        result.push(list);
        return;
      }
      for(let i = 0; i < list.length; i++) {
        const item: ArrayValue = list[i];
        traverse(item)
      }
    }
    traverse(value);
    return result;
  }
  ```
  
- 使用循环
  使用`while`循环来替代递归，并且使用一个数组来保存需要处理的数据，按序取出判断是否是数组，是数组则将其中的值再放入，如此循环到所有数据处理完毕

  ```ts
  export default function flatten(value: Array<ArrayValue>): Array<any> {
    const result: Array<any> = [];
    const copy = value.slice();
    
    while(copy.length) {
      const item = copy.shift();
      if(Array.isArray(item)) {
        // 从前面取出的数据，则需要放回最前面，否则数据顺序会出错，所以这里需要用unshift而不是push
        copy.unshift(...item)
      } else {
        result.push(item)
      }
    }
    return result;
  }
  ```

- 使`concat`进行遍历

  ```ts
  type ArrayValue = any | Array<ArrayValue>;

  export default function flatten(value: Array<ArrayValue>): Array<any> {
    while (value.some(Array.isArray)) {
      value = [].concat(...value);
    }

    return value;
  }
  ```

- 使用`reduce`进行递归
  
  ```ts
  type ArrayValue = any | Array<ArrayValue>;

  export default function flatten(value: Array<ArrayValue>): Array<any> {
    return value.reduce((acc, cur) => {
      return [].concat(Array.isArray(cur) ? flatten(cur) : cur)
    }, [])
  }

  ```

- 原地修改方法
不使用多余空间，原地对数组进行修改，如果是数组，则扁平化一层后再将其原地插入到数组中

 ```ts
  type ArrayValue = any | Array<ArrayValue>;

  export default function flatten(value: Array<ArrayValue>): Array<any> {
    for(let i = 0; i < value.length; i++) {
      if(Array.isArray(value[i])) {
        value.splice(i, 1, ...value[i]);
      } else {
        i++;
      }
    }
  }

  ```
