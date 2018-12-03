export default function (vaule, source, target) {
  if (vaule && source && target) {
    return vaule.replace(source, target);
  }
  return vaule;
}
