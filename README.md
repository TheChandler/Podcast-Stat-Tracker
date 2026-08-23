Podcast tracking site

This is made primarily for the Minnmax show (podcast) but would be relatively easily to set up for any podcast or any episode-based content really.

Started out as a simple page that parses episode data to calculate apearance rates of individuals and display it in a chart. 
Data is managed via a small express/react app.

It's setup so that all data is tracked in a plain .json file, which can then be directly loaded by the main page, which allows hosting on github pages.

The management app is pointed at a youtube playlist to make data entry easier by fetching title, description, and publish date
