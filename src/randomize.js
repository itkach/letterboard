// Returns a random integer between min (included) and max (excluded)
const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

const swap = (array, i, j) => {
  const tmp = array[i];
  array[i] = array[j];
  array[j] = tmp;
};

export default (letterString) => {
  const result = letterString.split(''),
        len = result.length;
  for (let i = 0; i < len - 2; i++) {
    const randomIndex = randomInt(i, len);
    swap(result, randomIndex, i);
  }
  return result;
};
