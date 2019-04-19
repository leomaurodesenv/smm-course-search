/* Includes */
const Typography = require("./Typography");

/**
 * @module _CoursesWrapper
 * This class read and interpreter the infos of couses wrapper boxes
 * 
 * @author Leonardo Mauro <leo.mauro.desenv@gmail.com> (http://leonardomauro.com/)
 * @link https://github.com/leomaurodesenv/smm-maker-profile GitHub
 * @license https://opensource.org/licenses/GPL-2.0 GNU Public License (GPL v2)
 * @copyright 2017 Leonardo Mauro
 * @package smm-maker-profile | smm-course-search
 * @access public
 */
class _CoursesWrapper {
    
    /**
     * @method module:_CoursesMetrics
     * Constructor of class
     * @var {Regex} _regex Regular expression of course box
     * @instance
     * @access public
     * @returns {this}
     */
    constructor() {
        this._regex = /(?:)course-card(?: |$)/;
        this._gameStyles = {
            sb:"marioBros",
            sb3:"marioBros3",
            sw:"marioWorld",
            sbu:"marioBrosU"
        };
    }
    
    /**
     * @method module:_CoursesMetrics::getCoursesId
     * Transform [nodes] in [coursesId]
     * @arg {Array} nodes Array of nodes ids
     * @access public
     * @returns {Array}
     */
    getCoursesId(nodes) {
        var courses = [];
        
        nodes.children.forEach((courseNode) => {
            let attrClass = courseNode.attribs.class,
                match = attrClass && attrClass.match(this._regex);
            if (!match) { return; }
            // Getting Id
            courseNode.children.forEach((node) => {
                let attrClassCourse = node.attribs.class;
                if (node.name === "div" && attrClassCourse.match(/^([ ]*)course-info([ ]*)/)) {
                    let courseDetail = node.children[3],
                        courseDetailLink = courseDetail.children[2],
                        courseId = courseDetailLink.attribs.href && courseDetailLink.attribs.href.match(/(?![/courses/]).*/);
                    courses.push(courseId[0]);
                }
            });
        });
        
        return courses;
    }
    
    /**
     * @method module:_CoursesMetrics::_getMaker
     * Transform [node] in [json{makerData}]
     * @arg {Array} makerNode Node with maker and miiverse data
     * @access private
     * @returns {Json}
     */
    _getMaker(makerNode) {
        var maker = {};
        
        var findMii = function(node, maker) {
            if (node.name === "div" && node.attribs.class.match(/^([ ]*)mii-wrapper([ ]*)/)) {
                let link = node.children[0].attribs.href,
                    nintendoId = link.replace("/profile/", "").replace("?type=posted", "");
                if (!nintendoId) { return maker; }
                maker.login = nintendoId;
                maker.faceImg = node.children[0].children[0].attribs.src;
                return maker;
            }
            let newMaker = maker;
            node.children.some((childNode) => {
                newMaker = findMii(childNode, newMaker);
                return newMaker;
            });
            return newMaker;
        };
        
        var findMaker = function(node, maker) {
            if (node.name === "div" && node.attribs.class.match(/^([ ]*)creator-info([ ]*)/)) {
                let flagNode = node.children[0],
                    nameNode = node.children[2];
                maker.flag = (flagNode && flagNode.attribs) ? 
                    flagNode.attribs.class.replace("flag ", "") : "undefined";
                maker.name = (nameNode) ? nameNode.text : "undefined";
                return maker;
            }
            let newMaker = maker;
            node.children.some((childNode) => {
                newMaker = findMaker(childNode, newMaker);
                if (newMaker.flag) {
                    return newMaker;
                }
            });
            return newMaker;
        };
        
        maker = findMii(makerNode, maker);
        maker = findMaker(makerNode, maker);
        
        return maker;
    }
    
    /**
     * @method module:_CoursesMetrics::_getCreatedAt
     * Transform [node] in [timestamp]
     * @arg {Array} node Node with created at data
     * @access private
     * @returns {String}
     */
    _getCreatedAt(node) {
        let timeInNode = node.text,
            match = timeInNode.match(/^([\d]+) ((mins.)|(hour|day)s?) ago$/);
        var created;
        if (match) {
            let milliSeconds = (match[2] === "mins.") ? (match[1] * 60000) : 
                (match[2] === "hour" || match[2] === "hours") ? (match[1] * 3600000) :
                (match[1] * 86400000);
            created = new Date(new Date().getTime() - milliSeconds);
        }
        else {
            created = new Date(timeInNode);
        }
        created.setUTCHours(created.getUTCHours() - 3);
        return created.toISOString();
    }
    
    /**
     * @method module:_CoursesMetrics::getCoursesDetails
     * Transform [nodes] in [courses Data]
     * @arg {Array} nodes Array of courses with all details
     * @access public
     * @returns {Array}
     */
    getCoursesDetails(nodes) {
        var courses = [];
        
        nodes.children.forEach((courseNode) => {
            let attrClass = courseNode.attribs.class,
                match = attrClass && attrClass.match(this._regex);
            if (!match) { return; }
            // Getting Details
            var courseDetail = {};
            courseNode.children.forEach((node) => {
                let attrClassCourse = node.attribs.class;
                if (node.name === "div" && attrClassCourse.match(/^([ ]*)course-header([ ]*)/)) {
                    courseDetail.difficulty = (node.text) ? node.text.toLowerCase() : undefined;
                    courseDetail.difficulty = (courseDetail.difficulty !== undefined && courseDetail.difficulty.match(/^([ ]*)(super)([ ]*)(expert)([ ]*)/)) ? "superExpert" : courseDetail.difficulty;
                    courseDetail.clearRate = (node.children[1]) ? Typography.getNumber(node.children[1]) : undefined;
                }
                else if (node.name === "div" && attrClassCourse.match(/^([ ]*)course-info([ ]*)/)) {
                    if (node.children[3] === undefined || node.children[3].children[2] === undefined
                        || node.children[3].children[2].attribs === undefined) { return; }
                    let courseImgWrapper = node.children[1],
                        courseImgFull = node.children[2],
                        courseDetailLink = node.children[3].children[2];
                    let courseId = courseDetailLink.attribs.href &&
                        courseDetailLink.attribs.href.match(/(?![/courses/]).*/);
                    courseDetail.title = node.children[0].children[0].text;
                    courseDetail.thumbnailImg = courseImgWrapper.children[0].children[0].attribs.src;
                    let gameStyle = courseImgWrapper.children[1].children[0].attribs.class
                                    && courseImgWrapper.children[1].children[0].attribs.class.match(/(?:^| )common_gs_([A-Za-z0-9]+)(?: |$)/);
                    courseDetail.gameStyle = this._gameStyles[gameStyle[1]];
                    courseDetail.createdAt = this._getCreatedAt(courseImgWrapper.children[1].children[1]);
                    let tag = courseImgWrapper.children[2].text.toLowerCase();
                    courseDetail.tag = (tag && tag !== "---") ? tag : "none";
                    let courseStats = courseImgWrapper.children[3];
                    courseDetail.stared = Typography.getNumber(courseStats.children[0]);
                    courseDetail.played = Typography.getNumber(courseStats.children[1]);
                    courseDetail.shared = Typography.getNumber(courseStats.children[2]);
                    let clearsAttempts = Typography.getClearsAttempts(courseImgWrapper.children[4]);
                    courseDetail.clears = clearsAttempts[0];
                    courseDetail.attempts = clearsAttempts[1];
                    courseDetail.img = courseImgFull.children[0].attribs.src;
                    courseDetail.maker = this._getMaker(node.children[3]);
                    courseDetail.id = courseId[0];
                }
            });
            courses.push(courseDetail);
        });
        
        return courses;
    }
}

// Module this _CoursesWrapper Class
var CoursesWrapper = new _CoursesWrapper();
module.exports = CoursesWrapper;