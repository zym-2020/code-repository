const getNext = (s) => {
  const next = new Array(s.length).fill(-1);
  let k = -1,
    i = 0;
  while (i < s.length - 1) {
    if (k === -1 || s[i] === s[k]) {
      i++;
      k++;
      next[i] = k;
    } else k = next[k];
  }
  return next;
};

const KMP = (s1, s2) => {
  const next = getNext(s2);
  let p1 = 0,
    p2 = 0;
  while (p1 < s1.length && p2 < s2.length) {
    if (p2 === -1 || s1[p1] === s2[p2]) {
      p1++;
      p2++;
    } else {
      p2 = next[p2];
    }
  }
  if (p2 < s2.length) return false;
  else return true;
};
console.log(KMP("abcdabe", "abf"));

