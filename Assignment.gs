/**
 * Class for Assigning a User to a Headset
 */
class AssignUserABasket
{
  constructor({
    issuer : issuer = `Cody`,
    name : name = `Unknown Name`,
    email : email = `Unknown Email`,
    basket : basket = [],
    notes : notes = `Note: Item was checked out in good quality.`,
  }) { 
    this.trackingNumber = 1000001;
    this.date = new Date().toDateString();
    this.row = SHEETS.Main.getLastRow() + 1;
    this.issuer = issuer ? issuer : `Cody`;
    this.name = name ? name : `Unknown Name`;
    this.email = email ? email : `Unknown Email`;
    this.basket = basket ? basket : `No Basket`;
    this.notes = notes ? notes : `Note: Item was checked out in good quality.`
    this.Assign();
  }

  _MakeTrackingNumber () {
    const prevRow = SHEETS.Main.getLastRow();
    const prevNum = GetByHeader(SHEETS.Main, HEADERNAMES.tracking, prevRow) ? GetByHeader(SHEETS.Main, HEADERNAMES.tracking, prevRow) : 1000001;
    const prevTrackingNumber = Number.parseInt(prevNum) + 1;
    return prevTrackingNumber;
  }

  Assign() {
    const t = new TimeConverter();
    const now = new Date();
    const returnDate = new Date(t.ReturnDate(now));
    const remainingDays = t.Duration(returnDate, now);
    console.info(`Assigning Basket to: ${this.name}`);
    this.trackingNumber = this._MakeTrackingNumber();
    const thisRow = SHEETS.Main.getLastRow() + 1;
    let ticket;
    try {
      // Date Checked Out	Date Returned	Ticket	Barcode	Notes	Due Date	Days Remaining Until Overdue		
      SetByHeader(SHEETS.Main, HEADERNAMES.tracking, thisRow, this.trackingNumber);
      SetByHeader(SHEETS.Main, HEADERNAMES.status, thisRow, STATUS.checkedOut);
      SetByHeader(SHEETS.Main, HEADERNAMES.issuer, thisRow, `Staff`);
      SetByHeader(SHEETS.Main, HEADERNAMES.timestamp, thisRow, now);
      SetByHeader(SHEETS.Main, HEADERNAMES.studentEmail, thisRow, this.email);
      SetByHeader(SHEETS.Main, HEADERNAMES.name, thisRow, this.name);
      SetByHeader(SHEETS.Main, HEADERNAMES.studentId, thisRow, ``);
      SetByHeader(SHEETS.Main, HEADERNAMES.affiliation, thisRow, AFFILLIATION.researcher);
      SetByHeader(SHEETS.Main, HEADERNAMES.itemBasket, thisRow, this.basket);
      SetByHeader(SHEETS.Main, HEADERNAMES.dateCheckedOut, thisRow, now.toDateString());
      SetByHeader(SHEETS.Main, HEADERNAMES.dateReturned, thisRow, ``);
      SetByHeader(SHEETS.Main, HEADERNAMES.dueDate, thisRow, returnDate);
      SetByHeader(SHEETS.Main, HEADERNAMES.notes, thisRow, this.notes);
      SetByHeader(SHEETS.Main, HEADERNAMES.remainingDays, thisRow, remainingDays);
    } catch(err) {
      console.error(`${err}, Whoops: Couldn't write info to sheet for some reason...`);
    }
    try {
      ticket = new Ticket({
        trackingNumber : this.trackingNumber,
        status : STATUS.checkedOut, 
        name : this.name, 
        email : this.email, 
        issuer : this.issuer,
        checkedOutDate : now, 
        basket : this.basket,
        notes : this.notes,
        dueDate : returnDate,
      });
      ticket.CreateTicket();
    } catch(err) {
      console.error(`${err}, Whoops: Couldn't create a ticket for some reason...`);
    }
    try {
      SetByHeader(SHEETS.Main, HEADERNAMES.ticket, this.row, ticket.url);
      SetByHeader(SHEETS.Main, HEADERNAMES.barcode, this.row, ticket.barcode.getUrl())
    } catch(err) {
      console.error(`${err}, Whoops: Couldn't write the fucking ticket to the sheet for some reason...`);
    }
    try {
      new InventoryManager({basket : this.basket}).CheckOutBasket();
    } catch(err) {
      console.error(`${err}, Whoops: Couldn't update our inventory for some reason...`);
    }
    try {
      new RecordTaker({
        trackingNumber : this.trackingNumber,
        date : now,
        issuer : this.issuer,
        name : this.name,
        email : this.email,
        basket : this.basket,
        notes : this.notes,
      });
      PrintTurnaround(this.row);
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
    //     remainingDays : remainingDays,
    //     designspecialist : this.issuer, 
    //   })
    // } catch(err) {
    //   console.error(`${err}, Whoops: Couldn't send an email for some reason...`);
    // }
  }

  Unassign() {
    const t = new TimeConverter();
    const returnDate = new Date();
    console.info(`Unassigning Basket from: ${this.name}`);
    try {
      new InventoryManager({basket : this.basket}).CheckInBasket();
    } catch(err) {
      console.error(`${err}, Whoops: Couldn't update our inventory for some reason...`);
    }
    try {
      new RecordTaker({
        trackingNumber : this.trackingNumber,
        date : now,
        issuer : this.issuer,
        name : this.name,
        email : this.email,
        basket : this.basket,
        notes : this.notes,
      });
      PrintTurnaround(this.row);
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
    //     remainingDays : remainingDays,
    //     designspecialist : this.issuer, 
    //   })
    // } catch(err) {
    //   console.error(`${err}, Whoops: Couldn't send an email for some reason...`);
    // }
  }
  
}


const _testAssign = () => {
  const a = new AssignUserABasket({
    issuer: `Cody`,
    name : `Testa Fiesta`,
    email : `testa@test.com`,
    basket : [`Tiny mitre saw/mitre box`,`Hot Glue Gun (+2 full glue sticks)`,`Breadboard`,`Sandpaper (one square each of 80, 220, 400)`,`Roomba`,`Scissors`,`Exacto (+3 new blades)`,]
  });
  let t = a._MakeTrackingNumber();
  console.info(t);
}



const ModifyOrder = (rowData) => {
  const thisRow = rowData?.row;
  const t = new TimeConverter();
  const now = new Date();
  const returnDate = new Date(t.ReturnDate(now));
  const remainingDays = t.Duration(returnDate, now);
  console.info(`Modifying Basket for: ${rowData.name}`);
  const trackingNumber = rowData.trackingNumber ? rowData.trackingNumber : Number.parseInt(100000 + thisRow + 1);
  let ticket;
  try {
    // Date Checked Out	Date Returned	Ticket	Barcode	Notes	Due Date	Days Remaining Until Overdue		
    SetByHeader(SHEETS.Main, HEADERNAMES.tracking, thisRow, trackingNumber);
    SetByHeader(SHEETS.Main, HEADERNAMES.status, thisRow, STATUS.checkedOut);
    SetByHeader(SHEETS.Main, HEADERNAMES.issuer, thisRow, `Staff`);
    SetByHeader(SHEETS.Main, HEADERNAMES.timestamp, thisRow, now);
    SetByHeader(SHEETS.Main, HEADERNAMES.studentEmail, thisRow, this.email);
    SetByHeader(SHEETS.Main, HEADERNAMES.name, thisRow, this.name);
    SetByHeader(SHEETS.Main, HEADERNAMES.studentId, thisRow, ``);
    SetByHeader(SHEETS.Main, HEADERNAMES.affiliation, thisRow, AFFILLIATION.researcher);
    SetByHeader(SHEETS.Main, HEADERNAMES.itemBasket, thisRow, this.basket);
    SetByHeader(SHEETS.Main, HEADERNAMES.dateCheckedOut, thisRow, now.toDateString());
    SetByHeader(SHEETS.Main, HEADERNAMES.dateReturned, thisRow, ``);
    SetByHeader(SHEETS.Main, HEADERNAMES.dueDate, thisRow, returnDate);
    SetByHeader(SHEETS.Main, HEADERNAMES.notes, thisRow, this.notes);
    SetByHeader(SHEETS.Main, HEADERNAMES.remainingDays, thisRow, remainingDays);
  } catch(err) {
    console.error(`${err}, Whoops: Couldn't write info to sheet for some reason...`);
  }
  try {
    ticket = new Ticket({
      trackingNumber : this.trackingNumber,
      status : STATUS.checkedOut, 
      name : this.name, 
      email : this.email, 
      issuer : this.issuer,
      checkedOutDate : now, 
      basket : this.basket,
      notes : this.notes,
      dueDate : returnDate,
    });
    ticket.CreateTicket();
  } catch(err) {
    console.error(`${err}, Whoops: Couldn't create a ticket for some reason...`);
  }
  try {
    SetByHeader(SHEETS.Main, HEADERNAMES.ticket, this.row, ticket.url);
    SetByHeader(SHEETS.Main, HEADERNAMES.barcode, this.row, ticket.barcode.getUrl())
  } catch(err) {
    console.error(`${err}, Whoops: Couldn't write the fucking ticket to the sheet for some reason...`);
  }
  try {
    new InventoryManager({basket : this.basket}).CheckOutBasket();
  } catch(err) {
    console.error(`${err}, Whoops: Couldn't update our inventory for some reason...`);
  }
  try {
    new RecordTaker({
      trackingNumber : this.trackingNumber,
      date : now,
      issuer : this.issuer,
      name : this.name,
      email : this.email,
      basket : this.basket,
      notes : this.notes,
    });
    PrintTurnaround(this.row);
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
  //     remainingDays : remainingDays,
  //     designspecialist : this.issuer, 
  //   })
  // } catch(err) {
  //   console.error(`${err}, Whoops: Couldn't send an email for some reason...`);
  // }
}


