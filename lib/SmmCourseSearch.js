/* Includes */
const Request = require('request');
const DateTime = require('node-datetime');
const HtmlParser = require('htmlparser2');

const CoursesWrapper = require('./CoursesWrapper.js');

/**
 * @module _SmmCourseSearch
 * This class can search courses by request in bookmark super mario maker
 * 
 * @author Leonardo Mauro <leo.mauro.desenv@gmail.com> (http://leonardomauro.com/)
 * @link https://github.com/leomaurodesenv/smm-course-search GitHub
 * @license https://opensource.org/licenses/GPL-2.0 GNU Public License (GPL v2)
 * @copyright 2017 Leonardo Mauro
 * @version 1.0.1 2017-09-24
 * @package smm-course-search
 * @access public
 */
class _SmmCourseSearch {
    
    /**
     * @method module:_SmmCourseSearch
     * Constructor of class
     * @var {String} _urlMiiverse Rrl base to miiverse
     * @var {String} _urlMakerProfile Url base to maker profile
     * @instance
     * @access public
     * @returns {this}
     */
    constructor() {
        this._urlCourseSearch = 'https://supermariomakerbookmark.nintendo.net/search/';
        
        this._gameStyle = { // q[skin]
            in: ['all', 'marioBros', 'marioBros3', 'marioWorld', 'marioBrosU'],
            out: ['', 'mario_bros', 'mario_bros3', 'mario_world', 'mario_bros_u']
        };
        this._courseTheme = { // q[scene]
            in: ['all', 'ground', 'underground', 'underwater', 'ghostHouse', 'airship', 'castle'],
            out: ['', 'ground', 'underground', 'underwater', 'gohst_house', 'airship', 'castle']
        };
        this._region = { // q[area]
            in: ['all', 'jp', 'us', 'eu', 'other'],
            out: ['', 'jp', 'us', 'eu', 'others']
        };
        this._difficulty = { // q[difficulty]
            in: ['all', 'easy', 'normal', 'expert', 'superExpert'],
            out: ['', 'easy', 'normal', 'expert', 'super_expert']
        };
        this._tag = { // q[tag_id]
            in: ['all', 'automatic', 'music', 'puzzle', 'gimmick', 'dash', 
                 'remix', 'thumbnail', 'costume', 'yoshi', 'theme', 'speedrun', 
                 'autoscroll', 'shootEmUp', 'track', 'tradicional'],
            out: ['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15']
        };
        this._uploadDate = { // q[created_at]
            in: ['all', 'pastDay', 'pastWeek', 'pastMonth', 'beforeOneMonth'],
            out: ['', 'past_day', 'past_week', 'past_month', 'before_one_month']
        };
        this._sortBy = { // q[sorting_item]
            in: ['all', 'starRate', 'totalStars', 'lowestClearRate', 'timesShared', 'mostRecent'],
            out: ['', 'like_rate_desc', 'liked_count_desc', 'clear_rate_asc', 'sns_shared_count_desc', 'created_at_desc']
        };
        
        this._newTagTypes = ['gameStyle', 'courseTheme', 'region', 'difficulty', 'tag', 'uploadDate', 'sortBy'];
        this._tagTypes = ['skin', 'scene', 'area', 'difficulty', 'tag_id', 'created_at', 'sorting_item'];
    }

    /**
     * @method module:_SmmCourseSearch::_getRelative
     * Return relative value
     * @arg {String} type     New tag type
     * @arg {String} valueSet value of tag type
     * @access private
     * @returns {String}
     */
    _getRelative(type, valueSet) {
        var dataIndex = -1,
            dataOut = [];
            
        if(type == this._tagTypes[0]) {
            dataIndex = this._gameStyle.in.indexOf(valueSet);
            dataOut = this._gameStyle.out;
        }
        else if(type == this._tagTypes[1]) {
            dataIndex = this._courseTheme.in.indexOf(valueSet);
            dataOut = this._courseTheme.out;
        }
        else if(type == this._tagTypes[2]) {
            dataIndex = this._region.in.indexOf(valueSet);
            dataOut = this._region.out;
        }
        else if(type == this._tagTypes[3]) {
            dataIndex = this._difficulty.in.indexOf(valueSet);
            dataOut = this._difficulty.out;
        }
        else if(type == this._tagTypes[4]) {
            dataIndex = this._tag.in.indexOf(valueSet);
            dataOut = this._tag.out;
        }
        else if(type == this._tagTypes[5]) {
            dataIndex = this._uploadDate.in.indexOf(valueSet);
            dataOut = this._uploadDate.out;
        }
        else if(type == this._tagTypes[6]) {
            dataIndex = this._sortBy.in.indexOf(valueSet);
            dataOut = this._sortBy.out;
        }
        return (dataIndex != -1) ? dataOut[dataIndex] : '';
    }
    
    /**
     * @method module:_SmmCourseSearch::_getQueryUrl
     * Return url of query
     * @arg {String} dataQuery  Json with configs of query
     * @arg {Integer} page      Number of page
     * @access private
     * @returns {String}
     */
    _getQueryUrl(dataQuery, page) {
        var query = {'skin': '', 'scene': '', 'area': '', 'difficulty': '', 'tag_id': '', 'created_at': '', 'sorting_item': ''};
        
        for(var newType in dataQuery) {
            let type = this._tagTypes[this._newTagTypes.indexOf(newType)];
            let value = this._getRelative(type, dataQuery[newType]);
            query[type] = value;
        }
        var strQuery = 'result?utf8=%E2%9C%93&';
        for(var obj in query) strQuery += 'q['+obj+']='+query[obj]+'&';
        return (this._urlCourseSearch + strQuery + 'page=' + page);
    }
    
    /**
     * @method module:_SmmCourseSearch::_parserPagination
     * Return callbackFunction(page, countCoursesWrapper, coursesWrapper)
     * @arg {Integer} page      Number of page
     * @arg {String} body       HTML of page
     * @arg {Array} coursesWrapper      Json with courses wrapper
     * @arg {Callback} callbackFunction Function to recive callback
     * @access private
     * @returns {Callback}
     */
    _parserPagination(page, body, coursesWrapper, callbackFunction) {
        // Parser all HTML
        let curNode = {
            attribs: {},
            children: [],
            name: 'root',
            text: []
        };
        let countCoursesWrapper = 0;
        let _parserCourseSearch = new HtmlParser.Parser({
            onopentag: function(name, attribs) {
                const node = {
                    attribs: attribs,
                    children: [],
                    name: name,
                    parent: curNode,
                    text: null
                };
                curNode.children.push(node);
                curNode = node;
            }, ontext (text) {
                curNode.text = text;
            }, onclosetag (name) {
                // Which in case the tag has a closed bad
                if(name != curNode.name) return;
                const closedNode = curNode;
                curNode = curNode.parent;
                // Which in case no have class
                let attrClass = closedNode.attribs.class;
                if (!!!(attrClass)) return;
                
                // -- coursesWrapper in Search Results
                if (closedNode.name == 'div' && attrClass.match(/([ ]*)search-results([ ]*)$/)){
                    let newCourses = CoursesWrapper.getCoursesDetails(closedNode);
                    countCoursesWrapper = newCourses.length;
                    for(let i=0; i<newCourses.length; i++) coursesWrapper.push(newCourses[i]);
                }
            }, onend() {
                callbackFunction(page, countCoursesWrapper, coursesWrapper);
            }                 
        }, {decodeEntities: true, recognizeSelfClosing: true});
        _parserCourseSearch.write(body);
        _parserCourseSearch.end();
    }
    
    /**
     * @method module:_SmmCourseSearch::getCoursesPages
     * Return callbackFunction(error, json) with a first page query
     * @arg {Json} dataQuery    Json with query configs
     * @arg {Callback} callbackFunction Function to recive callback
     * @access public
     * @returns {Callback}
     */
    getCourses(dataQuery, callbackFunction) {
        this.getCoursesPages(dataQuery, 1, 1, callbackFunction);
    }
    
    /**
     * @method module:_SmmCourseSearch::getCoursesPages
     * Return callbackFunction(error, json) with a range query
     * @arg {Json} dataQuery    Json with query configs
     * @arg {Integer} first     First page number
     * @arg {Integer} last      Last page number
     * @arg {Callback} callbackFunction Function to recive callback
     * @access public
     * @returns {Callback}
     */
    getCoursesPages(dataQuery, first, last, callbackFunction) {
        var $this = this,
            courses = [];
        
        let paginationSearch = function(page, count, courses){
                console.log('page: '+page+' - count: '+count);
                if(count > 0 && page < last)
                    paginationRequestContent(dataQuery, (page+1), courses);
                else callbackFunction(false, courses);
            },
            /* Call recursively to request the pages */
            paginationRequestContent = function(dataQuery, page, courses) {
                Request($this._getQueryUrl(dataQuery, page), function (error, response, body) {
                    if(response.statusCode == 200)
                        $this._parserPagination(page, body, courses, paginationSearch);
                    else callbackFunction(true, null);
                });
            };
        // Running the first pagination
        paginationRequestContent(dataQuery, first, courses);
    }
    
    /**
     * @method module:_SmmCourseSearch::getCoursesPages
     * Return callbackFunction(error, json) with a all query pages
     * @arg {Json} dataQuery    Json with query configs
     * @arg {Callback} callbackFunction Function to recive callback
     * @access public
     * @returns {Callback}
     */
    getInfinity(dataQuery, callbackFunction) {
        var $this = this,
            courses = [];
        
        let paginationSearch = function(page, count, courses){
                console.log('page: '+page+' - count: '+count);
                if(count > 0)
                    paginationRequestContent(dataQuery, (page+1), courses);
                else callbackFunction(false, courses);
            },
            /* Call recursively to request the pages */
            paginationRequestContent = function(dataQuery, page, courses) {
                Request($this._getQueryUrl(dataQuery, page), function (error, response, body) {
                    if(response.statusCode == 200)
                        $this._parserPagination(page, body, courses, paginationSearch);
                    else callbackFunction(true, null);
                });
            };
        // Running the first pagination
        paginationRequestContent(dataQuery, 1, courses);
    }
}

// Module this _SsmMakerProfile Class
var SmmCourseSearch = new _SmmCourseSearch();
module.exports = SmmCourseSearch;