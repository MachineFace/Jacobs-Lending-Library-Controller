/**
 * Class for Assigning a User to a Basket
 * @param {string} issuer (Staff Member Name)
 * @param {string} name
 * @param {string} email
 * @param {number} sid
 * @param {object} basket
 * @param {string} notes
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
      const now = new Date();
      const returnDate = new Date(TimeService.ReturnDate(now));
      const remainingDays = TimeService.Duration(returnDate, now);
      console.info(`Assigning Basket to: ${this.name}`);
      this.trackingNumber = IDService.createId();
      
      // Date Checked Out	Date Returned	Ticket	Barcode	Notes	Due Date	Days Remaining Until Overdue
      const rowData = {
        tracking : this.trackingNumber, 
        status : STATUS.checkedOut, 
        issuer : this.issuer, 
        timestamp : now, 
        studentEmail : this.email, 
        name : this.name, 
        studentId : this.sid, 
        affiliation : AFFILLIATION.researcher, 
        itemBasket : JSON.stringify(this.basket), 
        dateCheckedOut : now.toDateString(), 
        dateReturned : ``, 
        notes : this.notes, 
        dueDate : returnDate, 
        remainingDays : remainingDays,
      }
      SheetService.SetRowData(SHEETS.Main, this.row, rowData);	

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
      });
      const ticket = newTicket.CreateTicket();
      SheetService.SetByHeader(SHEETS.Main, HEADERNAMES.ticket, this.row, ticket.getUrl());
      SheetService.SetByHeader(SHEETS.Main, HEADERNAMES.barcode, this.row, newTicket.barcode.getUrl());
      
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


/**
 * Modify Order
 */
const ModifyOrder = (rowData) => {
  try {
    const thisRow = rowData?.row;
    const now = new Date();
    const returnDate = new Date(TimeService.ReturnDate(now));
    const remainingDays = TimeService.Duration(returnDate, now);
    console.info(`Modifying Basket for: ${rowData.name}`);
    const trackingNumber = rowData.trackingNumber ? rowData.trackingNumber : Number.parseInt(100 + thisRow + 1);
    
    const rowData = {
      tracking : trackingNumber, 
      status : STATUS.checkedOut, 
      issuer : `Staff`, 
      timestamp : now, 
      studentEmail : this.email, 
      name : this.name, 
      studentId : this.sid, 
      affiliation : AFFILLIATION.researcher, 
      itemBasket : JSON.stringify(this.basket), 
      dateCheckedOut : now.toDateString(), 
      dateReturned : ``, 
      notes : this.notes, 
      dueDate : returnDate, 
      remainingDays : remainingDays,
    }
    SheetService.SetRowData(SHEETS.Main, this.row, rowData);	

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
    SheetService.SetByHeader(SHEETS.Main, HEADERNAMES.ticket, this.row, ticket.url);
    SheetService.SetByHeader(SHEETS.Main, HEADERNAMES.barcode, this.row, ticket.barcode.getUrl())

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


