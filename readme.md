# Sales Data Visualization

[Live Site][live]

[live]: http://sales-data-visualization.herokuapp.com/

## Summary

This app loads up a beautiful and interactive tree layout for viewing basic sales data.  The initial data load is from a mocked up CSV file on the server, but the user will be able to upload his/her own CSV file using the provided template to refresh the tree map with their own data. The app can easily be expanded to support additional levels due to the DataStore script that modularizes the app thus allowing it to be easily maintained.

### Languages
* JavaScript
* HTML
* CSS

### Libraries and Technologies
* Node
* Express
* Browserify
* Watchify
* d3
* d3-tip
* jQuery

### App features
You can:
- Represent hierarchical sales data in an interactive tree map
- Use the provided CSV template to upload your own data
- Load two sample data sets (all fake/mocked up data):
  1. Product Sales Data
  2. NBA Jersey Sales Data

The app features:
- Beautiful styling
- Support for three levels of the product hierarchy
- Support for two levels of the location hierarchy
- Clickable nodes that expand to the children level
- Loc Level 1 and Loc Level 2 filters which dynamically update the tree layout
- Tooltip featuring aggregate data quantities on mouseover events
