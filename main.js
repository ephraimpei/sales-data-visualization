function main() {
  var $ = module.$;
  var d3 = module.d3;
  var d3tip = module.d3tip;
  var DataStore = module.DataStore;

  var addEventListeners = function () {
    $("#loc-level-2").on("change", function(event) {
      var territoryFilter = event.currentTarget.value;

      DataStore.setTerritoryFilter(territoryFilter);

      createRoot();
    });

    $("#loc-level-1").on("change", function(event) {
      var stateFilter = event.currentTarget.value;

      DataStore.setStateFilter(stateFilter);

      createRoot();
    });

    $(".upload-template").on("click", function(event) {
      $('input[type="file"]').click();
    });

    $(".template1").on("click", function (event) {
      readCSVData("data/sales_data.csv");
    });

    $(".template2").on("click", function (event) {

    });
  };

  var createObjectTrackers = function () {
    labels = {};
    paths = {};
    circles = {};
  };

  var setNodeColors = function () {
    nodeColors = {};

    // set color for global Object
    nodeColors[0] = { "All": "steelblue"};

    prodLevels.reverse().forEach(function (level, depth) {
      depth++;

      var levelDataArr = DataStore.getRolledUpData(level);
      nodeColors[depth] = {};

      levelDataArr.forEach(function (levelDataObj, i) {
        nodeColors[depth][levelDataObj.key] = colors[(i + 1) % colors.length];
      });
    });
  };

  var getNodeColor = function (d) {
    return d.key ? nodeColors[d.depth][d.key]: nodeColors[d.depth]["All"];
  };

  var getLinkColor = function (d) {
    var source = d.source;

    return source.depth === 0 ? nodeColors[source.depth]["All"] : nodeColors[source.depth][source.key];
  };

  var createRoot = function () {
    var nestedData = d3.nest()
      .key(function (d) { return d[prodLevel1]; })
      .key(function (d) { return d[prodLevel2]; })
      .key(function (d) { return d[prodLevel3]; })
      .rollup(function(leaves) {})
      .entries(DataStore.getFilteredData());

    // root.children.forEach(toggleNodes);

    root = {};
    root.x0 = (h - (xOffset * 2)) / 2;
    root.y0 = 0;
    root.values = nestedData;

    canvas.selectAll("*").remove();

    update(root);
  };

  var update = function (source) {
    var nodes = tree.nodes(root);
    var links = tree.links(nodes);
    var duration = 500;

    // Set node attributes
    resetNodeAttr(nodes);

    // set key for global node;
    nodes[0].key = "All";

    // Update the nodes…
    var node = canvas.selectAll("g.node").data(nodes, function (d, i) { return d.id || (d.id = ++i); });

    // Enter any new nodes
    var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("id", function (d) { return d.key; })
      .attr("Sales", function (d) { return d.Sales; })
      .attr("Target", function (d) { return d.Target; })
      .attr("Percentage", function (d) { return d.Percentage; })
      .attr("transform", function (d) { return "translate(" + source.y0 + "," + source.x0 + ")";})
      .on("mouseover", function (d) { nodeMouseEvent(d, "over"); })
      .on("mouseout", function (d) { nodeMouseEvent(d, "out"); })
      .on("click", toggleNodes);

    nodeEnter.append("circle")
      .attr("r", function (d) {
        circles[d.key] = this;
        return d.Radius;
      })
      .attr("fill", function(d) { return getNodeColor(d); })
      .style("fill-opacity", ".5")
      .style("stroke", function(d) { return getNodeColor(d); })
      .style("stroke-width", "1.5px");

    nodeEnter.append("text")
      .attr("text-anchor", function (d) {
        labels[d.key] = this;
        return "middle";
      })
      .attr("x", -30)
      .attr("font-size", "14px")
      .text(function (d) { return d.key; });

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

    // exit transition properties
    var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .remove();

    nodeExit.select("circle")
      .attr("r", 1e-6);

    nodeExit.select("text")
      .style("fill-opacity", 1e-6);

    // Update the links...
    var link = canvas.selectAll("path.link").data(links, function (d) {
      var sourceKey = d.source.key;
      var targetKey = d.target.key;
      var pathId = sourceKey + "-to-" + targetKey;

      return pathId;
    });

    // Enter any new links at the parent's previous pos.
    link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = { x: source.x0, y: source.y0 };
        return diagonal({source: o, target: o});
      })
      .attr("id", function (d) {
        var sourceKey = d.source.key;
        var targetKey = d.target.key;
        var pathId = sourceKey + "-to-" + targetKey;

        paths[pathId] = this;

        return pathId;
      })
      .attr("fill", "none")
      .style("stroke", function (d) { return getLinkColor(d); })
      .style("opacity", function (d) {
          var parentDepth = d.parent ? d.parent.depth : 0;
          return ((parentDepth + 1) / 4.5) + 0.2;
        }
      )
      .style("stroke-linecap", "round")
      .style("stroke-width", function (d) { return d.target.Radius; });

    // Transition links to their new position.
    link.attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  };

  var nodeMouseEvent = function (d, type) {
    var fontSize, fontWeight, circleOpacity, pathOpacity;

    if (type === "over") {
      tip.show(d);
      fontSize = "16px", fontWeight = "bold", circleOpacity = "1", pathOpacity = "0.8";
    } else {
      tip.hide(d);
      fontSize = "14px", fontWeight = "normal", circleOpacity = "0.5", pathOpacity = "0.3";
    }

    // Highlight entire path and source nodes
    function highlightPathAndNodes(d) {
      var targetKey = d.key;

      d3.select(circles[d.key]).transition().style("fill-opacity", circleOpacity);
      d3.select(labels[d.key]).transition().style("font-weight", fontWeight).style("font-size", fontSize);

      if (d.parent) {
        var sourceKey = d.parent.key;
        var pathId = sourceKey + "-to-" + targetKey;

        d3.select(paths[pathId]).transition().style("opacity", pathOpacity);
      } else {
        return;
      }

      highlightPathAndNodes(d.parent);
    }

    highlightPathAndNodes(d);
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

  var toggleNodes = function (d) {
    if (d.values) {
      d._children = d.children;
      d._values = d.values;
      d.values = null;
      d.children = null;
      update(d);
    } else if (d._values) {
      d.children = d._children;
      d.values = d._values;
      d._children = null;
      d._values = null;
      update(d);
    }
  };

  var readCSVData = function (path) {
    d3.csv(path, function (csv) {
      // App default config supports 3 product levels and 2 loc levels.
      var numProdLevels = 3;
      var numLocLevels = 2;

      // Key Attr Idx locates columns needed to enable hierarchical data
      var keyAttrIdx1 = 0;
      var keyAttrIdx2 = numProdLevels;
      var keyAttrIdx3 = numProdLevels + numLocLevels;

      var prodLevelValues = d3.keys(csv[0]).slice(keyAttrIdx1, keyAttrIdx2);
      var locLevelValues = d3.keys(csv[0]).slice(keyAttrIdx2, keyAttrIdx3);

      DataStore.fillProdAndLocLevels(prodLevelValues, locLevelValues);

      csv.forEach(function (d) {
        // Skip if a key attribute is missing from the record
        for (var i = 0; i < numProdLevels + numLocLevels; i++) {
          if (i < 3) { if (!d[prodLevelValues[i]]) { return; } }
          else { if (!d[locLevelValues[i - numProdLevels]]) {return;} }
        }

        // Parse and coerce data fields
        d.Sales = Number(d.Sales.replace(/[^0-9\.]+/g,""));
        d.Target = Number(d.Target.replace(/[^0-9\.]+/g,""));
        d.Percentage = Number(d.Percentage.replace("%",""));

        DataStore.fillRawData(d);
      });

      // Set global attributes. Level 3 means higher than Level 2 (Family > Brand)
      prodLevels = DataStore.getLevels("Product");
      prodLevel3 = prodLevels[0];
      prodLevel2 = prodLevels[1];
      prodLevel1 = prodLevels[2];

      locLevels = DataStore.getLevels("Location");
      locLevel2 = locLevels[0];
      locLevel1 = locLevels[1];

      var rawData = DataStore.getRawData();

      // Add label to Location Level 2 drop down list
      $(".loc-level-2-label").text(locLevel2);

      // Populate Location Level 2 drop down list
      var level2Locations = d3.nest()
        .key(function (d) { return d[locLevel2]; })
        .entries(rawData)
        .sort(function(a, b) {
          var charCodeValueA = 0;
          var charCodeValueB = 0;

          a.key.split("").forEach(function (el) { charCodeValueA += el.charCodeAt(); });
          b.key.split("").forEach(function (el) { charCodeValueB += el.charCodeAt(); });

          return charCodeValueA - charCodeValueB;
        });

      level2Locations = [{key:"All"}].concat(level2Locations);

      d3.select("#loc-level-2").selectAll("option")
        .data(level2Locations)
        .enter()
          .append("option")
          .text(function (d) { return d.key; })
          .attr("value", function(d) { return d.key; });

      // Add label to Location Level 1 drop down list
      $(".loc-level-1-label").text(locLevel1);

      // Populate Location Level 1 drop down list
      var level1Locations = d3.nest()
        .key(function (d) { return d[locLevel1]; })
        .entries(rawData)
        .sort(function(a, b) {
          var charCodeValueA = 0;
          var charCodeValueB = 0;

          a.key.split("").forEach(function (el) { charCodeValueA += el.charCodeAt(); });
          b.key.split("").forEach(function (el) { charCodeValueB += el.charCodeAt(); });

          return charCodeValueA - charCodeValueB;
        });

      level1Locations = [{key:"All"}].concat(level1Locations);

      d3.select("#loc-level-1").selectAll("option")
        .data(level1Locations)
        .enter()
          .append("option")
          .text(function (d) { return d.key; })
          .attr("value", function(d) { return d.key; });

      // Populate filtered data in DataStore
      DataStore.filterData();

      // Set colors for each level
      setNodeColors();

      // Create object trackers (will be used for selecting objects to animate)
      createObjectTrackers();

      // Create root and canvas
      createRoot();
    });
  };

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
  var w = $(window).width(),
    h = $(window).height(),
    xOffset = w * 0.1,
    yOffset = h * 0.2;

  var i = 0,
    duration = 500,
    root;

  var tree = d3.layout.tree()
    .children(function (d) { return d.values; })
    .size([h - (xOffset * 2), w - (yOffset * 2)]);

  var diagonal = d3.svg.diagonal()
       .projection(function (d) { return [d.y, d.x]; });

  var canvas = d3.select(".main-graph").append("svg")
    .attr("width", w)
    .attr("height", h)
    .append("g")
      .attr("transform", "translate(" + yOffset + "," + xOffset + ")");

  canvas.call(tip);

  var colors = ["#bd0026", "#fecc5c", "#fd8d3c", "#f03b20", "#B02D5D",
        "#9B2C67", "#982B9A", "#692DA7", "#5725AA", "#4823AF",
        "#d7b5d8", "#dd1c77", "#5A0C7A", "#5A0C7A"];

  readCSVData("data/sales_data.csv");

  addEventListeners();
}
