

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
  SheetService.SetByHeader(SHEETS.Main, HEADERNAMES.name, lastRow, name);
  const email = e.namedValues[HEADERNAMES.email] ? e.namedValues[HEADERNAMES.email][0] : `Unknown Email`;
  const sid = e.namedValues[HEADERNAMES.studentId] ? e.namedValues[HEADERNAMES.studentId][0] : `Unknown SID`;
  const timestamp = e.namedValues[HEADERNAMES.timestamp] ? e.namedValues[HEADERNAMES.timestamp][0] : ``;
  const basket = e.namedValues[HEADERNAMES.itemBasket] ? e.namedValues[HEADERNAMES.itemBasket][0] : [];
  
  // Set Requested Status
  const status = STATUS.requested;
  SheetService.SetByHeader(SHEETS.Main, HEADERNAMES.status,  lastRow, status); 
  console.info(`Status set to 'Requested'.`);
  
  // Create Tracking Number
  const trackingNumber = IDService.createId();
  SheetService.SetByHeader(SHEETS.Main, HEADERNAMES.tracking, lastRow, trackingNumber);

  // Issuer
  const issuer = `Staff`;
  SheetService.SetByHeader(SHEETS.Main, HEADERNAMES.issuer, lastRow, issuer);

  // Notes
  const notes = `No notes yet...`;
  SheetService.SetByHeader(SHEETS.Main, HEADERNAMES.notes, lastRow, notes);

  // Create Ticket
  let ticket;
  try {
    ticket = await TicketService.CreateTicket({
      trackingNumber: trackingNumber,
      status: status,
      name: name,
      email: email,
      basket: basket,
      notes : notes,
    });
  } catch (err) {
    console.error(`${err}, Whoops: Couldn't create a ticket for some reason...` );
  }
  try {
    if(!ticket) throw new Error(`Ticket Missing...`);
    SheetService.SetByHeader(SHEETS.Main, HEADERNAMES.ticket, lastRow, ticket.url);
    SheetService.SetByHeader(SHEETS.Main, HEADERNAMES.barcode, lastRow, ticket.barcode.getUrl());
  } catch (err) {
    console.error(`${err}, Whoops: Couldn't write the fucking ticket to the sheet for some reason...` );
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
  try {
    new Emailer({
      trackingNumber : this.trackingNumber,
      checkedOutDate : now,
      dueDate : returnDate,  
      email : this.email,
      status : STATUS.checkedOut,
      name : this.name,
      remainingDays : this.remainingDays,
      designspecialist : this.issuer, 
    })
  } catch(err) {
    console.error(`${err}, Whoops: Couldn't send an email for some reason...`);
  }

  SetConditionalFormatting();

}

/**
 * =======================================================================================================================================================================
 * =======================================================================================================================================================================
 */


/**
 * -----------------------------------------------------------------------------------------------------------------
 * Main OnEdit
 */
const onChange = async (e) => {
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


  const now = new Date();

  // Get values OR defaults if it fucks up
  let rowData = SheetService.GetRowData(SHEETS.Main, thisRow);
  console.info(rowData);
  let { tracking, status, issuer, timestamp, studentEmail, name, studentId, affiliation, itemBasket, dateCheckedOut, dateReturned, ticket, barcode, notes, dueDate, remainingDays, sheetName, row } = rowData;

  status = status ? status : STATUS.checkedIn;
  issuer = issuer ? issuer : `Cody`;
  timestamp = timestamp ? timestamp : `No timestamp`;
  name = name ? name : `Student Name`;
  studentEmail = studentEmail ? studentEmail : `Unknown Email`;
  studentId = studentId ? studentId : `No ID number`;
  affiliation = affiliation ? affiliation : `Unknown Affiliation`;
  itemBasket = itemBasket ? itemBasket : ``;
  dateCheckedOut = dateCheckedOut ? dateCheckedOut : now.toDateString();
  dateReturned = dateReturned ? dateReturned : now.toDateString();
  notes = notes ? notes : `No Notes`;
  dueDate = dueDate ? dueDate : new Date(TimeService.ReturnDate(dateCheckedOut)).toDateString();
  remainingDays = remainingDays ? remainingDays : TimeService.Duration(dueDate, now);
  
  // Logic
  try {
    switch(status) {
      case STATUS.requested:
        Log.Warning(`Tracking Number ${tracking} requested by user ${name} on ${timestamp}.`);
        break;
      case STATUS.checkedIn:
        Log.Warning(`Tracking Number ${tracking} checked out by ${issuer} to ${name} on ${dateCheckedOut} has now been returned.`);
        SheetService.SetByHeader(SHEETS.Main, HEADERNAMES.dateReturned, thisRow, now.toDateString());

        // Update Inventory
        new InventoryManager({ basket : itemBasket }).CheckInBasket();

        // Figure out Turnaround Time
        PrintTurnaround(thisRow);
        break;
      case STATUS.checkedOut:
        Log.Warning(`Tracking Number ${tracking} has been checked out by ${issuer} to ${name} on ${dateCheckedOut}`);
        SheetService.SetByHeader(SHEETS.Main, HEADERNAMES.dateCheckedOut, thisRow, now.toDateString());
        SheetService.SetByHeader(SHEETS.Main, HEADERNAMES.dateReturned, thisRow, ``);
        SheetService.SetByHeader(SHEETS.Main, HEADERNAMES.dueDate, thisRow, dueDate);
        SheetService.SetByHeader(SHEETS.Main, HEADERNAMES.remainingDays, thisRow, remainingDays);

        // Update Inventory
        new InventoryManager({ basket : itemBasket }).CheckOutBasket();
        break;
    }
    // Make Record
    new RecordTaker({
      trackingNumber : tracking,
      date : dateCheckedOut,
      issuer : issuer,
      name : name,
      email : studentEmail,
      notes : notes,
      basket : itemBasket,
    });
  } catch(err) {
    console.error(`${err}, Whoops: Couldn't set variables for some reason...`);
  }   

  SetConditionalFormatting();

}






