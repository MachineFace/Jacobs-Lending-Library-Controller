


/**
 * -----------------------------------------------------------------------------------------------------------------
 * Class For Logging to a record taker
 */
class RecordTaker
{
  constructor({
    trackerNumber,
    date,
    issuer,
    name,
    email,
    basket,
    notes,
  }) { 
    this.trackerNumber = trackerNumber ? trackerNumber : `1000001`;
    this.date = date ? date : new Date().toDateString();
    this.issuer = issuer ? issuer : `Cody`;
    this.name = name ? name : `Unknown Name`;
    this.email = email ? email : `Unknown Email`;
    this.basket = basket ? basket : `Unknown Basket`;
    this.notes = notes ? notes : `No Notes`;

    this.WriteRecord();
  }
  WriteRecord() {
    const text = [ this.trackerNumber, this.date, this.issuer, this.name, this.email, JSON.stringify(this.basket), this.notes, ];
    OTHERSHEETS.Record.appendRow(text);
    // console.warn(`${this.trackerNumber} has been checked Out on ${this.date} by ${this.name}`);
  }
  
}

/**
 * -----------------------------------------------------------------------------------------------------------------
 * Testing for Logger Class
 */
const _testRecordTaker = async () => {
  console.time(`EXECUTION TIMER`);
  for (let i = 0; i < 5; i++) {
    await new RecordTaker({
      trackerNumber : GetByHeader(SHEETS.Main, HEADERNAMES.tracking, i + 5),
      date : GetByHeader(SHEETS.Main, HEADERNAMES.dateCheckedOut, i + 5),
      issuer : GetByHeader(SHEETS.Main, HEADERNAMES.issuer, i + 5),
      name : GetByHeader(SHEETS.Main, HEADERNAMES.name, i + 5),
      email : GetByHeader(SHEETS.Main, HEADERNAMES.studentEmail, i + 5),
      basket : GetByHeader(SHEETS.Main, HEADERNAMES.itemBasket, i + 5),
      notes : GetByHeader(SHEETS.Main, HEADERNAMES.notes, i + 5),
    });
  }
  console.timeEnd(`EXECUTION TIMER`);
}
