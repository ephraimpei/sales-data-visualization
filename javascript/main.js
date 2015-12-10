function main() {
  var m = [20, 120, 20, 120],
        w = 1280 - m[1] - m[3],
        h = 900 - m[0] - m[2],
        i = 0,
        root = {};

  // tree.children(function (d) { return d.values; }).size([h, w]);

  var canvas = d3.select(".main-graph").append("svg")
    .attr("width", w + m[1] + m[3])
    .attr("height", h + m[0] + m[2])
    .append("g")
      .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

  var diagonal = d3.svg.diagonal()
       .projection(function (d) {
           return [d.y, d.x];
       });

  canvas.append("path")
    .attr("fill", "none")
    .stroke("stroke", "black")
    .attr("d", diagonal);

  var tree = d3.layout.tree()
    .size([600, 600]);

  // read test data
  d3.csv("data/sales_data.csv", function (csv) {
    var rawData = [];

    csv.forEach(function (salesRecord) {
      rawData.push(salesRecord);
    });
    debugger;
  });

  var nodes = tree.nodes(data);

  var links = tree.links(nodes);

  var node = canvas.selectAll(".node")
    .data(nodes)
    .enter()
    .append("g")
      .attr("class", "node")
      .attr("transform", "translate(" + d.y + "," + d.x + ")");

  node.append("circle")
    .attr("r", 5)
    .attr("fill", "steelblue");

  node.append("text")
    .text(function (d) {
      return d.name;
    });

  canvas.selectAll(".link")
    .data(links)
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("fill", "none")
    .attr("stroke", "#ADADAD")
    .attr("d", diagonal);
}

main();
