//
// export default function mapAsyncLimit<T, U>(
//   iterable: Array<T>,
//   callbackFn: (value: T) => Promise<U>,
//   size: number,
// ): Promise<Array<U>> {
//   return new Promise((resolve, reject) => {
//     const results: Array<U> = [];

//     function processItem(index: number) {
//       if (index === iterable.length) {
//         resolve(results);
//       }

//       return callbackFn(iterable[index])
//         .then((result) => {
//           results.push(result);
//           processItem(index + 1);
//         })
//         .catch(reject);
//     }

//     return processItem(0);
//   });
// }

export default function mapAsyncLimit<T, U>(
  iterable: Array<T>,
  callbackFn: (value: T) => Promise<U>,
  size: number,
): Promise<Array<U>> {
  if(iterable.length === 0) {
    return Promise.resolve([]);
  }

  const currentChunk = iterable.slice(0, size);
  const remainingItems = iterable.slice(size);

  return Promise.all(currentChunk.map(callbackFn)).then((results) => {
    return mapAsyncLimit(remainingItems, callbackFn, size).then((remainingResults) => {
      return [...results, ...remainingResults];
    });
  });
}