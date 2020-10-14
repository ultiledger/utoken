import dayjs from 'dayjs';
export default function (value, newFormat, oldFormat = 'YYYYMMDD HH:mm:ss') {
  if (value && newFormat) {
    return dayjs(value, oldFormat).format(newFormat);
  }
  return value;
}
