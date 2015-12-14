function main() {
  var $ = module.$;
  var d3 = module.d3;
  var d3tip = module.d3tip;
  var DataStore = module.DataStore;

  var setNodeColors = function () {
    nodeColors = {};

    var levels = DataStore.getLevels().reverse();

    levels.forEach(function (level, depth) {
      depth++;

      var levelDataArr = DataStore.getRolledUpData(level);

      nodeColors[depth] = {};

      levelDataArr.forEach(function (levelDataObj, i) {
        nodeColors[depth][levelDataObj.key] = colors[(i + 1) % colors.length];
      });
    });
  };

  var getNodeColor = function (d) {
    if (d.depth === 0) {
      return "steelblue";
    } else {
      return nodeColors[d.depth][d.key];
    }
  };

  var drawNodes = function () {
    d3.select("g").selectAll("*").remove();

    var salesData = DataStore.getFilteredData();

    var nestedData = d3.nest()
      .key(function (d) { return d.Family; })
      .key(function (d) { return d.Brand; })
      .key(function (d) { return d.Product; })
      .rollup(function(leaves) {})
      .entries(salesData);

    root = {};
    root.values = nestedData;

    var nodes = tree.nodes(root);
    var links = tree.links(nodes);

    resetNodeAttr(nodes);

    var node = canvas.selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
        .attr("class", "node")
        .attr("Sales", function (d) { return d.Sales; })
        .attr("Target", function (d) { return d.Target; })
        .attr("Percentage", function (d) { return d.Percentage; })
        .attr("transform", function (d) {
          return "translate(" + d.y + "," + d.x + ")";
        })
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide)
        .on("click", function(d) {
          toggleNodes(d);
          updateCanvas(d);
        });

    node.append("circle")
      .attr("r", function (d) { return d.Radius; })
      .attr("fill", function(d) { return getNodeColor(d); })
      .style("fill-opacity", ".8");

    node.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", function (d) { return -d.Radius - 5; })
      .text(function (d) {
        return d.key;
      });

    canvas.selectAll(".link")
      .data(links)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#ADADAD")
      .attr("d", diagonal);
  };

  var resetNodeAttr = function (nodes) {
    var totalSales = DataStore.getGlobalObj().Sales;
    var nodeRadius = d3.scale.sqrt()
      .domain([0, totalSales])
      .range([0, 50]);

    nodes.forEach(function (node) {
      var levelObj = DataStore.getLevelData(node.depth, node.key);

      node.Sales = levelObj.Sales;
      node.Target = levelObj.Target;
      node.Percentage = levelObj.Percentage;
      node.Radius = nodeRadius(levelObj.Sales);
    });
  };

  function toggleNodes(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children;
        d._children = null;
    }
  }

  // set attributes for tooltip
  var tip = d3tip(d3)()
    .attr('class', 'd3-tip')
    .html(function(d) {
      var sales = d.Sales;
      var salesUSDFormat = sales.toLocaleString('en-US', { style: 'currency', currency: 'USD' }).slice(0,-3);

      var target = d.Target;
      var targetUSDFormat = target.toLocaleString('en-US', { style: 'currency', currency: 'USD' }).slice(0,-3);

      var percent = d.Percentage.toString() + "%";

      return (
        "<table><tr><th>Sales</th><th>Target</th><th>Percent</th></tr>" +
        "<tr><td>" + salesUSDFormat + "</td><td>" + targetUSDFormat + "</td><td>" + percent + "</td></tr></table>"
      );
    });

  // set attributes for canvas
  var w = $(document).width(),
    h = $(document).height(),
    xOffset = w * 0.1,
    yOffset = h * 0.1;

  var canvas = d3.select(".main-graph").append("svg")
    .attr("width", w)
    .attr("height", h)
    .append("g")
      .attr("transform", "translate(" + yOffset + "," + xOffset + ")");

  canvas.call(tip);

  var diagonal = d3.svg.diagonal()
       .projection(function (d) {
           return [d.y, d.x];
       });

  var tree = d3.layout.tree()
    .children(function (d) { return d.values; })
    .size([h - (xOffset * 2), w - (yOffset * 2)]);

  var colors = ["#bd0026", "#fecc5c", "#fd8d3c", "#f03b20", "#B02D5D",
        "#9B2C67", "#982B9A", "#692DA7", "#5725AA", "#4823AF",
        "#d7b5d8", "#dd1c77", "#5A0C7A", "#5A0C7A"];

  //read test data
  d3.csv("data/sales_data.csv", function (csv) {
    csv.forEach(function (d) {
      d.Sales = Number(d.Sales.replace(/[^0-9\.]+/g,""));
      d.Target = Number(d.Target.replace(/[^0-9\.]+/g,""));
      d.Percentage = Number(d.Percentage.replace("%",""));

      DataStore.fillRawData(d);
    });

    // populate raw data
    var rawData = DataStore.getRawData();

    // populate filtered data
    DataStore.filterData();

    // set colors for each level
    setNodeColors();

    drawNodes();

    // populate territory drop down list
    var territories = d3.nest()
      .key(function (d) { return d.Territory; })
      .entries(rawData)
      .sort(function(a, b) {
        var territoryA = parseInt(a.key.replace("Territory ", ""));
        var territoryB = parseInt(b.key.replace("Territory ", ""));
        return territoryA - territoryB;
      });

    territories = [{key:"All"}].concat(territories);

    d3.select(".sales-territory").selectAll("option")
      .data(territories)
      .enter()
        .append("option")
        .text(function (d) { return d.key; })
        .attr("value", function(d) { return d.key; });

    // populate state drop down list
    var states = d3.nest()
      .key(function (d) { return d.State; })
      .sortKeys(d3.ascending)
      .entries(rawData);

    states = [{key:"All"}].concat(states);

    d3.select(".sales-state").selectAll("option")
      .data(states)
      .enter()
        .append("option")
        .text(function (d) { return d.key; })
        .attr("value", function(d) { return d.key; });

    // add event listeners for filters
    $(".sales-territory").on("change", function(event) {
      var territoryFilter = event.currentTarget.value;

      DataStore.setTerritoryFilter(territoryFilter);

      drawNodes();
    });

    $(".sales-state").on("change", function(event) {
      var stateFilter = event.currentTarget.value;

      DataStore.setStateFilter(stateFilter);

      drawNodes();
    });
  });
}
