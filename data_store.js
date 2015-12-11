var _rawData = [];
var _rolledUpProdData = [];
var _rolledUpBrandData = [];
var _rolledUpFamilyData = [];

function findObj(arr, targetObj) {
  if (this.length === 0) { return null; }

  for (var i = 0; i < this.length - 1; i++) {
    if (this[i].id === targetObj.id) { return this[i]; }
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

  setRolledUpProdData: function () {
    _rawData.forEach(function (data) {
      var productData = findObj(_rolledUpProdData, data);
      debugger;
      if (productData) {
        productData.Sales += data.Sales;
        productData.Target += data.Target;
        productData.Percentage = Math.floor((productData.Sales / productData.Target) * 100);
      } else {
        _rolledUpProdData.push(data);
      }
    });
  },

  getRolledUpProdData: function () {
    return _rolledUpProdData;
  },

  setRolledUpBrandData: function () {

  },

  setRolledUpFamilyData: function () {

  }

};

module.exports = DataStore;
