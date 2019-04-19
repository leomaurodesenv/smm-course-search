# smm-course-search

[![GPLv3 license](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE.md)
[![npm](https://img.shields.io/badge/Code-npm-yellow.svg)](https://www.npmjs.com/package/smm-course-search)
[![JsClasses](https://img.shields.io/badge/Code-JsClasses-yellow.svg)](https://www.jsclasses.org/smm-course-search)
[![GitHub](https://img.shields.io/badge/Code-GitHub-yellow.svg)](https://github.com/leomaurodesenv/smm-course-search)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/ccf4226b1b5445b1851187f2144a7ea5)](https://www.codacy.com/app/leomaurodesenv/smm-course-search?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=leomaurodesenv/smm-course-search&amp;utm_campaign=Badge_Grade)

---
Super Mario Maker is a game from Nintendo Inc. This module can search courses from the official [bookmark site](https://supermariomakerbookmark.nintendo.net).  
This module can request and fetching courses data information just passing a query search.   
      
By response the module call a callback function with 2 arguments `(error, courses)`. These arguments: the first is a boolean to check sucess in fetching; and the second is a json with courses informations (like ID, image, maker, difficulty..).      
   
Note: This module makes analysis on the html structure of the bookmark site. In case of site changes, the `smm-course-search` system may not work correctly.      

---
## Installation

```shell
npm install --save smm-course-search
```
   
---
## Package

### `courses` json

The data information retrive:    

```js
id: '0000-0000-0000-0000',
difficulty: [..],
clearRate: number,
title: 'Name',
img: 'Url',
thumbnailImg: 'Url',
gameStyle: [..],
createdAt: Timestamp,
tag: [..],
stared: number,
played: number,
shared: number,
clears: number,
attempts: number,
maker: 
  \_ login: 'Nintendo ID',
  \_ faceImg: 'Url',
  \_ flag: 'Country',
  \_ name: 'Name'
```
   
### Query Params
   
The query search parameters are optional, but must be pass at least one.       
   
```js
{
  gameStyle: ['all', 'marioBros', 'marioBros3', 'marioWorld', 'marioBrosU'],
  courseTheme: ['all', 'ground', 'underground', 'underwater', 'ghostHouse', 'airship', 'castle'],
  region: ['all', 'jp', 'us', 'eu', 'other'],
  difficulty: ['all', 'easy', 'normal', 'expert', 'superExpert'],
  tag: ['all', 'automatic', 'music', 'puzzle', 'gimmick', 'dash', 
        'remix', 'thumbnail', 'costume', 'yoshi', 'theme', 'speedrun', 
        'autoscroll', 'shootEmUp', 'track', 'tradicional'],
  uploadDate: ['all', 'pastDay', 'pastWeek', 'pastMonth', 'beforeOneMonth'],
  sortBy: ['all', 'starRate', 'totalStars', 'lowestClearRate', 'timesShared', 'mostRecent']
}
```
      
### Functions

There are three functions to search courses:

-   `.getCourses(query, function(error, courses){}` - return first page (max 10 courses).

-   `.getCoursesPages(query, (int) firstPage, (int) lastPage, function(error, courses){}` - return `n` pages.

-   `.getInfinity(query, function(error, courses){}` - search all pages.
      
---
## Example

Example: How search courses. See `test/test.js` for other examples.    
   
```js
/* Include */
var SmmCourseSearch = require('smm-course-search');

// ## Try search courses
// For example to get the most recents courses

var query = {
    region: 'us',
    uploadDate: 'pastDay',
    sortBy: 'mostRecent'
};

console.time('test');
SmmCourseSearch.getCourses(query, function(error, courses){
    if(error) console.log('> Courses not exist.');
    else console.log(courses);
    console.timeEnd('test');
});
```

---
## Also look ~

-   [License GPL v3](LICENSE)
-   Create by Leonardo Mauro ~ [leomaurodesenv](https://github.com/leomaurodesenv/)
