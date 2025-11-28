# Promise.any

实现一个`Promise.any`函数，当传入的数组有一个状态为完成，就返回

## Examples

```typescript
const p0 = Promise.resolve(42);
const p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(21);
  }, 100);
});

await promiseAny([p0, p1]); // 42
```

```typescript
const p0 = new Promise((resolve) => {
  setTimeout(() => {
    resolve(42);
  }, 100);
});
const p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject('Err!');
  }, 400);
});

await promiseAny([p0, p1]); // 42
```

```typescript
const p0 = new Promise((resolve) => {
  setTimeout(() => {
    reject(42);
  }, 400);
});
const p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject('Err!');
  }, 100);
});

try {
  await promiseAny([p0, p1]);
} catch (err) {
  console.log(e instanceof AggregateError); // true
  console.log(e.errors); // [ 42, "Err!" ]
}

```
