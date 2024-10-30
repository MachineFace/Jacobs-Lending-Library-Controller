
/**
 * -----------------------------------------------------------------------------------------------------------------
 * Ticket Class
 */
class TicketService {
  constructor(){
    this.barcode = ``;
  }

  /**
   * Create Ticket
   */
  static async CreateTicket({
    trackingNumber : trackingNumber = IDService.createId(),
    status : status = STATUS.requested, 
    name : name = `Student Name`, 
    email : email = `Student Email`, 
    issuer : issuer = `Staff`,
    checkedOutDate : checkedOutDate = new Date().toDateString(), 
    basket : basket = [],
    notes : notes = `Notes`,
    dueDate : dueDate = new Date().toDateString(),
  }) {
    try {
      const ticketName = `${SERVICE_NAME}-${trackingNumber}`;
      const folder = DriveApp.getFolderById(DRIVEFOLDERS.ticketfolder); // Set the correct folder
      const doc = DocumentApp.create(ticketName); // Make Document
      let body = doc.getBody();
      let docId = doc.getId();
      
      const barcode = new BarcodeService({ number : trackingNumber.toString() }).Barcode;
      this.prototype.barcode = barcode;
      
      // Append Document with Info
      body
        .setPageWidth(PAGESIZES.custom.width)
        .setPageHeight(PAGESIZES.custom.height)
        .setMarginTop(2)
        .setMarginBottom(2)
        .setMarginLeft(2)
        .setMarginRight(2);

      body.insertImage(0, barcode)
        .setWidth(260)
        .setHeight(100);
      body.insertHorizontalRule(1);

      body.insertParagraph(2, `Email: ${email}`)
        .setHeading(DocumentApp.ParagraphHeading.HEADING1)
        .setAttributes({
          [DocumentApp.Attribute.FONT_SIZE]: 13,
          [DocumentApp.Attribute.BOLD]: true,
          [DocumentApp.Attribute.LINE_SPACING]: 1,
        });
      body.insertParagraph(3, "Due Date: " + dueDate.toString())
        .setHeading(DocumentApp.ParagraphHeading.HEADING2)
        .setAttributes({
          [DocumentApp.Attribute.FONT_SIZE]: 13,
          [DocumentApp.Attribute.BOLD]: true,
          [DocumentApp.Attribute.LINE_SPACING]: 1,
        });

      // Create a two-dimensional array containing the cell contents.
      body.appendTable([
        ["Tracking Number:", trackingNumber.toString()],
        ["Date Checked Out", checkedOutDate.toString()],
        ["DUE DATE:", dueDate.toString()],
        ["Issuer:", issuer],
        ["Student Email:", email.toString()],
        ["Notes:", notes],
      ])
        .setAttributes({
          [DocumentApp.Attribute.FONT_SIZE]: 6,
          [DocumentApp.Attribute.LINE_SPACING]: 1,
          [DocumentApp.Attribute.BORDER_WIDTH]: 0.5,
        });

      const count = 1;
      const table = [...basket.map(item => [`Quantity: ${count ? count : 1}`, `Item: ${item.toString()}`])];
      body.appendTable(table)
        .setAttributes({
          [DocumentApp.Attribute.FONT_SIZE]: 6,
          [DocumentApp.Attribute.LINE_SPACING]: 1,
          [DocumentApp.Attribute.BORDER_WIDTH]: 0.5,
        });      

      // Remove File from root and Add that file to a specific folder
    
      const docFile = DriveApp.getFileById(docId);
      docFile.moveTo(folder);
      barcode.moveTo(folder);
      // Set permissions to 'anyone can edit' for that file
      let file = DriveApp.getFileById(docId);
      file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.EDIT); //set sharing

      // Return Document to use later
      const url = doc?.getUrl()?.toString();
      console.info(`DOC ----> ${url}`)
      return doc;
    } catch (err) {
      console.error(`"CreateTicket()" failed: ${err}`);
      return 1;
    }
  }

  /**
   * Replace Text To Image
   * @private
   */
  _ReplaceTextToImage(body, searchText, image) {
    let next = body.findText(searchText);
    if (!next) return;
    let r = next.getElement();
    r.asText().setText("");
    let img = r.getParent().asParagraph().insertInlineImage(0, image);
    return next;
  }

}






/**
 * -----------------------------------------------------------------------------------------------------------------
 * Check and Fix Missing Tickets
 */
const FixMissingTickets = () => {
  console.info(`Checking Tickets....`);

  let ticketCells = SheetService.GetColumnDataByHeader(SHEETS.Main, HEADERNAMES.ticket);
  ticketCells.forEach( async (cell, index) => {
    if(!cell) {
      let thisRow = index + 2;
      console.warn(`Index : ${thisRow} is Missing a Ticket! Creating new Ticket....`);
      const rowData = SheetService.GetRowData(SHEETS.Main, thisRow);
      let { tracking, status, issuer, name, itemBasket, dateCheckedOut, ticket, notes, dueDate, } = rowData;
    
      const tick = await TicketService.CreateTicket({
        trackingNumber : tracking,
        status : status, 
        name : name, 
        email : email, 
        issuer : issuer,
        checkedOutDate : dateCheckedOut, 
        basket : itemBasket,
        notes : notes,
        dueDate : dueDate,
      });
      const url = tick.getUrl();
      SHEETS.Main.getRange(thisRow, 14).setValue(url.toString());
      console.warn(`Ticket Created....`);
    }
  });
  console.info(`Tickets Checked and Fixed....`);
  return 0;
}

