export default function (vaule, length) {
  if (!vaule || vaule === '') {
    return vaule;
  }
  if (!length) {
    length = 8;
  }
  return vaule.slice(0, length) + '...' + vaule.slice(-length);
}
