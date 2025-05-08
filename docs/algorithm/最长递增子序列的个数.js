/**
 * @param {number[]} nums
 * @return {number}
 */
// var findNumberOfLIS = function (nums) {
//   if (!nums || nums.length === 0) return 0;
//   const dp = new Array(nums.length).fill(1);

//   for (let i = 1; i < nums.length; i++) {
//     for (let j = i; j >= 0; j--) {
//       if (nums[i] > nums[j]) {
//         dp[i] = Math.max(dp[j] + 1, dp[i]);
//         maxValue = Math.max(dp[i], maxValue);
//       }
//     }
//   }
//   return dp.filter((item) => item === maxValue).length;
// };

// console.log(findNumberOfLIS([1, 3, 5, 4, 7]));

function test() {
  var n = 4399;
  function add() {
    n++;
    console.log(n);
  }
  return { n, add };
}
var result = test();
var result2 = test();
result.add();
result.add();
console.log(result.n);
result2.add();
