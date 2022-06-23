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
  }) { 
    this.trackerNumber = trackerNumber ? trackerNumber : `1000001`;
    this.date = date ? date : new Date().toDateString();
    this.issuer = issuer ? issuer : `Cody`;
    this.name = name ? name : `Unknown Name`;
    this.email = email ? email : `Unknown Email`;
    this.serial = serial ? serial : `Unknown Serial Number`;
    this.basket = basket ? basket : `No Basket`;

    this.Assign();
  }

  _MakeTrackingNumber () {
    const prevRow = SHEETS.Main.getLastRow();
    const prevTrackingNumber = Number.parseInt(GetByHeader(SHEETS.Main, HEADERNAMES.tracking, prevRow));
    return prevTrackingNumber + 1;
  }

  Assign() {
    // Parse for assignment
    const t = new TimeConverter();
    const now = new Date();
    console.info(`Assigning Basket to: ${this.name}`);
    let returnDate = new Date(t.ReturnDate(now));
    let remainingDays = t.Duration(returnDate, now);

    // Tracking,	status,	name,	email,	issuer,	date,	date returned,	barcode,	basket,	notes,	number of times checked out,	due date,	Days Remaining Until Overdue,				
    const text = [ this.trackerNumber, STATUS.checkedOut, this.name, this.email, this.issuer, this.date, ``, ``, this.basket, ``, ``, returnDate, remainingDays, ];
    SHEETS.Main.appendRow(text);
    MakeNewBarcode(this.row);

    // SetByHeader(SHEETS.Main, HEADERNAMES.status, this.row, STATUS.checkedOut);
    // SetByHeader(SHEETS.Main, HEADERNAMES.name, this.row, incomingName);
    // SetByHeader(SHEETS.Main, HEADERNAMES.studentEmail, this.row, incomingEmail);
    // SetByHeader(SHEETS.Main, HEADERNAMES.checkedOutBy, this.row, `Cody`);
    // SetByHeader(SHEETS.Main, HEADERNAMES.dateCheckedOut, this.row, now.toDateString());
    // let returnDate = new Date(t.ReturnDate(now));
    // SetByHeader(SHEETS.Main, HEADERNAMES.dueDate, this.row, returnDate.toDateString());
    // let count = GetByHeader(SHEETS.Main, HEADERNAMES.checkedOutCount, this.row);
    // SetByHeader(SHEETS.Main, HEADERNAMES.checkedOutCount, this.row, count + 1);
    // let remainingDays = t.Duration(returnDate, now);
    // SetByHeader(SHEETS.Main, HEADERNAMES.remainingDays, this.row, remainingDays);
    try {
      new RecordTaker({
        trackerNumber : assignment,
        date : now,
        issuer : `Cody`,
        name : incomingName,
        email : incomingEmail,
      });
      PrintTurnaround(this.row);
      SetByHeader(SHEETS.Main, HEADERNAMES.dateReturned, this.row, ``);
      SetByHeader(SHEETS.Main, HEADERNAMES.dueDate, this.row, returnDate.toDateString());
      SetByHeader(SHEETS.Main, HEADERNAMES.remainingDays, this.row, remainingDays);
    } catch (err) {
      console.error(`${err}, Whoops: Couldn't write record for some reason...`);
    }
    try {
      new Emailer({
        headsetID : assignment,
        checkedOutDate : now,
        dueDate : returnDate,  
        email : incomingEmail,
        status : STATUS.checkedOut,
        name : incomingName,
        designspecialist : `Cody`,
        designspecialistemail : DSInfo(`Cody`).email,
        designspecialistemaillink : DSInfo(`Cody`).emailLink, 
      })
    } catch(err) {
      console.error(`${err}, Whoops: Couldn't send an email for some reason...`);
    }
    console.warn(`User is being assigned ${assignment}`);
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
    //     headsetID : headsetID,
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
  const a = new AssignUserABasket({issuer: 
    name,
    email,
    basket,})
}





