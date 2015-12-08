function main() {
  var m = [20, 120, 20, 120],
        w = 1280 - m[1] - m[3],
        h = 900 - m[0] - m[2],
        i = 0,
        root = {};

  var tree = d3.layout.tree();
  var circles = {};
  var paths = {};
  var labels = {};

  tree.children(function (d) { return d.values; }).size([h, w]);

  var diagonal = d3.svg.diagonal()
       .projection(function (d) {
           return [d.y, d.x];
       });

  var svg = d3.select(".main-graph").append("svg:svg")
    .attr("width", w + m[1] + m[3])
    .attr("height", h + m[0] + m[2])
    .append("svg:g")
    .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

  var nodeRadius;

  // read test data
  d3.csv("data/sales_data.csv", function (csv) {
    var data = [];
    debugger;
    var nest = d3.nest()
      .key(function (d) {
        return d.Level1;
      })
      .key(function (d) {
        return d.Level2;
      })
      .key(function (d) {
        return d.Level3;
      });
  });
}

main();
