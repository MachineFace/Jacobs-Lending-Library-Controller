

/**
 * ----------------------------------------------------------------------------------------------------------------
 * Trigger 1 - On Submission
 * Reserved word: onFormSubmit() cannot be used here because it's reserved for simple triggers.
 * @param {Event} e
 */
const onSubmission = async (e) => {
  console.warn(`VALUES ---> ${Object.entries(e.namedValues)}`);
  let lastRow = SHEETS.Main.getLastRow();

  // Loop through to get last row and set status to requested
  try {
    let searchRange = SHEETS.Main.getRange(2, 4, SHEETS.Main.getLastRow()).getValues(); //search timestamp rows for last row
    for (let i = 0; i < searchRange.length; i++) {
      if (searchRange[i][0].toString() == ``) {
        lastRow = i + 1;
        break;
      }
    }
  } catch (err) {
    console.error(`${err}: Couldn't set status to 'Received'.`);
  }

  // Parse variables
  const name = e.namedValues[HEADERNAMES.name] ? TitleCase(e.namedValues[HEADERNAMES.name][0]) : `Unknown Name`;
  SetByHeader(SHEETS.Main, HEADERNAMES.name, lastRow, name);
  const email = e.namedValues[HEADERNAMES.email] ? e.namedValues[HEADERNAMES.email][0] : `Unknown Email`;
  const sid = e.namedValues[HEADERNAMES.studentId] ? e.namedValues[HEADERNAMES.studentId][0] : `Unknown SID`;
  const timestamp = e.namedValues[HEADERNAMES.timestamp] ? e.namedValues[HEADERNAMES.timestamp][0] : ``;
  const basket = e.namedValues[HEADERNAMES.itemBasket] ? e.namedValues[HEADERNAMES.itemBasket][0] : [];
  
  // Set Requested Status
  const status = STATUS.requested;
  SetByHeader(SHEETS.Main, HEADERNAMES.status,  lastRow, status); 
  console.info(`Status set to 'Requested'.`);
  
  // Create Tracking Number
  const trackingNumber = MakeTrackingNumber();
  SetByHeader(SHEETS.Main, HEADERNAMES.tracking, lastRow, trackingNumber);

  // Issuer
  const issuer = `Staff`;
  SetByHeader(SHEETS.Main, HEADERNAMES.issuer, lastRow, issuer);

  // Notes
  const notes = `No notes yet...`;
  SetByHeader(SHEETS.Main, HEADERNAMES.notes, lastRow, notes);

  // Create Ticket
  let ticket;
  try {
    ticket = new Ticket({
      trackingNumber: trackingNumber,
      status: status,
      name: name,
      email: email,
      basket: basket,
      notes : notes,
    });
    ticket.CreateTicket();
  } catch (err) {
    console.error( `${err}, Whoops: Couldn't create a ticket for some reason...` );
  }
  try {
    if(ticket) {
      SetByHeader(SHEETS.Main, HEADERNAMES.ticket, lastRow, ticket.url);
      SetByHeader(SHEETS.Main, HEADERNAMES.barcode, lastRow, ticket.barcode.getUrl());
    } else throw new Error(`Ticket Missing...`);
  } catch (err) {
    console.error( `${err}, Whoops: Couldn't write the fucking ticket to the sheet for some reason...` );
  }

  // Make a record
  try {
    new RecordTaker({
      trackingNumber : trackingNumber,
      date : new Date().toDateString(),
      name : name,
      email : email,
      basket : basket,
      notes : notes,
    });
  } catch (err) {
    console.error(`${err}, Whoops: Couldn't write record for some reason...`);
  }
  
  // Ready to go:
  // try {
  //   new Emailer({
  //     trackingNumber : this.trackingNumber,
  //     checkedOutDate : now,
  //     dueDate : returnDate,  
  //     email : this.email,
  //     status : STATUS.checkedOut,
  //     name : this.name,
  //     remainingDays : this.remainingDays,
  //     designspecialist : this.issuer, 
  //   })
  // } catch(err) {
  //   console.error(`${err}, Whoops: Couldn't send an email for some reason...`);
  // }

};

/**
 * =======================================================================================================================================================================
 * =======================================================================================================================================================================
 */


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
  const t = new TimeConverter();
  const now = new Date();
  const trackingNumber = GetByHeader(SHEETS.Main, HEADERNAMES.tracking, thisRow);
  const status = GetByHeader(SHEETS.Main, HEADERNAMES.status, thisRow) ? GetByHeader(thisSheet, HEADERNAMES.status, thisRow) : STATUS.checkedIn;
  const issuer = GetByHeader(SHEETS.Main, HEADERNAMES.issuer, thisRow) ? GetByHeader(thisSheet, HEADERNAMES.issuer, thisRow) : `Cody`;
  const student = GetByHeader(SHEETS.Main, HEADERNAMES.name, thisRow) ? GetByHeader(thisSheet, HEADERNAMES.name, thisRow) : `Student Name`;
  const email = GetByHeader(SHEETS.Main, HEADERNAMES.studentEmail, thisRow) ? GetByHeader(thisSheet, HEADERNAMES.studentEmail, thisRow) : `Unknown Email`;
  const dateCheckedOut = GetByHeader(SHEETS.Main, HEADERNAMES.dateCheckedOut, thisRow) ? GetByHeader(thisSheet, HEADERNAMES.dateCheckedOut, thisRow) : now.toDateString();
  const returned = GetByHeader(SHEETS.Main, HEADERNAMES.dateReturned, thisRow) ? GetByHeader(thisSheet, HEADERNAMES.dateReturned, thisRow) : now.toDateString();
  const dueDate = GetByHeader(SHEETS.Main, HEADERNAMES.dueDate, thisRow) ? GetByHeader(thisSheet, HEADERNAMES.dueDate, thisRow) : new Date(new TimeConverter().ReturnDate(dateCheckedOut)).toDateString();
  const basket = GetByHeader(SHEETS.Main, HEADERNAMES.itemBasket, thisRow) ? GetByHeader(SHEETS.Main, HEADERNAMES.itemBasket, thisRow) : ``;
  const notes = GetByHeader(SHEETS.Main, HEADERNAMES.notes, thisRow) ? GetByHeader(SHEETS.Main, HEADERNAMES.notes, thisRow) : `No Notes`;
  const timestamp = GetByHeader(SHEETS.Main, HEADERNAMES.timestamp, thisRow) ? GetByHeader(SHEETS.Main, HEADERNAMES.timestamp, thisRow) : `No timestamp`;
  const affiliation = GetByHeader(SHEETS.Main, HEADERNAMES.affiliation, thisRow) ? GetByHeader(SHEETS.Main, HEADERNAMES.affiliation, thisRow) : `Unknown Affiliation`;
  const studentId = GetByHeader(SHEETS.Main, HEADERNAMES.studentId, thisRow) ? GetByHeader(SHEETS.Main, HEADERNAMES.studentId, thisRow) : `No ID number`;
  const remainingDays = t.Duration(dueDate, now);
  
  // Logic
  try {
    switch(status) {
      case STATUS.requested:
        writer.Warning(`Tracking Number ${trackingNumber} requested by user ${student} on ${timestamp}.`);
        break;
      case STATUS.checkedIn:
        writer.Warning(`Tracking Number ${trackingNumber} checked out by ${issuer} to ${student} on ${dateCheckedOut} has now been returned.`);
        SetByHeader(SHEETS.Main, HEADERNAMES.dateReturned, thisRow, now.toDateString());
        try {
          new InventoryManager({ basket: basket }).CheckInBasket();
        } catch (err) {
          console.error( `${err}, Whoops: Couldn't update our inventory for some reason...` );
        }
        new RecordTaker({
          trackingNumber: trackingNumber,
          date: dateCheckedOut,
          issuer: issuer,
          name: student,
          email: email,
          notes: notes,
          basket : basket,
        });
        PrintTurnaround(thisRow);
        break;
      case STATUS.checkedOut:
        writer.Warning(`Tracking Number ${trackingNumber} has been checked out by ${issuer} to ${student} on ${dateCheckedOut}`);
        SetByHeader(SHEETS.Main, HEADERNAMES.dateCheckedOut, thisRow, now.toDateString());
        SetByHeader(SHEETS.Main, HEADERNAMES.dateReturned, thisRow, ``);
        SetByHeader(SHEETS.Main, HEADERNAMES.dueDate, thisRow, dueDate);
        SetByHeader(SHEETS.Main, HEADERNAMES.remainingDays, thisRow, remainingDays);
        try {
          new InventoryManager({ basket: basket }).CheckOutBasket();
        } catch (err) {
          console.error( `${err}, Whoops: Couldn't update our inventory for some reason...` );
        }
        new RecordTaker({
          trackingNumber: trackingNumber,
          date: dateCheckedOut,
          issuer: issuer,
          name: student,
          email: email,
          notes: notes,
          basket: basket,
        });
        break;
    }
  } catch(err) {
    console.error(`${err}, Whoops: Couldn't set variables for some reason...`);
  }   

}






