


/**
 * -----------------------------------------------------------------------------------------------------------------
 * Class For Logging to a record taker
 */
class RecordTaker {
  constructor({
    trackingNumber : trackingNumber = 1001,
    date : date = new Date().toDateString(),
    issuer : issuer = `Staff`,
    name : name = `Unknown Name`,
    email : email = `Unknown Email`,
    basket : basket = [],
    notes : notes = `No Notes`,
  }) { 
    /** @private */
    this.trackingNumber = trackingNumber;
    /** @private */
    this.date = date;
    /** @private */
    this.issuer = issuer;
    /** @private */
    this.name = name;
    /** @private */
    this.email = email;
    /** @private */
    this.basket = basket;
    /** @private */
    this.notes = notes;
    /** @private */
    this.WriteRecord();
  }

  /**
   * Write Record
   * @private
   */
  WriteRecord() {
    const text = [ this.trackingNumber, this.date, this.issuer, this.name, this.email, JSON.stringify(this.basket), this.notes, ];
    // console.warn(`${this.trackingNumber} has been checked Out on ${this.date} by ${this.name}`);
    OTHERSHEETS.Record.appendRow(text);
  }
  
}


