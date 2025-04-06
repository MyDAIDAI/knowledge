var letterCombinations = function (digits) {
  const digitsMap = {
    2: "abc",
    3: "def",
    4: "ghi",
    5: "jkl",
    6: "mno",
    7: "pqrs",
    8: "tuv",
    9: "wxyz",
  };

  const result = [];
  const path = [];
  function backtracking(digits, index) {
    if (index === digits.length) {
      result.push(path.join(""));
      return;
    }

    let digit = digits[index];
    const letters = digitsMap[digit];
    for (let i = 0; i < letters.length; i++) {
      path.push(letters[i]);
      backtracking(digits, index + 1);
      path.pop();
    }
  }

  if (!digits || digits.length === 0) return [];
  backtracking(digits, 0);

  return result;
};

console.log(letterCombinations("23"));
