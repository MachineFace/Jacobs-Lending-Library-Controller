/**
 * -----------------------------------------------------------------------------------------------------------------
 * Main OnSubmit
 */
const onSubmit = async (e) => {
  
}


/**
 * -----------------------------------------------------------------------------------------------------------------
 * Main OnEdit
 */
const onChange = async (e) => {
  const writer = new WriteLogger();
  var thisSheet = e.range.getSheet();
  console.info(`This Sheet : ${thisSheet.getSheetName()}`)

  // Fetch Columns and rows and check validity
  var thisCol = e.range.getColumn();
  var thisRow = e.range.getRow();

  // Skip the first 2 rows of data. and all columns 
  if (thisRow <= 1) return;
  if (thisCol != 2) return;
  Object.values(OTHERSHEETS).forEach(sheet => {
    if(thisSheet == sheet) return;
  });



  // Get values OR defaults if it fucks up
  const now = new Date();
  const trackingNum = GetByHeader(thisSheet, HEADERNAMES.tracking, thisRow);
  const status = GetByHeader(thisSheet, HEADERNAMES.status, thisRow) ? GetByHeader(thisSheet, HEADERNAMES.status, thisRow) : STATUS.checkedIn;
  const issuer = GetByHeader(thisSheet, HEADERNAMES.checkedOutBy, thisRow) ? GetByHeader(thisSheet, HEADERNAMES.checkedOutBy, thisRow) : `Cody`;
  const student = GetByHeader(thisSheet, HEADERNAMES.name, thisRow) ? GetByHeader(thisSheet, HEADERNAMES.name, thisRow) : `Student Name`;
  const email = GetByHeader(thisSheet, HEADERNAMES.studentEmail, thisRow) ? GetByHeader(thisSheet, HEADERNAMES.studentEmail, thisRow) : `Unknown Email`;
  const dateCheckedOut = GetByHeader(thisSheet, HEADERNAMES.dateCheckedOut, thisRow) ? GetByHeader(thisSheet, HEADERNAMES.dateCheckedOut, thisRow) : now.toDateString();
  const returned = GetByHeader(thisSheet, HEADERNAMES.dateReturned, thisRow) ? GetByHeader(thisSheet, HEADERNAMES.dateReturned, thisRow) : now.toDateString();
  const dueDate = GetByHeader(thisSheet, HEADERNAMES.dueDate, thisRow) ? GetByHeader(thisSheet, HEADERNAMES.dueDate, thisRow) : new Date(new TimeConverter().ReturnDate(dateCheckedOut)).toDateString();
  const basket = GetByHeader(SHEETS.Main, HEADERNAMES.itemBasket, thisRow) ? GetByHeader(SHEETS.Main, HEADERNAMES.itemBasket, thisRow) : ``;
  const notes = GetByHeader(SHEETS.Main, HEADERNAMES.notes, thisRow) ? GetByHeader(SHEETS.Main, HEADERNAMES.notes, thisRow) : `No Notes`;
  const timestamp = GetByHeader(SHEETS.Main, HEADERNAMES.timestamp, thisRow) ? GetByHeader(SHEETS.Main, HEADERNAMES.timestamp, thisRow) : `No timestamp`;
  const affiliation = GetByHeader(SHEETS.Main, HEADERNAMES.affiliation, thisRow) ? GetByHeader(SHEETS.Main, HEADERNAMES.affiliation, thisRow) : `Unknown Affiliation`;
  const studentId = GetByHeader(SHEETS.Main, HEADERNAMES.studentId, thisRow) ? GetByHeader(SHEETS.Main, HEADERNAMES.studentId, thisRow) : `No ID number`;
  
  
  // Logic
  try {
    switch(status) {
      case STATUS.checkedIn:
        writer.Warning(`Tracking Number ${trackingNum} checked out by ${issuer} to ${student} on ${dateCheckedOut} has now been returned.`);
        SetByHeader(thisSheet, HEADERNAMES.dateReturned, thisRow, now.toDateString());
        new RecordTaker({
          trackerNumber : trackingNum,
          date : dateCheckedOut,
          issuer : issuer,
          name : student,
          email : email,
          notes : notes,
        });
        PrintTurnaround(thisRow);
        break;
      case STATUS.checkedOut:
        writer.Warning(`Tracking Number ${trackingNum} has been checked out by ${issuer} to ${student} on ${dateCheckedOut}`);
        SetByHeader(thisSheet, HEADERNAMES.dateCheckedOut, thisRow, now.toDateString());
        SetByHeader(thisSheet, HEADERNAMES.dateReturned, thisRow, ``);
        SetByHeader(SHEETS.Main, HEADERNAMES.dueDate, thisRow, new Date(new TimeConverter().ReturnDate(dateCheckedOut)).toDateString());
        SetByHeader(SHEETS.Main, HEADERNAMES.remainingDays, thisRow, ``);
        break;
    }
  } catch(err) {
    console.error(`${err}, Whoops: Couldn't set variables for some reason...`);
  }   

}






