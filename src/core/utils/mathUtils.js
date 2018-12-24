export default {
  round (dight, howMany) {
    if(howMany) {
      dight = Math.round(dight * Math.pow(10, howMany)) / Math.pow(10, howMany);
    } else {
      dight = Math.round(dight);
    }
    return dight;
  }
};
