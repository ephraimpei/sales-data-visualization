(function () {
  var $ = App.$;
  var Converter = App.Converter;
  var d3 = App.d3;

  // var m = [20, 120, 20, 120],
  //       w = 1280 - m[1] - m[3],
  //       h = 900 - m[0] - m[2],
  //       root = {};

  // var m = [20, 120, 20, 120],
  //   w = $(document).width(),
  //   h = $(document).height();

  var w = $(document).width(),
    h = $(document).height(),
    xOffset = w * 0.1,
    yOffset = h * 0.1;

  var canvas = d3.select(".main-graph").append("svg")
    .attr("width", w)
    .attr("height", h)
    .append("g")
      .attr("transform", "translate(" + yOffset + "," + xOffset + ")");

  var diagonal = d3.svg.diagonal()
       .projection(function (d) {
           return [d.y, d.x];
       });

  var tree = d3.layout.tree()
    .children(function (d) { return d.values; })
    .size([h - (xOffset * 2), w - (yOffset * 2)]);

  var circles = {};
  var paths = {};
  var labels = {};

  //read test data
  d3.csv("data/sales_data.csv", function (csv) {
    var salesData = [];

    csv.forEach(function (d) {
      d.Sales = Number(d.Sales.replace(/[^0-9\.]+/g,""));
      d.Target = Number(d.Target.replace(/[^0-9\.]+/g,""));
      d.Percentage = Number(d.Percentage.replace("%",""));

      salesData.push(d);
    });

    var nestedData = d3.nest()
      .key(function (d) { return d.Family; })
      .key(function (d) { return d.Brand; })
      .entries(salesData);

    root = {};
    root.values = nestedData;

    var nodes = tree.nodes(root);

    var links = tree.links(nodes);

    var node = canvas.selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
        .attr("class", "node")
        .attr("transform", function (d) {
          return "translate(" + d.y + "," + d.x + ")";
        });

    node.append("circle")
      .attr("r", 5)
      .attr("fill", "steelblue");

    node.append("text")
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
  });
}());
