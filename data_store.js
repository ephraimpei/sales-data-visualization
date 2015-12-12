var _rawData = [];
var _rolledUpProdData = [];
var _rolledUpBrandData = [];
var _rolledUpFamilyData = [];

var DataStore = {
  findObj: function (arr, level, target) {
    if (arr.length === 0) { return null; }

    if (level !== "key") {
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].key === target[level]) {
          return arr[i];
        }
      }
    } else {
      for (var j = 0; j < arr.length; j++) {
        if (arr[j].key === target) {
          return arr[j];
        }
      }
    }

    return null;
  },

  fillRawData: function (dataRecord) {
    _rawData.push(dataRecord);
  },

  getRawData: function () {
    return _rawData;
  },

  getGlobalObj: function () {
    var obj = {};
    var Sales = 0;
    var Target = 0;

    _rolledUpFamilyData.forEach(function (family) {
      Sales += family.Sales;
      Target += family.Target;
    });

    var Percentage = Math.floor((Sales / Target) * 100);

    return {
      key: "All",
      Sales: Sales,
      Target: Target,
      Percentage: Percentage
    };
  },

  getLevelData: function (depth, key) {
    if (depth === 0) { return this.getGlobalObj(); }

    var arr, level;

    switch (depth) {
      case 1: arr = _rolledUpFamilyData; break;
      case 2: arr = _rolledUpBrandData; break;
      case 3: arr = _rolledUpProdData; break;
      default: return {};
    }

    return this.findObj(arr, "key", key);
  },

  setRolledUpData: function (level) {
    var levelArr, baseArr;

    switch (level) {
      case "Product": levelArr = _rolledUpProdData; baseArr = _rawData; break;
      case "Brand": levelArr = _rolledUpBrandData; baseArr = _rolledUpProdData; break;
      case "Family": levelArr = _rolledUpFamilyData; baseArr = _rolledUpBrandData; break;
    }

    baseArr.forEach(function (data) {
      var levelData = DataStore.findObj(levelArr, level, data);

      if (levelData) {
        levelData.Sales += data.Sales;
        levelData.Target += data.Target;
      } else {
        var copy = Object.assign({}, data);
        copy.key = copy[level];
        levelArr.push(copy);
      }
    });

    // calculate percentage
    levelArr.forEach(function (levelData) {
      levelData.Percentage = Math.floor((levelData.Sales / levelData.Target) * 100);
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
