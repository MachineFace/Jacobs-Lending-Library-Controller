/**
 * Class for Assigning a User to a Headset
 */
class AssignUserABasket
{
  constructor({
    issuer,
    name,
    email,
    basket,
    notes,
  }) { 
    this.trackerNumber = 1000001;
    this.date = new Date().toDateString();
    this.row = SHEETS.Main.getLastRow() + 1;
    this.issuer = issuer ? issuer : `Cody`;
    this.name = name ? name : `Unknown Name`;
    this.email = email ? email : `Unknown Email`;
    this.basket = basket ? basket : `No Basket`;
    this.notes = notes ? notes : `No Notes...`
    this.Assign();
  }

  _MakeTrackingNumber () {
    const prevRow = SHEETS.Main.getLastRow();
    const prevTrackingNumber = Number.parseInt(GetByHeader(SHEETS.Main, HEADERNAMES.tracking, prevRow));
    return prevTrackingNumber + 1;
  }

  Assign() {
    const t = new TimeConverter();
    const now = new Date();
    const returnDate = new Date(t.ReturnDate(now));
    const remainingDays = t.Duration(returnDate, now);
    console.info(`Assigning Basket to: ${this.name}`);
    let trackingNumber = this._MakeTrackingNumber();
  try {
      // trackingNum,	status,	name,	email,	issuer,	date checked out,	date returned,	barcode, basket, notes,	checkoutcount,	due date,	countdown to overdue,																		
      SetByHeader(SHEETS.Main, HEADERNAMES.tracking, this.row, trackingNumber);
      SetByHeader(SHEETS.Main, HEADERNAMES.status, this.row, STATUS.checkedOut);
      SetByHeader(SHEETS.Main, HEADERNAMES.name, this.row, this.name);
      SetByHeader(SHEETS.Main, HEADERNAMES.studentEmail, this.row, this.email);
      SetByHeader(SHEETS.Main, HEADERNAMES.checkedOutBy, this.row, this.issuer);
      SetByHeader(SHEETS.Main, HEADERNAMES.dateCheckedOut, this.row, now.toDateString());
      SetByHeader(SHEETS.Main, HEADERNAMES.dateReturned, this.row, ``);
      SetByHeader(SHEETS.Main, HEADERNAMES.itemBasket, this.row, JSON.stringify(this.basket));
      SetByHeader(SHEETS.Main, HEADERNAMES.dueDate, this.row, returnDate.toDateString());
      SetByHeader(SHEETS.Main, HEADERNAMES.remainingDays, this.row, remainingDays);
      SetByHeader(SHEETS.Main, HEADERNAMES.notes, this.row, this.notes);
      MakeNewBarcode(this.row);
    } catch(err) {
      console.error(`${err}, Whoops: Couldn't write info to sheet for some reason...`);
    }
    try {
      new RecordTaker({
        trackerNumber : trackingNumber,
        date : now,
        issuer : this.issuer,
        name : this.name,
        email : this.email,
        notes : this.notes,
      });
      PrintTurnaround(this.row);
    } catch (err) {
      console.error(`${err}, Whoops: Couldn't write record for some reason...`);
    }
    // try {
    //   new Emailer({
    //     trackingNumber : assignment,
    //     checkedOutDate : now,
    //     dueDate : returnDate,  
    //     email : this.email,
    //     status : STATUS.checkedOut,
    //     name : this.name,
    //     designspecialist : this.issuer,
    //     designspecialistemail : DSInfo(this.issuer).email,
    //     designspecialistemaillink : DSInfo(this.issuer).emailLink, 
    //   })
    // } catch(err) {
    //   console.error(`${err}, Whoops: Couldn't send an email for some reason...`);
    // }
  }

  Unassign() {
    const headsetID = GetByHeader(SHEETS.Main, HEADERNAMES.tracking, this.row);
    SetByHeader(SHEETS.Main, HEADERNAMES.status, this.row, STATUS.checkedIn);
    SetByHeader(SHEETS.Main, HEADERNAMES.name, this.row, ``);
    SetByHeader(SHEETS.Main, HEADERNAMES.studentEmail, this.row, ``);
    SetByHeader(SHEETS.Main, HEADERNAMES.checkedOutBy, this.row, ``);
    SetByHeader(SHEETS.Main, HEADERNAMES.dateCheckedOut, this.row, ``);
    SetByHeader(SHEETS.Main, HEADERNAMES.dueDate, this.row, ``);
    SetByHeader(SHEETS.Main, HEADERNAMES.remainingDays, this.row, ``);
    SetByHeader(SHEETS.Main, HEADERNAMES.dateReturned, this.row, ``);
    try {
      new RecordTaker({
        trackerNumber : headsetID,
        date : new Date(),
        issuer : `Cody`,
        name : `Headset Unassigned`,
        email : `Headset Unassigned`,
      });
    } catch (err) {
      console.error(`${err}, Whoops: Couldn't write record for some reason...`);
    }
    // try {
    //   new Emailer({
    //     trackingNumber : headsetID,
    //     checkedOutDate : new Date(),
    //     dueDate : returnDate,  
    //     email : incomingEmail,
    //     status : STATUS.checkedOut,
    //     name : incomingName,
    //     designspecialist : `Cody`,
    //     designspecialistemail : DSInfo(`Cody`).email,
    //     designspecialistemaillink : DSInfo(`Cody`).emailLink, 
    //   })
    // } catch(err) {
    //   console.error(`${err}, Whoops: Couldn't send an email for some reason...`);
    // }
    console.warn(`Headset ID: ${headsetID} has been unassigned...`);
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





