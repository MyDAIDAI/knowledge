// Approach 1: Recursive
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

// Approach 2: Chunks
// export default function mapAsyncLimit<T, U>(
//   iterable: Array<T>,
//   callbackFn: (value: T) => Promise<U>,
//   size: number,
// ): Promise<Array<U>> {
//   if(iterable.length === 0) {
//     return Promise.resolve([]);
//   }

//   const currentChunk = iterable.slice(0, size);
//   const remainingItems = iterable.slice(size);

//   return Promise.all(currentChunk.map(callbackFn)).then((results) => {
//     return mapAsyncLimit(remainingItems, callbackFn, size).then((remainingResults) => {
//       return [...results, ...remainingResults];
//     });
//   });
// }

// Approach 3: Chunk with Async/Await
// export default function mapAsyncLimit<T, U>(
//   iterable: Array<T>,
//   callbackFn: (value: T) => Promise<U>,
//   size: number,
// ): Promise<Array<U>> {
//   const results: Array<U> = [];
//   const chunks = size || 1;

//   for(let i = 0; i < iterable.length; i += chunks) {
//     const currentChunk = iterable.slice(i, i + chunks);
//     const chunkResults = await Promise.all(currentChunk.map(callbackFn));

//     results.push(...chunkResults);
//   }

//   return results;
// }

export default function mapAsyncLimit<T, U>(
  iterable: Array<T>,
  callbackFn: (value: T) => Promise<U>,
  size: number
): Promise<Array<U>> {
  return new Promise((resolve, reject) => {
    const results: Array<U> = [];
    let nextIndex = 0;
    let resolved = 0;
    
    if(iterable.length === 0) {
      resolve(results);
      return;
    }

    function processItem(index: number) {
      nextIndex++;
      callbackFn(iterable[index]).then((value) => {
        results[index] = value;
        resolved++;
        if(resolved === iterable.length) {
          resolve(results);
          return;
        }
        if(nextIndex < iterable.length) {
          processItem(nextIndex);
        }
      }).catch(reject);
    }

    for(let i = 0; i < size && i < iterable.length; i++) {
      processItem(i);
    }
  });
}