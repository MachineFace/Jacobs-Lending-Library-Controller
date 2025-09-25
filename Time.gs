


/**
 * Update the countdowns on all checked out headsets
 * @TRIGGERED
 */
const UpdateTimeToOverdue = () => {
  let dueDates = SheetService.GetColumnDataByHeader(SHEETS.Main, HEADERNAMES.dueDate);
  console.warn(`Checking and updating Overdue times....`)
  dueDates.forEach((dueDate, index) => {
    if(dueDate) {
      console.log(`Index: ${index + 2}, ${dueDate}`);
      let remainingTime = TimeService.RemainingTime(dueDate);
      console.log(`REMAINING TIME ----> ${remainingTime}`);
      SheetService.SetByHeader(SHEETS.Main, HEADERNAMES.remainingDays, index + 2, remainingTime);
    }
  });
  console.warn(`All countdowns updated.....`)
}


/**
 * Check for overdue headsets and email
 * @TRIGGERED hourly
 */
const CheckOverdueTimes = () => {
  const dates = SheetService.GetColumnDataByHeader(SHEETS.Main, HEADERNAMES.dueDate);
  if(dates && dates.length > 0) {
    dates.forEach( async (date, index) => {
      let row = index + 2;
      if(date && date < new Date()) {
        await console.info(`OVERDUE ----> Row: ${row}, Date: ${date}.`);
        SheetService.SetByHeader(SHEETS.Main, HEADERNAMES.status, row, STATUS.overdue);
      } else if(date && date > new Date()) {
        await console.info(`Checked Out ----> Row: ${row}, Date: ${date}.`);
        SheetService.SetByHeader(SHEETS.Main, HEADERNAMES.status, row, STATUS.checkedOut);
      } else {
        await console.info(`Checked In ----> Row: ${row}.`);
        SheetService.SetByHeader(SHEETS.Main, HEADERNAMES.status, row, STATUS.checkedIn);
        SheetService.SetByHeader(SHEETS.Main, HEADERNAMES.dueDate, row, ``);
      }
    });
  }
}

/**
 * Check for overdue items and email
 * @TRIGGERED once a week
 */
const CheckOverdueTimesAndEmail = () => {
  const dates = SheetService.GetColumnDataByHeader(SHEETS.Main, HEADERNAMES.dueDate);
  dates.forEach( (date, index) => {
    console.info(`Checking Date : ${date}`);
    if(date && date < new Date()) {
      let row = index + 2;
      console.info(`OVERDUE ----> Row: ${row}, Date: ${date}.`);
      SheetService.SetByHeader(SHEETS.Main, HEADERNAMES.status, row, STATUS.overdue);
      let data = SheetService.GetRowData(SHEETS.Main, row);
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



