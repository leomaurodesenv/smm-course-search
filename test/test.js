/* Include */
const SmmCourseSearch = require("../lib/SmmCourseSearch.js");

// ## Try search courses
// For example to get the most recents courses

var query = {
    region: 'all',
    uploadDate: 'pastDay',
    sortBy: 'mostRecent'
};

console.log('testing: smm-maker-search');
console.time('test');
SmmCourseSearch.getCourses(query, function(error, courses){
//SmmCourseSearch.getCoursesPages(query, 1 (firstPage), 10 (lastPage), function(error, courses){
//SmmCourseSearch.getInfinity(query, function(error, courses){
    if(error) console.log('> Courses not exist.');
    else console.log(courses);
    console.timeEnd('test');
});
