type ReturnValue<T> = { -readonly [P in keyof T]: Awaited<T[P]> }

export default function promiseAll<T extends readonly unknown[] | []>(
  iterable: T,
): Promise<{ -readonly [P in keyof T]: Awaited<T[P]> }> {
  return new Promise((resolve, reject) => {
    const results = new Array(iterable.length);
    let unresolved = iterable.length;

    if(unresolved === 0) {
      resolve(results as ReturnValue<T>);
    }

    iterable.forEach((item, index) => {
      Promise.resolve(item).then(data => {
        unresolved--;
        results[index] = data;
        if(unresolved === 0) {
          resolve(results as ReturnValue<T>);
        }
      }).catch((error) => {
        reject(error);
      })
    });
  });
}