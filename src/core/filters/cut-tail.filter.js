export default function (val) {
  if (!val) {
    return 0;
  }
  let vaule = val + '';
  let index;
  for (let i = vaule.length; i > 0; i--) {
    let s = vaule[i - 1];
    if (s === '0') {
      continue;
    } else if (s === '.') {
      index = i - 1;
      break;
    } else {
      index = i;
      break;
    }
  }

  return vaule.substring(0, index);
}
