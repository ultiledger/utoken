import moment from 'moment';
export default function (value, newFormat, oldFormat = 'YYYYMMDD HH:mm:ss') {
  if (value && newFormat) {
    return moment(value, oldFormat).format(newFormat);
  }
  return value;
}
