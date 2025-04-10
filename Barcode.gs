
/**
 * -----------------------------------------------------------------------------------------------------------------
 * Generate a Barcode from some Data
 * @param {number} UUID
 * @return {string} url
 */
class BarcodeService {
  constructor({ 
    uuid : uuid = IDService.createId(), 
  }) {
    this.uuid = uuid ? uuid : IDService.createId();
    this.url;
  }

  /**
   * Generate Barcode
   */
  get Barcode() {
    try {
      const root = 'http://bwipjs-api.metafloor.com/';
      const rootsec = 'https://bwipjs-api.metafloor.com/';
      const type = '?bcid=code128';
      const scale = '&scale=0.75'
      const postfx = '&includetext';
      const target = DriveApp.getFolderById(DRIVEFOLDERS.ticketfolder);

      const fixedUUID = IDService.isValid(this.uuid) ? this.uuid : IDService.createId();
      const convertedNumber = IDService.toDecimal(fixedUUID);  // Convert UUID to Decimal

      //let barcodeLoc = 'http://bwipjs-api.metafloor.com/?bcid=code128&text=1234567890&includetext';  //KNOWN WORKING LOCATION
      const url = root + type + `&text=` + convertedNumber + scale + postfx  + `&alttext=` + fixedUUID;

      const params = {
        'method' : "GET",
        'headers' : { 
          "Authorization": "Basic ", 
          "Content-Type" : "image/png" 
        },
        'contentType' : "application/json",
        'followRedirects' : true,
        'muteHttpExceptions' : true,
      }
    
      const response = UrlFetchApp.fetch(url, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200) throw new Error(`Bad Response from server : ${responseCode}, ${RESPONSECODES[responseCode]}`);

      const blob = Utilities.newBlob(response.getContent()).setName(this._MakeFilename(`Barcode`));
      const barcode = target.createFile(blob);

      this.url = barcode.getUrl().toString();
      const id = barcode.getId().toString();
      console.info(`BARCODE CREATED ---> ${this.url}, ID: ${id}`);
      return barcode;
    } catch(err) {
      console.error(`"GenerateBarCode()" failed : ${err}`);
      return 1;
    }

  }

  /**
   * Generate Barcode with Options
   * @return {blob} barcode
   */
  get BarcodeWithOptions() {
    try {
      const root = 'http://bwipjs-api.metafloor.com/';
      const type = '?bcid=code128';
      const ts = '&text=';
      const scaleX = `&scaleX=6`
      const scaleY = '&scaleY=6';
      const postfx = '&includetext';
      const target = DRIVEFOLDERS.barcodeTarget;

      const fixedUUID = IDService.isValid(this.uuid) ? this.uuid : IDService.createId();
      const convertedNumber = IDService.toDecimal(fixedUUID);  // Convert UUID to Decimal

      const url = root + type + ts + convertedNumber + scaleX + scaleY + postfx  + `&alttext=` + fixedUUID;

      const params = {
        'method' : "GET",
        'headers' : { 
          "Authorization": "Basic ", 
          "Content-Type" : "image/png" 
        },
        'contentType' : "application/json",
        'followRedirects' : true,
        'muteHttpExceptions' : true,
      }
    
      const response = UrlFetchApp.fetch(url, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200) throw new Error(`Bad Response from server : ${responseCode}, ${RESPONSECODES[responseCode]}`);

      const blob = Utilities.newBlob(response.getContent()).setName(this._MakeFilename(`Barcode-${this.uuid}`)) 
      const barcode = target.createFile(blob);

      barcode.setTrashed(true);
      console.info(`BARCODE CREATED ---> ${barcode?.getUrl()}`);
      return barcode;
    } catch(err) {
      console.error(`"GenerateBarcodeWithOptions()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Make Filename
   * @private
   */
  _MakeFilename(name) {
    return `${name}-${IDService.createId()}`;
  }
  
}



/**
 * -----------------------------------------------------------------------------------------------------------------
 * For use with barcode scanner.
 * Searches for job number found in cell B2 of SearchByBarCode sheet and changes status to 'Checked In'
 */
const ReturnByBarcode = () => {
  try {
    const number = OTHERSHEETS.Scanner.getRange(3,2).getValue();
    let progress = OTHERSHEETS.Scanner.getRange(4,2);
    progress.setValue(`Searching for Tracking ID #${number}.......`);
    if (number == null || number == "") {
      progress.setValue(`No Tracking ID Number provided! Select the yellow cell, scan, then press enter to make sure the cell's value has been changed.`);
      return;
    }

    const convertedNumber = IDService.decimalToUUID(number)
    const textFinder = SHEETS.Main.createTextFinder(convertedNumber);
    const searchFind = textFinder.findNext();
    if(!searchFind) progress.setValue('Tracking ID not found. Try again.');

    const date = new Date().toDateString();
    let searchRow = searchFind.getRow();
    if (searchRow <= 1) return;

    // change status to picked up
    // SheetService.SetByHeader(SHEETS.Main, HEADERNAMES.status, searchRow, STATUS.checkedIn);
    // SheetService.SetByHeader(SHEETS.Main, HEADERNAMES.dateReturned, searchRow, date);
    // progress.setValue(`Tracking ID #${number} marked as ${STATUS.checkedIn}. Row: ${searchRow}`);

    const data = SheetService.GetRowData(SHEETS.Main, searchRow);
    let { tracking, status, studentEmail, name, dateReturned, remainingDays, } = data;
    ShowReturnModal(data);

    new Emailer({
      trackingNumber : tracking,
      checkedOutDate : checkedOut,
      returnedDate : dateReturned, 
      email : studentEmail,
      status : status,
      name : name,
      remainingDays : remainingDays,
      designspecialist : checkedOutBy,
    })
    return 0;
  } catch(err) {
    console.error(`"ReturnByBarcode()" failed : ${err}`);
    return 1;
  }
} 




/**
 * -----------------------------------------------------------------------------------------------------------------
 * @NOTIMPLEMENTED
 * Make a new Barcode for a new row : TRIGGER
 * @param {number} row
 * @returns {null}
 */
const MakeNewBarcode = (row = 2) => {
  try {
    const b = new BarcodeService({ number : IDService.createId() });
    b.Barcode;
    const url = b.url
    console.info(url)
    // SheetService.SetByHeader(SHEETS.Main, HEADERNAMES.barcode, row, url);
    return 0;
  } catch(err) {
    console.error(`"MakeNewBarcode()" failed : ${err}`);
    return 1;
  }
}















