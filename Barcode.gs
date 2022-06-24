/**
 * -----------------------------------------------------------------------------------------------------------------
 * For use with barcode scanner.
 * Searches for job number found in cell B2 of SearchByBarCode sheet and changes status to 'Checked In'
 */
const PickupByBarcode = () => {
  const writer = new WriteLogger();
  const number = OTHERSHEETS.Scanner.getRange(3,2).getValue();
  let progress = OTHERSHEETS.Scanner.getRange(4,2);
  progress.setValue(`Searching for Tracker ID #${number}.......`);
  if (number == null || number == "") {
    progress.setValue(`No Headset ID Number provided! Select the yellow cell, scan, then press enter to make sure the cell's value has been changed.`);
    return;
  }
  Object.values(SHEETS).forEach(sheet => {
    const textFinder = sheet.createTextFinder(number);
    const searchFind = textFinder.findNext();
    if (searchFind != null) {
      searchRow = searchFind.getRow();

      // change status to picked up
      SetByHeader(SHEETS.Main, HEADERNAMES.status, searchRow, STATUS.checkedIn);
      const date = new Date().toDateString();
      SetByHeader(SHEETS.Main, HEADERNAMES.dateReturned, searchRow, date);
      progress.setValue(`Headset ID #${number} marked as ${STATUS.checkedIn}. Row: ${searchRow}`);
      writer.Info(`Headset ID #${number} marked as ${STATUS.checkedIn}. Row: ${searchRow}`);

      let data = GetRowData(sheet, searchRow);

      try {
        new Emailer({
          trackingNumber : data.tracking,
          checkedOutDate : data.checkedOut,
          returnedDate : data.dateReturned, 
          email : data.studentEmail,
          status : data.status,
          name : data.name,
          designspecialist : data.checkedOutBy,
          designspecialistemail : `codyglen@berkeley.edu`,
          designspecialistemaillink : `<a href="mailto:codyglen@berkeley.edu">codyglen@berkeley.edu</a>`, 
        })
      } catch(err) {
        console.error(`${err}, Whoops: Couldn't send an email for some reason...`);
      }
      return;
    }
    else {
      progress.setValue('Headset ID not found. Try again.');
    }
  });
} 

/**
 * For use with barcode scanner.
 * Searches for job number found in cell B2 of SearchByBarCode sheet and changes status to 'Checked Out'
 */
const CheckOutByBarcode = () => {
  const writer = new WriteLogger();
  const number = OTHERSHEETS.Scanner.getRange(3,2).getValue();
  let progress = OTHERSHEETS.Scanner.getRange(4,2);
  progress.setValue(`Searching for Oculus Headset ID #${number}.......`);
  if (number == null || number == "") {
    progress.setValue(`No Headset ID Number provided! Select the yellow cell, scan, then press enter to make sure the cell's value has been changed.`);
    return;
  }
  Object.values(SHEETS).forEach(sheet => {
    const textFinder = sheet.createTextFinder(number);
    const searchFind = textFinder.findNext();
    if (searchFind != null) {
      searchRow = searchFind.getRow();
      
      // change status to checked out
      SetByHeader(SHEETS.Main, HEADERNAMES.status, searchRow, STATUS.checkedOut);
      const date = new Date().toDateString();
      SetByHeader(SHEETS.Main, HEADERNAMES.dateCheckedOut, searchRow, date);
      const count = GetByHeader(SHEETS.Main, HEADERNAMES.checkedOutCount, searchRow) ? GetByHeader(SHEETS.Main, HEADERNAMES.checkedOutCount, searchRow) : 0;
      SetByHeader(SHEETS.Main, HEADERNAMES.checkedOutCount, searchRow, count + 1)
      progress.setValue(`Headset ID #${number} marked as ${STATUS.checkedOut}. Row: ${searchRow}`);
      writer.Info(`Headset ID #${number} marked as ${STATUS.checkedOut}. Row: ${searchRow}`);

      const data = GetRowData(sheet, searchRow);

      try {
        new Emailer({
          trackingNumber : data.tracking,
          checkedOutDate : data.dateCheckedOut,
          returnedDate : data.dateReturned, 
          email : data.studentEmail,
          status : data.status,
          name : data.name,
          designspecialist : data.checkedOutBy,
          designspecialistemail : `codyglen@berkeley.edu`,
          designspecialistemaillink : `<a href="mailto:codyglen@berkeley.edu">codyglen@berkeley.edu</a>`, 
        })
        new RecordTaker({
          trackerNumber : data.tracking,
          date : data.dateCheckedOut,
          issuer : data.checkedOutBy,
          name : data.name,
          email : data.studentEmail,
          basket : data.basket,
          notes : data.notes,
        });
      } catch(err) {
        console.error(`${err}, Whoops: Couldn't send an email for some reason...`);
      }


      return;
    }
    else {
      progress.setValue('Headset ID not found. Try again.');
    }
  });
} 



/**
 * -----------------------------------------------------------------------------------------------------------------
 * Generate a Barcode from some Data
 * @param {number} number
 * @return {string} url
 */
class BarcodeGenerator {
  constructor({ number : number, }) {
    this.number = number ? number : Math.floor(Math.random() * 100000).toFixed();
    this.url;
    this.GenerateBarCode();
  }

  GenerateBarCode() {
    const root = 'http://bwipjs-api.metafloor.com/';
    const rootsec = 'https://bwipjs-api.metafloor.com/';
    const type = '?bcid=code128';
    const ts = '&text=';
    const scale = '&scale=0.75'
    const postfx = '&includetext';

    //let barcodeLoc = 'http://bwipjs-api.metafloor.com/?bcid=code128&text=1234567890&includetext';  //KNOWN WORKING LOCATION
    const barcodeLoc = root + type + ts + this.number + scale + postfx;

    const params = {
        "method" : "GET",
        "headers" : { "Authorization": "Basic ", "Content-Type" : "image/png" },
        "contentType" : "application/json",
        followRedirects : true,
        muteHttpExceptions : true
    };
    
    let barcode;

    let html = UrlFetchApp.fetch(barcodeLoc, params);
    // console.info("Response Code : " + html.getResponseCode());
    if (html.getResponseCode() == 200) {
      const target = DRIVEFOLDERS.barcodeTarget;
      barcode = target.createFile(Utilities.newBlob(html.getContent()).setName(this.MakeFilename(`Barcode`)));
    } 
    else console.error('Failed to GET Barcode');
    this.url = barcode?.getUrl()?.toString();
    let id = barcode?.getId()?.toString();
    console.info(`BARCODE CREATED ---> ${this.url}, ID: ${id}`);
    return barcode;
  }

  GenerateBarCodeWithOptions() {

    const root = 'http://bwipjs-api.metafloor.com/';
    const type = '?bcid=code128';
    const ts = '&text=';
    const scaleX = `&scaleX=6`
    const scaleY = '&scaleY=6';
    const postfx = '&includetext';

    const barcodeLoc = root + type + ts + this.number + scaleX + scaleY + postfx;

    const params = {
      "method" : "GET",
      "headers" : { "Authorization": "Basic ", "Content-Type" : "image/png" },
      "contentType" : "application/json",
      followRedirects : true,
      muteHttpExceptions : true,
    };
    
    let barcode;

    const res = UrlFetchApp.fetch(barcodeLoc, params);
    const responseCode = res.getResponseCode();
    // console.info(`Response Code : ${responseCode}, ${RESPONSECODES[responseCode]}`);
    if (responseCode == 200) {
      const target = DRIVEFOLDERS.barcodeTarget;
      barcode = target.createFile( Utilities.newBlob(res.getContent()).setName(this.MakeFilename(`Barcode-${this.number}`)) );
      barcode.setTrashed(true);
    } 
    else console.error('Failed to GET Barcode');
    console.info(`BARCODE CREATED ---> ${barcode?.getUrl()}`);
    return barcode;
  }

  MakeFilename (name) {
    return `${name}-${Utilities.formatDate(new Date(), "PST", "yyyyMMddHHmmss").toString()}`;
  }
  
}
const _testBarcode = () => console.info(new BarcodeGenerator({number : `012394871`}));




/**
 * -----------------------------------------------------------------------------------------------------------------
 * @NOTIMPLEMENTED
 * Make a new Barcode for a new row : TRIGGER
 * @param {number} row
 * @returns {null}
 */
const MakeNewBarcode = (row) => {
  try {
    const num = GetByHeader(SHEETS.Main, HEADERNAMES.tracking, row) ? GetByHeader(SHEETS.Main, HEADERNAMES.tracking, row) : 0;
    const b = new BarcodeGenerator({ number : num.toString() });
    const url = b.url.toString();
    SetByHeader(SHEETS.Main, HEADERNAMES.barcode, row, url);
  } catch(err) {
    console.error(`${err}, Whoops: Couldn't create a barcode for some reason...`);
  }
}















