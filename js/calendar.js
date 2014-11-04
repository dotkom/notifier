"use strict";

/**
 * Calendar
 * - calendar.getCalendarForToday(callback)
 *
 * @param callback-function to be called when parsed
 * @return todays lectures as an array
 * @author Michael McMillan <email@michaelmcmillan.net>
 */
var Calendar = {
  
  /* Attributes */
  url: 'http://ntnu.1024.no',
  username: 'michaelmcmillan', /* ligger i localStorage på //ntnu.1024.no */
  calendarHTML: null,
  semesters: ['var', 'host'],
  currentYear: new Date().getFullYear(),
  currentWeek: new Date().getWeekNumber(),
  currentDay: function () {
    weekday = ['søndag',  'mandag',
               'tirsdag', 'onsdag',
               'torsdag', 'fredag',
               'lørdag',  'søndag'];
    return weekday[new Date().getDay()];
  },
  currentSemester: function () {
    return this.semesters[0];
  },
  
  /**
   * isLectureToday
   * - Is lecture this current day,
   *   returns boolean
   */
  isLectureToday: function (lecture) {
    var that = this;
    return (lecture.day == that.currentDay());
  },
  
  /**
   * isLectureThisWeek
   * - Is lecture in this current week, 
   *   returns boolean
   */
  isLectureThisWeek: function (lecture) {
    var that = this;        
    var isCurrentWeekInRange = false; 
    
    // If one interval: 7-11
    if ((lecture.weeks.indexOf(', ') < 0) && (lecture.weeks.indexOf('-') > 0)) {
      
      weekOne = parseInt(lecture.weeks.split('-')[0]);
      weekTwo = parseInt(lecture.weeks.split('-')[1]);
      
      if (weekOne <= that.currentWeek && weekTwo >= that.currentWeek)
        isCurrentWeekInRange = true;
    }
    
    // If several intervals: 7-11, 13-14
    if (lecture.weeks.indexOf(', ') > 0) {
      
      // Iterate each interval
      intervals = lecture.weeks.split(', ');
      $.each(intervals, function (key, interval) {
        
        // If interval
        if (interval.indexOf('-') > 0) {
          weekOne = interval.split('-')[0];
          weekTwo = interval.split('-')[1];
          
          if (that.currentWeek >= weekOne && that.currentWeek <= weekTwo)
            isCurrentWeekInRange = true;
        }
        
        // If single week
        else {
          if (that.currentWeek == parseInt(interval))
            isCurrentWeekInRange = true;
        }
      });
    }
    
    // If one week: 7
    if (parseInt(lecture.weeks.length) == 1) {
      
      if (that.currentWeek == parseInt(lecture.weeks))
        isCurrentWeekInRange = true;
    }
    
    // Return findings
    return isCurrentWeekInRange;
  },
  
  /**
   * parseLecture
   * - Parses a single event, returns as object
   */
  parseLecture: function (lectureElement) {
    var that = this;

    var lecture = {
      course: $($(lectureElement)[0]).children()[0].innerHTML,
      day:    $($(lectureElement)[0]).children()[1].innerHTML,
      time:   $($(lectureElement)[0]).children()[2].innerHTML,
      room:   $($(lectureElement)[0]).children()[3].innerHTML,
      weeks:  $($(lectureElement)[0]).children()[7].innerHTML
    }
    
    // Collect lectures which are today 
    if (that.isLectureThisWeek(lecture) && that.isLectureToday(lecture))
      return lecture;
  },
        
  /**
   * parseCalendar
   * - Parses the calendar (html table)
   */
  parseCalendar: function (calendarElement) {
    var that = this;
    
    var lectures = [];      
    $.each($(calendarElement).children(), function (key, lectureElement) {
      if (that.parseLecture(lectureElement) != undefined)
        lectures.push(that.parseLecture(lectureElement));
    });
    
    return lectures;
  },
    
  /**
   * getCalendar
   * - Invokes parsing of the calendar
   */
  getCalendarForToday: function (callback) {
    var that = this;
    
    $.ajax({
      url: this.url               + '/' + 
           this.currentYear       + '/' + 
           this.currentSemester() + '/' +
           this.username          + '/' + 
               this.currentWeek,
      success: function (response) {
         callback(that.parseCalendar($('tbody', $(response))[3]));
      }, 
      dataType: 'HTML'
    });
  }
}
