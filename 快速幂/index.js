/**
 * 从二进制的角度
 */

const quikPower = (base, power) => {
  let res = 1;
  while (power) {
    if (power & 1) {
      res = res * base;
    }
    base = base * base;
    power = power >> 1;
  }
  return res;
};

/**
 * 从指数折半的角度，更好理解
 */

const quikPower1 = (base, power) => {
  let res = 1;
  while (power) {
    if (power & 1) {
      //power位奇数
      res *= base;
    }
    base *= base;
    power = power >> 1; //power除2
  }
  return res;
};


