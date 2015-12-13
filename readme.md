# Sales Data Visualization

## Summary

This app visualizes mocked up sales data loaded from a CSV file. The data is captured in a hierarchical fashion where the product is is represented in three levels (product, brand, family) and the point of sale location is represented in two levels (territory and state). The app can easily be expanded to support additional levels due to the compartmentalization of the app.

This app provides the user with an interactive tree map that gets loaded according the data captured in the CSV file.  The initial load is from a mocked up CSV file on the server, but the user will be able to upload his/her own CSV file with a template to refresh the tree map with their own data.

### Languages
* JavaScript
* HTML
* CSS

### Frameworks
* Express.js

### Libraries and Technologies
* Node
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

### API

Nom noms is powered by a RESTful JSON API.

I took great care to ensure correspondence between React routes and API endpoints. If you're on a page that displays data, you can replace the # in the URI fragment at any time with api to see what's being served up for a given view. This includes search results, location, and user pages.

Many API responses handle nested data, associations, and perform basic mathematical calculations (for stats). I made extensive use of jbuilder to manage these.

API responses are structured to prevent N+1 queries. I used model scoping with find_by_sql as needed to minimize database fetching and keep controllers slim.

Sorting the index results is done completely in the front end. Since data is already loaded into the stores, the sort functions simply sort the stores rather than refetching from the database.  Therefore, sorting is a very inexpensive operation.
