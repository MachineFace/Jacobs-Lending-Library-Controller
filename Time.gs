/**
 * Class for dealing with time
 */
class TimeConverter
{
  constructor() {

  }

  /**
   * Format Timer to String
   * @param {number} days
   * @param {number} hrs
   * @param {number} mins
   * @param {number} secs
   * @returns {string} formattedString
   */
  FormatTimerToString (days, hrs, mins, secs) {
    hrs = hrs < 10 ? `0${hrs}` : hrs;
    mins = mins < 10 ? `0${mins}` : mins;
    secs = secs < 10 ? `0${secs}` : secs;
    const s = `${days} days, ${hrs}:${mins}:${secs}`;
    // console.info(`Date to String ---> ${s}`)
    return s;
  }

  /**
   * Timer String to Milliseconds
   * @param {string} timerString Format = `0 days & 0:34:18`
   * @returns {number} millis
   */
  TimerStringToMilliseconds ( timerString ) {
    try {
      // timerString = GetByHeader(SHEETS.Main, HEADERNAMES.daysCheckedOut, 3);
      let m = timerString.split(`days`);
      let n = m[1].split(`,`);
      let q = n[1].split(`:`);
      q.unshift(m[0]);
      const vals = [];
      q.forEach(val => vals.push(parseInt(val)));
      let value = (vals[0] * 8.64e+7) + (vals[1] * 3.6e+6) + (vals[2] * 60000) + (vals[3] * 1000);
      // console.warn(`Timer String to Milliseconds ---> ${value}`);
      return value;
    } catch(err) {
      console.error(`${err} : 'TimerStringToMilliseconds' has failed for some reason....`);
    }
  }

  /**
   * Date to Milliseconds
   * @param {date} date
   * @retruns {number} millis
   */
  DateToMilliseconds (date) {
    date = date instanceof Date ? date : new Date();
    try {
      const millis = date.getTime();
      // console.warn(`Date to Milliseconds ---> ${millis}`);
      return millis;
    } catch(err) {
      console.error(`${err} : 'DateToMilliseconds' has failed for some reason....`);
    }
  }

  /**
   * Milliseconds to Timer String
   * @param {number} millis
   * @returns {string} timerString
   */
  MillisecondsToTimerString (millis) {
    try {
      let timeDiff = Math.abs(millis / 1000); // Milliseconds to sec

      let secs = Math.floor(timeDiff % 60); // Calc seconds
      timeDiff = Math.floor(timeDiff / 60); // Difference seconds to minutes
      let secondsAsString = secs < 10 ? `0${secs}` : `${secs}`; // Pad with a zero

      let mins = timeDiff % 60; //Calc mins
      timeDiff = Math.floor(timeDiff / 60); // Difference mins to hrs
      let minutesAsString = mins < 10 ? `0${mins}` : mins; // Pad with a zero

      let hrs = timeDiff % 24; // Calc hrs
      timeDiff = Math.floor(timeDiff / 24); // Difference hrs to days
      let days = timeDiff;

      let formatted = this.FormatTimerToString(days, hrs, minutesAsString, secondsAsString);
      // console.info(`Millis to Timer String ---> ${formatted}`);
      return formatted;
    } catch(err) {
      console.error(`${err} : 'MillisecondsToTimerString' has failed for some reason....`);
    }
    
  };

  /**
   * Duration
   * @param {date} start
   * @param {date} end
   * @return {string} duration
   */
  Duration (start, end) {
    try {
      end = end instanceof Date ? end : console.error(`End Date is not a date...`);
      start = start instanceof Date ? start : console.error(`Start date is not a date....`);

      let timeDiff = Math.abs((end - start) / 1000); // Milliseconds to sec

      let secs = Math.floor(timeDiff % 60); // Calc seconds
      timeDiff = Math.floor(timeDiff / 60); // Difference seconds to minutes
      let secondsAsString = secs < 10 ? `0${secs}` : secs; // Pad with a zero

      let mins = timeDiff % 60; //Calc mins
      timeDiff = Math.floor(timeDiff / 60); // Difference mins to hrs
      let minutesAsString = mins < 10 ? `0${mins}` : mins; // Pad with a zero

      let hrs = timeDiff % 24; // Calc hrs
      timeDiff = Math.floor(timeDiff / 24); // Difference hrs to days
      let days = timeDiff;

      let formatted = this.FormatTimerToString(days, hrs, minutesAsString, secondsAsString);
      console.info(`Duration ---> ${formatted}`);
      return formatted;
    } catch (err) {
      console.error(`${err} : 'Duration' has failed for some reason....`);
    }
  };

  /**
   * Calculate the Return Date
   * @param {date} date
   * @return {date} returndate
   */
  ReturnDate (date) {
    date = date instanceof Date ? date : new Date();
    const returndate = new Date(this.DateToMilliseconds(date) + 1.21e+9);
    console.info(`Return Date ---> ${returndate}`);
    return returndate;
  }

  /**
   * Calculate the remaining time left before overdue
   * @param {date} checkedOutDate
   * @param {date} dueDate
   * @return {string} FormatTimerToString(days, hrs, minutesAsString, secondsAsString)
   */
  RemainingTime (dueDate) {
    try {
      dueDate = dueDate instanceof Date ? dueDate : new Date();
      let remaining = this.Duration(new Date(), dueDate);
      console.info(`Remaining ---> ${remaining}`);
      return remaining;
    } catch (err) {
      console.error(`${err} : Calculating remaining time has failed for some reason.`);
    }
  }

}


/**
 * Update the countdowns on all checked out headsets
 * @TRIGGERED
 */
const UpdateTimeToOverdue = () => {
  const t = new TimeConverter();
  let dueDates = GetColumnDataByHeader(SHEETS.Main, HEADERNAMES.dueDate);
  console.warn(`Checking and updating Overdue times....`)
  dueDates.forEach((dueDate, index) => {
    if(dueDate) {
      console.log(`Index: ${index + 2}, ${dueDate}`);
      let remainingTime = t.RemainingTime(dueDate);
      console.log(`REMAINING TIME ----> ${remainingTime}`);
      SetByHeader(SHEETS.Main, HEADERNAMES.remainingDays, index + 2, remainingTime);
    }
  });
  console.warn(`All countdowns updated.....`)
}


/**
 * Check for overdue headsets and email
 * @TRIGGERED hourly
 */
const CheckOverdueTimes = () => {
  const dates = GetColumnDataByHeader(SHEETS.Main, HEADERNAMES.dueDate);
  if(dates && dates.length > 0) {
    dates.forEach( async (date, index) => {
      let row = index + 2;
      if(date && date < new Date()) {
        await console.info(`OVERDUE ----> Row: ${row}, Date: ${date}.`);
        await SetByHeader(SHEETS.Main, HEADERNAMES.status, row, STATUS.overdue);
      } else if(date && date > new Date()) {
        await console.info(`Checked Out ----> Row: ${row}, Date: ${date}.`);
        await SetByHeader(SHEETS.Main, HEADERNAMES.status, row, STATUS.checkedOut);
      } else {
        await console.info(`Checked In ----> Row: ${row}.`);
        await SetByHeader(SHEETS.Main, HEADERNAMES.status, row, STATUS.checkedIn);
        await SetByHeader(SHEETS.Main, HEADERNAMES.dueDate, row, ``);
      }
    });
  }
}

/**
 * Check for overdue items and email
 * @TRIGGERED once a week
 */
const CheckOverdueTimesAndEmail = () => {
  const dates = GetColumnDataByHeader(SHEETS.Main, HEADERNAMES.dueDate);
  dates.forEach( (date, index) => {
    console.info(`Checking Date : ${date}`);
    if(date && date < new Date()) {
      let row = index + 2;
      console.info(`OVERDUE ----> Row: ${row}, Date: ${date}.`);
      SetByHeader(SHEETS.Main, HEADERNAMES.status, row, STATUS.overdue);
      let data = GetRowData(SHEETS.Main, row);
      try {
        new Emailer({
          trackingNumber : data.tracking,
          checkedOutDate : data.dateCheckedOut,
          returnedDate : data.dateReturned,
          dueDate : data.dueDate,  
          email : data.studentEmail,
          status : STATUS.overdue,
          name : data.name,
          remainingDays : data.remainingDays,
          designspecialist : data.checkedOutBy,
        })
      } catch(err) {
        console.error(`${err}, Whoops: Couldn't send an email for some reason...`);
      }
    }
  })
}



