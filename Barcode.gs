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
          serial : data.serialNumber,
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
 * Generate a QR code from some data. Feed it a url.
 * @param {string} url
 * @pararm {string} number
 * @return
 */
class QRCodeGenerator {
  constructor({ url : url, }) {
    this.url = url ? url : `jps.jacobshall.org/`;
    this.GenerateQRCode();
  }

  GenerateQRCode(){
    // console.info(`URL : ${this.url}`);
    const loc = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${this.url}`;  // API call
    const params = {
        "method" : "GET",
        "headers" : { "Authorization" : "Basic" },
        "contentType" : "application/json",
        followRedirects : true,
        muteHttpExceptions : true
    };

    let qrCode;
    const html = UrlFetchApp.fetch(loc, params);
    // console.info(`Response Code : ${html.getResponseCode()}`);
    if (html.getResponseCode() == 200) {
      const target = DRIVEFOLDERS.barcodeTarget;
      qrCode = target.createFile(Utilities.newBlob(html.getContent()).setName(this.MakeFilename(`QRCode`)))
    }
    else console.error('Failed to GET QRCode');

    console.info(`QRCode Created ---> ${qrCode?.getUrl()}`);
    return qrCode;
  }

  MakeFilename (name) {
    return `${name}-${Utilities.formatDate(new Date(), "PST", "yyyyMMddHHmmss").toString()}`;
  }
}
const _testQRGenerator = () => new QRCodeGenerator({url : `https://bcourses.berkeley.edu/courses/1353091/pages/woodshop` });

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
 * Generate a QR code from some data. Feed it a url.
 * https://goqr.me/api/doc/create-qr-code/
 * @param {string} url
 * @pararm {string} number
 * @return
 */
class OpenQRGenerator {
  constructor(
    { url : url,
      size : size,
    }) {
    this.url = url ? url : 'jps.jacobshall.org/';
    this.size = size ? size : `80x80`; // MAX: 1000x1000
  }

  async GenerateQRCode(){
    console.info(`URL : ${this.url}`);
    const loc = `https://api.qrserver.com/v1/create-qr-code/?size=${this.size}&data=${this.url}`;  //API call
    const postParams = {
      "method" : "GET",
      "headers" : { "Authorization" : "Basic" },
      "contentType" : "application/json",
      followRedirects : true,
      muteHttpExceptions : true
    };

    let qrCode;
    const html = UrlFetchApp.fetch(loc, postParams);
    // console.info(`Response Code : ${RESPONSECODES[html.getResponseCode()]}`);
    if (html.getResponseCode() == 200) {
      const target = DRIVEFOLDERS.barcodeTarget;
      qrCode = target.createFile(Utilities.newBlob(html.getContent()).setName(this.MakeFilename(`QRCode`)));
    }
    else console.error(`Failed to GET QRCode`);

    console.info(`QRCODE CREATED ---> ${qrCode?.getUrl()}`);
    return await qrCode;
  }

  async CreatePrintableDoc() {
    const folder = DRIVEFOLDERS.ticketTarget; // Ticket Folder
    const doc = DocumentApp.create(this.MakeFilename('QRCode')); // Make Document
    let body = doc.getBody();
    let docId = doc.getId();
    let url = doc.getUrl();

    const qr = new this.GenerateQRCode();

    // Append Document with Info
    if (doc != undefined || doc != null || doc != NaN) {
      let header = doc
        .addHeader()
        .appendTable([[`img1`]])
        .setAttributes({
          [DocumentApp.Attribute.BORDER_WIDTH]: 0,
          [DocumentApp.Attribute.BORDER_COLOR]: `#ffffff`,
        });
      this.ReplaceTextToImage(header, `img1`, qr);

      // Remove File from root and Add that file to a specific folder
      try {
        const docFile = DriveApp.getFileById(docId);
        DriveApp.removeFile(docFile);
        folder.next().addFile(docFile);
        folder.next().addFile(barcode);
      } catch (err) {
        console.error(`Whoops : ${err}`);
      }


      // Set permissions to 'anyone can edit' for that file
      let file = DriveApp.getFileById(docId);
      file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.EDIT); //set sharing
    }
    //Return Document to use later
    console.info(`QRCODE DOC CREATED ---> ${doc?.getUrl()}`);
    return doc;
  };

  MakeFilename (name) {
    return `${name}-${Utilities.formatDate(new Date(), "PST", "yyyyMMddHHmmss").toString()}`;
  }

}
const _testOpenQRGenerator = () => {
  const data = {url : `https://bcourses.berkeley.edu/courses/1353091/pages/woodshop`, size : `1000x1000`};
  const doc = new OpenQRGenerator(data).CreatePrintableDoc();
  console.info(doc);
}




/**
 * -----------------------------------------------------------------------------------------------------------------
 * Method for Creating Initial Barcodes in Bulk
 * @NOTIMPLEMENTED
 */
/*
const BULKMakeBarcodes = () => {
  for(let i = 2; i < 42; i++) {
    // const number = (1000000 + i - 1).toString();
    // SetByHeader(SHEETS.Main, HEADERNAMES.tracking, i, number);
    // console.warn(`Number : ${number}`);
    const num = GetByHeader(SHEETS.Main, HEADERNAMES.tracking, i);
    const b = new BarcodeGenerator({ number : num.toString() });
    const url = b.url.toString();
    SetByHeader(SHEETS.Main, HEADERNAMES.barcode, i, url);
  }
}
*/


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















