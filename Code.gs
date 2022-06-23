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

  // Parse for assignment
  const assigner = new AssignUserToHeadset({ row : thisRow });
  if(thisSheet.getSheetName() == SHEETS.Submissions.getSheetName()) {
    assigner.Assign();
  }

  // Skip the first 2 rows of data. and all columns 
  if (thisRow <= 1) return;
  if (thisCol != 2) return;
  Object.values(OTHERSHEETS).forEach(sheet => {
    if(thisSheet == sheet) return;
  });



  // Get values OR defaults if it fucks up
  const now = new Date();
  const headsetID = GetByHeader(thisSheet, HEADERNAMES.tracking, thisRow) ? GetByHeader(thisSheet, HEADERNAMES.tracking, thisRow) : `1000001`;
  const status = GetByHeader(thisSheet, HEADERNAMES.status, thisRow) ? GetByHeader(thisSheet, HEADERNAMES.status, thisRow) : STATUS.checkedIn;
  const issuer = GetByHeader(thisSheet, HEADERNAMES.checkedOutBy, thisRow) ? GetByHeader(thisSheet, HEADERNAMES.checkedOutBy, thisRow) : `Cody`;
  const student = GetByHeader(thisSheet, HEADERNAMES.name, thisRow) ? GetByHeader(thisSheet, HEADERNAMES.name, thisRow) : `Student Name`;
  const email = GetByHeader(thisSheet, HEADERNAMES.studentEmail, thisRow) ? GetByHeader(thisSheet, HEADERNAMES.studentEmail, thisRow) : `Unknown Email`;
  const dateCheckedOut = GetByHeader(thisSheet, HEADERNAMES.dateCheckedOut, thisRow) ? GetByHeader(thisSheet, HEADERNAMES.dateCheckedOut, thisRow) : now.toDateString();
  const returned = GetByHeader(thisSheet, HEADERNAMES.dateReturned, thisRow) ? GetByHeader(thisSheet, HEADERNAMES.dateReturned, thisRow) : now.toDateString();
  const dueDate = GetByHeader(thisSheet, HEADERNAMES.dueDate, thisRow) ? GetByHeader(thisSheet, HEADERNAMES.dueDate, thisRow) : new Date(new TimeConverter().ReturnDate(dateCheckedOut)).toDateString();
  const serial = GetByHeader(SHEETS.Main, HEADERNAMES.serialNumber, thisRow) ? GetByHeader(SHEETS.Main, HEADERNAMES.serialNumber, thisRow) : `Unknown Serial Number`;
  const notes = GetByHeader(SHEETS.Main, HEADERNAMES.notes, thisRow) ? GetByHeader(SHEETS.Main, HEADERNAMES.notes, thisRow) : `No Notes`;

  const dsInfo = DSInfo(issuer);

  // Create a barcode
  if(headsetID && thisRow > 41) MakeNewBarcode(thisRow);

  // Logic
  try {
    switch(status) {
      case STATUS.checkedOut:
        writer.Warning(`Headset ${headsetID} checked out by ${issuer} to ${student} on ${now}`);
        SetByHeader(thisSheet, HEADERNAMES.dateCheckedOut, thisRow, now.toDateString());
        let count = GetByHeader(thisSheet, HEADERNAMES.checkedOutCount, thisRow) ? GetByHeader(thisSheet, HEADERNAMES.checkedOutCount, thisRow) : 0;
        SetByHeader(thisSheet, HEADERNAMES.checkedOutCount, thisRow, count + 1);
        new RecordTaker({
          trackerNumber : headsetID,
          date : dateCheckedOut,
          issuer : issuer,
          name : student,
          email : email,
          serial : serial,
          notes : notes,
        });
        PrintTurnaround(thisRow);
        const t = new TimeConverter();
        SetByHeader(SHEETS.Main, HEADERNAMES.dateReturned, thisRow, ``);
        let returnDate = t.ReturnDate(now);
        SetByHeader(SHEETS.Main, HEADERNAMES.dueDate, thisRow, returnDate);
        let remainingDays = t.Duration(returnDate, now);
        SetByHeader(SHEETS.Main, HEADERNAMES.remainingDays, thisRow, remainingDays);
        break;
      case STATUS.checkedIn:
        writer.Warning(`Headset ${headsetID} returned to ${issuer} by ${student} on ${now.toDateString()}`);
        SetByHeader(thisSheet, HEADERNAMES.dateReturned, thisRow, now.toDateString());
        SetByHeader(thisSheet, HEADERNAMES.dateCheckedOut, thisRow, ``);
        SetByHeader(SHEETS.Main, HEADERNAMES.dueDate, thisRow, ``);
        SetByHeader(SHEETS.Main, HEADERNAMES.remainingDays, thisRow, ``);
        break;
    }
  } catch(err) {
    console.error(`${err}, Whoops: Couldn't set variables for some reason...`);
  } 

  // Send Email
  try {
    new Emailer({
      headsetID : headsetID,
      checkedOutDate : dateCheckedOut,
      returnedDate : returned,
      dueDate :dueDate,  
      email : email,
      status : status,
      name : student,
      designspecialist : issuer,
      designspecialistemail : dsInfo.email,
      designspecialistemaillink : dsInfo.emailLink, 
    })
  } catch(err) {
    console.error(`${err}, Whoops: Couldn't send an email for some reason...`);
  }

  SetValidationBasedOnAvailability();
  

}






