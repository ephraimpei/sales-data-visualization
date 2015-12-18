var _rawData = [];
var _rolledUpProdLvl3Data = [];
var _rolledUpProdLvl2Data = [];
var _rolledUpProdLvl1Data = [];
var _locLevel2Filter = "All";
var _locLevel1Filter = "All";
var _filteredData = [];
var _locMappingObj = {"All": "All"};

var _productLevels = [];
var _locationLevels = [];
var _dataFields = [];

var DataStore = {
  createLocationMappingObj: function () {
    _rawData.forEach(function (data) {
      _locMappingObj[data[locLevel2]] = data[locLevel1];
    });
  },

  getLocMappingObj: function () {
    return _locMappingObj;
  },

  resetDataStore: function () {
    _rawData = [];
    _rolledUpProdLvl3Data = [];
    _rolledUpProdLvl2Data = [];
    _rolledUpProdLvl1Data = [];
    _locLevel2Filter = "All";
    _locLevel1Filter = "All";
    _filteredData = [];
    _locMappingObj = {"All": "All"};

    _productLevels = [];
    _locationLevels = [];
    _dataFields = [];
  },

  getDataAttr: function (level) {
    switch (level) {
      case "Product": return _productLevels.slice();
      case "Location": return _locationLevels.slice();
      case "Data": return _dataFields.slice();
    }
  },

  populateDataAttr: function (prodLevels, locLevels, dataFields) {
    _productLevels = prodLevels;
    _locationLevels = locLevels;
    _dataFields = dataFields;
  },

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
    return _rawData.slice();
  },

  getGlobalObj: function () {
    var obj = {};
    var Sales = 0;
    var Target = 0;

    _rolledUpProdLvl1Data.forEach(function (level1) {
      Sales += level1.Sales;
      Target += level1.Target;
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
      case 1: arr = _rolledUpProdLvl1Data; break;
      case 2: arr = _rolledUpProdLvl2Data; break;
      case 3: arr = _rolledUpProdLvl3Data; break;
      default: return {};
    }

    return this.findObj(arr, "key", key);
  },

  setRolledUpData: function (level) {
    var levelArr, baseArr;

    switch (level) {
      case prodLevel3: levelArr = _rolledUpProdLvl3Data; baseArr = _filteredData; break;
      case prodLevel2: levelArr = _rolledUpProdLvl2Data; baseArr = _rolledUpProdLvl3Data; break;
      case prodLevel1: levelArr = _rolledUpProdLvl1Data; baseArr = _rolledUpProdLvl2Data; break;
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
      case prodLevel3: return _rolledUpProdLvl3Data.slice();
      case prodLevel2: return _rolledUpProdLvl2Data.slice();
      case prodLevel1: return _rolledUpProdLvl1Data.slice();
    }
  },

  getFilters: function () {
    return {
      locLevel1: _locLevel2Filter,
      locLevel2: _locLevel1Filter
    };
  },

  setLocLevel2Filter: function(newFilter) {
    _locLevel2Filter = newFilter;

    this.filterData();
  },

  setLocLevel1Filter: function(newFilter) {
    _locLevel1Filter = newFilter;

    this.filterData();
  },

  filterData: function () {
    _filteredData = [];

    if (_locLevel2Filter === "All" && _locLevel1Filter === "All") {
      _filteredData = _rawData;
    } else if (_locLevel2Filter === "All") {
      _rawData.forEach(function (data) {
        if (data[locLevel1] === _locLevel1Filter) {
          _filteredData.push(data);
        }
      });
    } else if (_locLevel1Filter === "All") {
      _rawData.forEach(function (data) {
        if (data[locLevel2] === _locLevel2Filter) {
          _filteredData.push(data);
        }
      });
    } else {
      _rawData.forEach(function (data) {
        if (data[locLevel2] === _locLevel2Filter &&
            data[locLevel1] === _locLevel1Filter) {
          _filteredData.push(data);
        }
      });
    }

    this.calculateRolledUpData();
  },

  calculateRolledUpData: function () {
    this.resetData();

    reverseProductLevels = _productLevels.slice().reverse();

    reverseProductLevels.forEach(function (level) {
      DataStore.setRolledUpData(level);
    });
  },

  getFilteredData: function () {
    return _filteredData.slice();
  },

  resetData: function () {
    _rolledUpProdLvl3Data = [];
    _rolledUpProdLvl2Data = [];
    _rolledUpProdLvl1Data = [];
  }
};

module.exports = DataStore;
