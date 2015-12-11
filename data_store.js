var _rawData = [];
var _rolledUpProdData = [];
var _rolledUpBrandData = [];
var _rolledUpFamilyData = [];

function findObj(arr, level, targetObj) {
  if (arr.length === 0) { return null; }

  for (var i = 0; i < arr.length; i++) {
    if (arr[i].key === targetObj[level]) {
      return arr[i];
    }
    // switch (level) {
    //   case "Product":
    //     if (arr[i].key === targetObj.Product) { target = arr[i]; }
    //     break;
    //   case "Brand":
    //     if (arr[i].key === targetObj.Brand) { target = arr[i]; }
    //     break;
    //   case "Family":
    //     if (arr[i].key === targetObj.Family) { target = arr[i]; }
    //     break;
    // }
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

  // getData: function (depth, key) {
  //   switch (depth) {
  //     case 1: this.getFamilyObj(key); break;
  //     case 2: this.getBrandObj(key); break;
  //     case 3: this.getProductObj(key); break;
  //     default: return {};
  //   }
  // },
  //
  // getFamilyObj: function (value) {
  //   for (var idx in _rolledUpFamilyData) {
  //     if (_rolledUpFamilyData[idx])
  //   }
  // },

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
        levelData.Sales += data.Sales;
        levelData.Target += data.Target;
        levelData.Percentage = Math.floor((levelData.Sales / levelData.Target) * 100);
      } else {
        data.key = data[level];
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
