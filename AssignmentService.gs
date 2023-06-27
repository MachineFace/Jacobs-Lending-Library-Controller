/**
 * Class for Assigning a User to a Basket
 */
class AssignmentService {
  constructor({
    issuer : issuer = `Cody`,
    name : name = `Unknown Name`,
    email : email = `Unknown Email`,
    sid : sid = 10000001,
    basket : basket = [],
    notes : notes = `Note: Item was checked out in good quality.`,
  }) { 
    /** @private */
    this.trackingNumber = IDService.createId();
    /** @private */
    this.date = new Date().toDateString();
    /** @private */
    this.row = SHEETS.Main.getLastRow() + 1;
    /** @private */
    this.issuer = issuer;
    /** @private */
    this.name = name;
    /** @private */
    this.email = email;
    /** @private */
    this.sid = sid;
    /** @private */
    this.basket = basket ? basket : `No Basket`;
    /** @private */
    this.notes = notes;
  }

  /**
   * Assign
   */
  Assign() {
    try {
      const t = new TimeConverter();
      const now = new Date();
      const returnDate = new Date(t.ReturnDate(now));
      const remainingDays = t.Duration(returnDate, now);
      console.info(`Assigning Basket to: ${this.name}`);
      this.trackingNumber = IDService.createId();

      // Date Checked Out	Date Returned	Ticket	Barcode	Notes	Due Date	Days Remaining Until Overdue		
      SetByHeader(SHEETS.Main, HEADERNAMES.tracking, this.row, this.trackingNumber);
      SetByHeader(SHEETS.Main, HEADERNAMES.status, this.row, STATUS.checkedOut);
      SetByHeader(SHEETS.Main, HEADERNAMES.issuer, this.row, this.issuer);
      SetByHeader(SHEETS.Main, HEADERNAMES.timestamp, this.row, now);
      SetByHeader(SHEETS.Main, HEADERNAMES.studentEmail, this.row, this.email);
      SetByHeader(SHEETS.Main, HEADERNAMES.name, this.row, this.name);
      SetByHeader(SHEETS.Main, HEADERNAMES.studentId, this.row, this.sid);
      SetByHeader(SHEETS.Main, HEADERNAMES.affiliation, this.row, AFFILLIATION.researcher);
      SetByHeader(SHEETS.Main, HEADERNAMES.itemBasket, this.row, JSON.stringify(this.basket));
      SetByHeader(SHEETS.Main, HEADERNAMES.dateCheckedOut, this.row, now.toDateString());
      SetByHeader(SHEETS.Main, HEADERNAMES.dateReturned, this.row, ``);
      SetByHeader(SHEETS.Main, HEADERNAMES.dueDate, this.row, returnDate);
      SetByHeader(SHEETS.Main, HEADERNAMES.notes, this.row, this.notes);
      SetByHeader(SHEETS.Main, HEADERNAMES.remainingDays, this.row, remainingDays);

      // Create Ticket
      const newTicket = new Ticket({
        trackingNumber : this.trackingNumber,
        status : STATUS.checkedOut, 
        name : this.name, 
        email : this.email, 
        issuer : this.issuer,
        checkedOutDate : now, 
        basket : this.basket,
        notes : this.notes,
        dueDate : returnDate,
      })
      const ticket = newTicket.CreateTicket();
      SetByHeader(SHEETS.Main, HEADERNAMES.ticket, this.row, ticket.getUrl());
      SetByHeader(SHEETS.Main, HEADERNAMES.barcode, this.row, newTicket.barcode.getUrl());
      
      // Set Inventory
      new InventoryManager({ basket : this.basket, }).CheckOutBasket();

      // Record Interaction
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

      // Email
      new Emailer({
        trackingNumber : this.trackingNumber,
        checkedOutDate : now,
        dueDate : returnDate,  
        email : this.email,
        status : STATUS.checkedOut,
        name : this.name,
        remainingDays : remainingDays,
        designspecialist : this.issuer, 
      });
      return 0;
    } catch(err) {
      console.error(`"Assign()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Unassign
   */
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
}



const ModifyOrder = (rowData) => {
  try {
    const thisRow = rowData?.row;
    const t = new TimeConverter();
    const now = new Date();
    const returnDate = new Date(t.ReturnDate(now));
    const remainingDays = t.Duration(returnDate, now);
    console.info(`Modifying Basket for: ${rowData.name}`);
    const trackingNumber = rowData.trackingNumber ? rowData.trackingNumber : Number.parseInt(100 + thisRow + 1);
    
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

    // Create a ticket
    const ticket = new Ticket({
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
    if(!ticket) throw new Error(`Couldn't generate a ticket.`)
    SetByHeader(SHEETS.Main, HEADERNAMES.ticket, this.row, ticket.url);
    SetByHeader(SHEETS.Main, HEADERNAMES.barcode, this.row, ticket.barcode.getUrl())

    // Manage Inventory
    new InventoryManager({basket : this.basket}).CheckOutBasket();

    // Record the Interaction
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
    return 0;
  } catch(err) {
    console.error(`"ModifyOrder()" failed : ${err}`);
    return 1;
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


