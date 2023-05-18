/**
 * 冒泡排序
 */

const bubbleSort = (arr) => {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] > arr[j]) {
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
      }
    }
  }
};

/**
 * 选择排序
 */
const selectionSort = (arr) => {
  for (let i = 0; i < arr.length; i++) {
    let min = arr[i];
    let count = i;
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < min) {
        min = arr[j];
        count = j;
      }
    }
    arr[count] = arr[i];
    arr[i] = min;
  }
};

/**
 * 插入排序
 */
const insertionSort = (arr) => {
  for (let i = 0; i < arr.length; i++) {
    let count = i;
    while (count > 0 && arr[count - 1] > arr[count]) {
      const temp = arr[count];
      arr[count] = arr[count - 1];
      arr[count - 1] = temp;
      count--;
    }
  }
};

/**
 * 归并排序
 */
const mergeSort = (arr) => {
  if (arr.length <= 1) {
    return arr;
  } else {
    const mid = Math.floor(arr.length / 2);
    const arr1 = mergeSort(arr.splice(0, mid));
    const arr2 = mergeSort(arr);
    const res = [];
    let index1 = 0,
      index2 = 0;
    while (index1 < arr1.length && index2 < arr2.length) {
      if (arr1[index1] < arr2[index2]) {
        res.push(arr1[index1]);
        index1++;
      } else {
        res.push(arr2[index2]);
        index2++;
      }
    }
    while (index1 < arr1.length) {
      res.push(arr1[index1]);
      index1++;
    }
    while (index2 < arr2.length) {
      res.push(arr2[index2]);
      index2++;
    }
    return res;
  }
};

/**
 * 快排
 */
const quickSort = (arr, start, end) => {
  if (start < end) {
    let left = start,
      right = end;
    while (left < right) {
      while (left < right && arr[right] > arr[start]) {
        right--;
      }
      while (left < right && arr[left] <= arr[start]) {
        left++;
      }
      const temp = arr[left];
      arr[left] = arr[right];
      arr[right] = temp;
    }
    const temp = arr[left];
    arr[left] = arr[start];
    arr[start] = temp;
    quickSort(arr, start, left - 1);
    quickSort(arr, left + 1, end);
  }
};

/**
 * 堆排序
 */
const heapSort = (arr) => {
  const getParentIndex = (index) => {
    return Math.floor((index - 1) / 2);
  };
  const getLeftChildIndex = (index) => {
    return index * 2 + 1;
  };
  const swap = (i, j) => {
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  };

  const adjustHeap = (index, len) => {
    let left = getLeftChildIndex(index);
    let parent = index;
    while (left <= len) {
      let max = arr[left];
      if (left + 1 <= len && arr[left] < arr[left + 1]) {
        max = arr[left + 1];
        left = left + 1;
      }
      if (arr[left] > arr[parent]) {
        swap(left, parent);
        parent = left;
        left = getLeftChildIndex(left);
      } else {
        break;
      }
    }
  };

  const sort = () => {
    const last = arr.length - 1;
    for (let i = getParentIndex(last); i >= 0; i--) {
      adjustHeap(i, last);
    }
    const res = [];
    for (let i = arr.length - 1; i >= 0; i--) {
      res.unshift(arr[0]);
      swap(0, i);
      adjustHeap(0, i - 1);
    }
    return res;
  };
  return sort();
};

/**
 * 希尔排序
 * 算法时间取决于gap，如何选择gap现在有些比较好的选择了，但不确定是否是最好的,
 * 此处gap选取5
 */
const shellSort = (arr) => {
  let gap = 5;
  while (gap >= 1) {
    for (let i = 0; i < gap; i++) {
      for (let j = i + 0; j < arr.length; j = j + i + 1) {
        let count = j;
        while (count > i + 0 && arr[count - 1 - i] > arr[count]) {
          const temp = arr[count - 1 - i];
          arr[count - 1 - i] = arr[count];
          arr[count] = temp;
        }
      }
    }
    gap = Math.floor(gap / 2);
  }
};

/**
 * 计数排序
 */
const countingSort = (arr, min, max) => {
  const count = new Array(max - min + 1).fill(0);
  for (let i = 0; i < arr.length; i++) {
    const temp = arr[i] - min;
    count[temp] = count[temp] + 1;
  }
  const res = [];
  for (let i = 0; i < count.length; i++) {
    for (let j = 0; j < count[i]; j++) {
      res.push(i + min);
    }
  }
  return res;
};

/**
 * 桶排序
 */
const bucketSort = (arr, min, max) => {
  const bucketNum = Math.floor((max - min) / arr.length) + 1;
  const bucketList = [];
  for (let i = 0; i < bucketNum; i++) {
    bucketList.push([]);
  }
  for (let i = 0; i < arr.length; i++) {
    const index = Math.floor((arr[i] - min) / arr.length);
    bucketList[index].push(arr[i]);
  }
  let res = [];
  for (let i = 0; i < bucketNum; i++) {
    bucketList[i].sort((a, b) => {
      return a - b;
    });
    res = res.concat(bucketList[i]);
  }
  return res;
};

/**
 * 基数排序
 */
const radixSorter = (arr, radix) => {
  for (let i = 0; i < radix; i++) {
    const divisor = Math.pow(10, i);
    const radixList = [];
    for (let j = 0; j < 10; j++) {
      radixList.push([]);
    }
    for (let j = 0; j < arr.length; j++) {
      const temp = Math.floor(arr[j] / divisor);
      const res = radixList[temp % 10];
      res.push(arr[j]);
      let count = res.length - 1;
      while (count > 0 && res[count - 1] > res[count]) {
        const t = res[count];
        res[count] = res[count - 1];
        res[count - 1] = t;
        count--;
      }
    }
    let count = 0;
    for (let j = 0; j < 10; j++) {
      for (let k = 0; k < radixList[j].length; k++) {
        arr[count] = radixList[j][k];
        count++;
      }
    }
  }
};
const arr = [3, 2, 38, 5, 47, 15, 36, 26, 27, 44, 46, 4, 19, 50, 48];
shellSort(arr);
console.log(arr);
