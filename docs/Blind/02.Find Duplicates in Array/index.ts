// export default function findDuplicates(numbers: number[]): boolean {
//   if(!numbers || numbers.length === 0) return false;
//   for(let i = 0; i < numbers.length; i++) {
//     for(let j = i + 1; j < numbers.length; j++) {
//       if(numbers[i] === numbers[j]) {
//         return true;
//       }
//     }
//   }
//   return false
// }
// export default function findDuplicates(numbers: number[]): boolean {
//   if(!numbers || numbers.length === 0) return false;
//   numbers.sort((a, b) => a - b)
//   for(let i = 1; i < numbers.length; i++) {
//     if(numbers[i] === numbers[i - 1]) {
//       return true;
//     }
//   }
//   return false;
// }
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