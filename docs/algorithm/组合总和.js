/**
 * @param {number[]} candidates
 * @param {number} target
 * @return {number[][]}
 */

var combinationSum = function (candidates, target) {
  function sum(list) {
    return list.reduce((pre, cur) => {
      return pre + cur;
    }, 0);
  }

  const result = [];
  const path = [];

  function backtracking(index) {
    const sumValue = sum(path);
    if (sumValue === target) {
      result.push([...path]);
      return;
    }
    if (sumValue > target) {
      return;
    }

    for (let i = index; i < candidates.length; i++) {
      path.push(candidates[i]);
      backtracking(i);
      path.pop();
    }
  }

  backtracking(0);
  return result;
};
