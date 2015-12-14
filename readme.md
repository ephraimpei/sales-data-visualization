# Sales Data Visualization

## Summary

This app visualizes mocked up sales data loaded from a CSV file. The data is captured in a hierarchical fashion where the product is is represented in three levels (product, brand, family) and the point of sale location is represented in two levels (territory and state). The app can easily be expanded to support additional levels due to the compartmentalization of the app.

This app provides the user with an interactive tree map that gets loaded according the data captured in the CSV file.  The initial load is from a mocked up CSV file on the server, but the user will be able to upload his/her own CSV file with a template to refresh the tree map with their own data.

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
- Represent sales data in an interactive tree map
- Use the provided CSV template to upload your own data

The app features:
- Clickable nodes that expand to the children level
- Territory and State filters
- Tooltip featuring "rolled up" data quantities on mouseover events
