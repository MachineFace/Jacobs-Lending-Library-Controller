/**
 * -----------------------------------------------------------------------------------------------------------------
 * Class For Logging
 */
class WriteLogger 
{
  constructor() { 
    this.date = new Date().toDateString();
    this.sheet = OTHERSHEETS.Logger;
    this.row = OTHERSHEETS.Logger.getLastRow() + 1;
    this.sheetLength = OTHERSHEETS.Logger.getMaxRows();
  }
  Error(message) {
    const text = [this.date, "ERROR!", message, ];
    this.sheet.appendRow(text);
    console.error(`${text[0]}, ${text[1]} : ${message}`);
    this._PopItem();
    this._CleanupSheet();
  }
  Warning(message) {
    const text = [this.date, "WARNING!", message, ];
    this.sheet.appendRow(text);
    console.warn(`${text[0]}, ${text[1]} : ${message}`);
    this._PopItem();
    this._CleanupSheet();
  }
  Info(message) {
    const text = [this.date, "INFO!", message, ];
    this.sheet.appendRow(text);
    console.info(`${text[0]}, ${text[1]} : ${message}`);
    this._PopItem();
    this._CleanupSheet();
  }
  Debug(message) {
    const text = [this.date, "DEBUG", message, ];
    this.sheet.appendRow(text);
    console.log(`${text[0]}, ${text[1]} : ${message}`);
    this._PopItem();
    this._CleanupSheet();
  }
  _PopItem() {
    if(this.row > 100) {
      this.sheet.deleteRows(2, 1);
    } else {
      this.sheet.insertRowAfter(this.sheetLength - 1);
    }
  }
  _CleanupSheet() {
    if(this.row > 2000) {
      this.sheet.deleteRows(2, 1999);
    } else return;
  }
  
}

/**
 * -----------------------------------------------------------------------------------------------------------------
 * Testing for Logger Class
 */
const _testWriteLog = () => {
  const write = new WriteLogger();
  console.time(`EXECUTION TIMER`);
  for (let i = 0; i < 5; i++) {
    write.Warning(`Ooopsies ----> Warning`);
    write.Info(`Some Info`);
    write.Error(`ERROR`);
    write.Debug(`Debugging`);
    write._CleanupSheet();
  }
  console.timeEnd(`EXECUTION TIMER`);
}



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
    serial,
    notes,
  }) { 
    this.trackerNumber = trackerNumber ? trackerNumber : `1000001`;
    this.date = date ? date : new Date().toDateString();
    this.issuer = issuer ? issuer : `Cody`;
    this.name = name ? name : `Unknown Name`;
    this.email = email ? email : `Unknown Email`;
    this.serial = serial ? serial : `Unknown Serial Number`;
    this.notes = notes ? notes : `No Notes`;

    this.WriteRecord();
  }
  WriteRecord() {
    const text = [ this.trackerNumber, this.date, this.issuer, this.name, this.email, this.serial, this.notes, ];
    OTHERSHEETS.Record.appendRow(text);
    console.warn(`${this.trackerNumber} has been checked Out on ${this.date} by ${this.name}`);
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
      issuer : GetByHeader(SHEETS.Main, HEADERNAMES.checkedOutBy, i + 5),
      name : GetByHeader(SHEETS.Main, HEADERNAMES.name, i + 5),
      email : GetByHeader(SHEETS.Main, HEADERNAMES.studentEmail, i + 5),
      serial : GetByHeader(SHEETS.Main, HEADERNAMES.serialNumber, i + 5),
      notes : GetByHeader(SHEETS.Main, HEADERNAMES.notes, i + 5),
    });
  }
  console.timeEnd(`EXECUTION TIMER`);
}





