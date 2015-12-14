var _rawData = [];
var _rolledUpProdData = [];
var _rolledUpBrandData = [];
var _rolledUpFamilyData = [];
var _territoryFilter = "All";
var _stateFilter = "All";
var _filteredData = [];

var _levels = ["Product", "Brand", "Family"];

var DataStore = {
  getLevels: function () {
    return _levels.slice();
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
      case "Product": levelArr = _rolledUpProdData; baseArr = _filteredData; break;
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
      case "Product": return _rolledUpProdData.slice();
      case "Brand": return _rolledUpBrandData.slice();
      case "Family": return _rolledUpFamilyData.slice();
    }
  },

  getFilters: function () {
    return {
      territory: _territoryFilter,
      state: _stateFilter
    };
  },

  setTerritoryFilter: function(newFilter) {
    _territoryFilter = newFilter;

    this.filterData();
  },

  setStateFilter: function(newFilter) {
    _stateFilter = newFilter;

    this.filterData();
  },

  filterData: function () {
    _filteredData = [];

    if (_territoryFilter === "All" && _stateFilter === "All") {
      _filteredData = _rawData;
    } else if (_territoryFilter === "All") {
      _rawData.forEach(function (data) {
        if (data.State === _stateFilter) {
          _filteredData.push(data);
        }
      });
    } else if (_stateFilter === "All") {
      _rawData.forEach(function (data) {
        if (data.Territory === _territoryFilter) {
          _filteredData.push(data);
        }
      });
    } else {
      _rawData.forEach(function (data) {
        if (data.Territory === _territoryFilter &&
            data.State === _stateFilter) {
          _filteredData.push(data);
        }
      });
    }

    this.calculateRolledUpData();
  },

  calculateRolledUpData: function () {
    this.resetData();

    _levels.forEach(function (level) {
      DataStore.setRolledUpData(level);
    });
  },

  getFilteredData: function () {
    return _filteredData.slice();
  },

  resetData: function () {
    _rolledUpProdData = [];
    _rolledUpBrandData = [];
    _rolledUpFamilyData = [];
  }
};

module.exports = DataStore;
