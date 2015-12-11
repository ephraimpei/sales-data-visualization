var _rawData = [];
var _rolledUpProdData = [];
var _rolledUpBrandData = [];
var _rolledUpFamilyData = [];

function findObj(arr, level, targetObj) {
  if (arr.length === 0) { return null; }

  for (var i = 0; i < arr.length - 1; i++) {
    switch (level) {
      case "Product":
        if (arr[i].Product === targetObj.Product) { return arr[i]; }
        break;
      case "Brand":
        if (arr[i].Brand === targetObj.Brand) { return arr[i]; }
        break;
      case "Family":
        if (arr[i].Family === targetObj.Family) { return arr[i]; }
        break;
    }
  }
  return null;
}

var DataStore = {
  fillRawData: function (dataRecord) {
    _rawData.push(dataRecord);
  },

  getRawData: function () {
    return _rawData;
  },

  setRolledUpData: function (level) {
    var levelArr, baseArr;

    switch (level) {
      case "Product": levelArr = _rolledUpProdData; baseArr = _rawData; break;
      case "Brand": levelArr = _rolledUpBrandData; baseArr = _rolledUpProdData; break;
      case "Family": levelArr = _rolledUpFamilyData; baseArr = _rolledUpBrandData; break;
    }

    baseArr.forEach(function (data) {
      var levelData = findObj(levelArr, level, data);

      if (levelData) {
        console.log(levelData.Sales, level, "before");
        levelData.Sales += data.Sales;
        levelData.Target += data.Target;
        levelData.Percentage = Math.floor((levelData.Sales / levelData.Target) * 100);
        console.log(levelData.Sales, level, "after");
      } else {
        levelArr.push(data);
      }
    });
  },

  getRolledUpData: function (level) {
    switch (level) {
      case "Product": return _rolledUpProdData;
      case "Brand": return _rolledUpBrandData;
      case "Family": return _rolledUpFamilyData;
    }
  },
};

module.exports = DataStore;
