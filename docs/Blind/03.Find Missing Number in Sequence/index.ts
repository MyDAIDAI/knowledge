// export default function findMissingNumberInSequence(numbers: number[]): number {
//   if (!numbers || numbers.length === 0) return -1;
//   const maxRange = numbers.length;
//   for (let i = 0; i <= maxRange; i++) {
//     if (!numbers.includes(i)) {
//       return i;
//     }
//   }
//   return -1;
// }

// export default function findMissingNumberInSequence(numbers: number[]): number {
//   const n: number = numbers.length;

//   // Iterate through the expected range of numbers from 0 to n
//   for (let i = 0; i <= n; i++) {
//     // Check if the current number `i` exists in the array
//     let found = false;
//     for (let j = 0; j < n; j++) {
//       if (numbers[j] === i) {
//         found = true;
//         break; // Stop searching once the number is found
//       }
//     }

//     // If the current number `i` is not found, it's the missing number
//     if (!found) {
//       return i;
//     }
//   }

//   // Return -1 if no missing number is found (should not happen in valid input)
//   return -1;
// }

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
