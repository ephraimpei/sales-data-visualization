function main() {
  var $ = module.$;
  var d3 = module.d3;
  var d3tip = module.d3tip;
  var DataStore = module.DataStore;

  var setNodeColors = function () {
    nodeColors = {};

    var levels = DataStore.getLevels().reverse();

    // set color for global Object
    nodeColors[0] = { "All": "steelblue"};

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
    return d.key ? nodeColors[d.depth][d.key]: nodeColors[d.depth]["All"];
  };

  var getLinkColor = function (d) {
    var source = d.source;

    return source.depth === 0 ? nodeColors[source.depth]["All"] : nodeColors[source.depth][source.key];
  };

  var refreshCanvas = function () {
    d3.select("g").selectAll("*").remove();

    var salesData = DataStore.getFilteredData();

    var nestedData = d3.nest()
      .key(function (d) { return d.Family; })
      .key(function (d) { return d.Brand; })
      .key(function (d) { return d.Product; })
      .rollup(function(leaves) {})
      .entries(salesData);

    root = {};
    labels = {};
    paths = {};
    circles = {};
    root.values = nestedData;

    var nodes = tree.nodes(root);

    drawNodes(nodes);
  };

  var drawNodes = function (nodes) {
    var links = tree.links(nodes);

    // set key for global node;
    nodes[0].key = "All";

    // set node attributes
    resetNodeAttr(nodes);

    canvas.selectAll(".link")
      .data(links)
      .enter()
      .append("path")
      .attr("class", function (d) { return "link"; })
      .attr("id", function (d) {
        var sourceKey = d.source.key;
        var targetKey = d.target.key;
        var pathId = sourceKey + "-to-" + targetKey;

        paths[pathId] = this;

        return pathId;
      })
      .attr("fill", "none")
      .attr("d", diagonal)
      .style("stroke", function (d) { return getLinkColor(d); })
      .style("opacity", function (d) {
          var parentDepth = d.parent ? d.parent.depth : 0;
          return ((parentDepth + 1) / 4.5) + 0.2;
        }
      )
      .style("stroke-linecap", "round")
      .style("stroke-width", function (d) { return d.target.Radius; });

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
        .on("mouseover", function (d) { nodeMouseEvent(d, "over"); })
        .on("mouseout", function (d) { nodeMouseEvent(d, "out"); })
        .on("click", function(d) {
          toggleNodes(d);
          update(d);
        });

    node.append("circle")
      .attr("r", function (d) {
        circles[d.key] = this;
        return d.Radius;
      })
      .attr("fill", function(d) { return getNodeColor(d); })
      .style("fill-opacity", ".5")
      .style("stroke", function(d) { return getNodeColor(d); })
      .style("stroke-width", "1.5px");

    node.append("text")
      .attr("text-anchor", function (d) {
        labels[d.key] = this;
        return "middle";
      })
      .attr("x", -30)
      .attr("font-size", "14px")
      .text(function (d) {
        return d.key;
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
    // d3.select(circles[d.key]).transition().style("fill-opacity", circleOpacity);
    // d3.select(labels[d.key]).transition().style("font-weight", fontWeight).style("font-size", fontSize);
    // if (d.key === "All") { return; }
    // else {
    //   d3.select(circles[sourceKey]).transition().style("fill-opacity", circleOpacity);
    //   d3.select(labels[sourceKey]).transition().style("font-weight", fontWeight).style("font-size", fontSize);
    //   d3.select(paths[pathId]).transition().style("opacity", pathOpacity);
    //
    // }
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
      node.hidden = false;
    });
  };

  var toggleNodes = function (d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(toggleNodes);
      d.children = null;
      d.hidden = true;
    }
    else {
      d.children = d._children;
      d.children.forEach(toggleNodes);
      d._children = null;
      d.hidden = false;
    }
  };

  var update = function (source) {
    if (source.hidden) {
      source.hidden = false;
      nodes = tree.nodes(root).filter( function (d) { return d.hidden; });
      removeNodes(source, nodes);
    } else {
      source.hidden = true;
      nodes = tree.nodes(root).filter( function (d) { return !d.hidden; });
      drawNodes(nodes);
    }
  };

  var removeNodes = function (source, nodes) {
    canvas.selectAll(".node").data(nodes)
      .exit()
      .transition()
      .duration(500)
      .attr("transform", function (d) {
        return "translate(" + source.y + "," + source.x + ")";
      })
      .remove();

    nodeExit.select("circle").attr("r", 1e-6);

    nodeExit.select("text").style("fill-opacity", 1e-6);
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
      // skip if a key attribute is missing from the record
      if (!d.Product || !d.Brand || !d.Family || !d.Territory || !d.State) { return; }

      // parse and coerce data fields
      d.Sales = Number(d.Sales.replace(/[^0-9\.]+/g,""));
      d.Target = Number(d.Target.replace(/[^0-9\.]+/g,""));
      d.Percentage = Number(d.Percentage.replace("%",""));

      DataStore.fillRawData(d);
    });

    var rawData = DataStore.getRawData();

    // populate filtered data in DataStore
    DataStore.filterData();

    // set colors for each level
    setNodeColors();

    // draw nodes on canvas
    refreshCanvas();

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

      refreshCanvas();
    });

    $(".sales-state").on("change", function(event) {
      var stateFilter = event.currentTarget.value;

      DataStore.setStateFilter(stateFilter);

      refreshCanvas();
    });
  });
}
