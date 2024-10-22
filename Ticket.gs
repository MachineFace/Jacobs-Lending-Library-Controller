
/**
 * -----------------------------------------------------------------------------------------------------------------
 * Ticket Class
 */
class Ticket {
  constructor({
    trackingNumber : trackingNumber = IDService.createId(),
    status : status = STATUS.requested, 
    name : name = `Student Name`, 
    email : email = `Student Email`, 
    issuer : issuer = `Staff`,
    checkedOutDate : checkedOutDate = new Date().toDateString(), 
    basket : basket = [],
    notes : notes = `Notes`,
    dueDate : dueDate = new Date().toDateString(),
  }){
    // Tracking Number,	Checked Out / Returned,	Checked Out To,	Student Email,	Checked Out By,	Date Checked Out,	Date Returned,	Ticket,	Barcode,	Item Basket,	Notes,	Due Date,	Days Remaining Until Overdue,
    /** @private */
    this.trackingNumber = trackingNumber ? trackingNumber : IDService.createId();
    /** @private */
    this.status = status ? status : STATUS.requested;
    /** @private */
    this.name = name ? name : `Student Name`;
    /** @private */
    this.email = email ? email : `Unknown Email`;
    /** @private */
    this.issuer = issuer ? issuer : `Staff`;
    /** @private */
    this.checkedOutDate = checkedOutDate instanceof Date ? checkedOutDate.toDateString() : new Date().toDateString();
    /** @private */
    this.basket = basket;
    /** @private */
    this.notes = notes;
    /** @private */
    this.dueDate = dueDate instanceof Date ? dueDate.toDateString() : new Date().toDateString();
    /** @private */
    this.ticketName = `${SERVICE_NAME}-${this.trackingNumber}`;
    /** @private */
    this.barcode;
    this.url = ``;
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
  };

  /**
   * Create Ticket
   */
  CreateTicket() {
    const folder = DriveApp.getFolderById(DRIVEFOLDERS.ticketfolder); // Set the correct folder
    const doc = DocumentApp.create(this.ticketName); // Make Document
    let body = doc.getBody();
    let docId = doc.getId();
    
    const barcode = new BarcodeService({ number : this.trackingNumber.toString() }).Barcode;
    this.barcode = barcode;
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

    body.insertParagraph(2, "Email: " + this.email.toString())
      .setHeading(DocumentApp.ParagraphHeading.HEADING1)
      .setAttributes({
        [DocumentApp.Attribute.FONT_SIZE]: 13,
        [DocumentApp.Attribute.BOLD]: true,
        [DocumentApp.Attribute.LINE_SPACING]: 1,
      });
    body.insertParagraph(3, "Due Date: " + this.dueDate.toString())
      .setHeading(DocumentApp.ParagraphHeading.HEADING2)
      .setAttributes({
        [DocumentApp.Attribute.FONT_SIZE]: 13,
        [DocumentApp.Attribute.BOLD]: true,
        [DocumentApp.Attribute.LINE_SPACING]: 1,
      });

    // Create a two-dimensional array containing the cell contents.
    body.appendTable([
      ["Tracking Number:", this.trackingNumber.toString()],
      ["Date Checked Out", this.checkedOutDate.toString()],
      ["DUE DATE:", this.dueDate.toString()],
      ["Issuer:", this.issuer],
      ["Student Email:", this.email.toString()],
      ["Notes:", this.notes],
    ])
      .setAttributes({
        [DocumentApp.Attribute.FONT_SIZE]: 6,
        [DocumentApp.Attribute.LINE_SPACING]: 1,
        [DocumentApp.Attribute.BORDER_WIDTH]: 0.5,
      });

    const count = 1;
    const table = [];
    console.info(this.basket);
    [...this.basket]
      .forEach(item => table.push([`Quantity: ${count ? count : 1}`, `Item: ${item.toString()}`]));
    body.appendTable(table)
      .setAttributes({
        [DocumentApp.Attribute.FONT_SIZE]: 6,
        [DocumentApp.Attribute.LINE_SPACING]: 1,
        [DocumentApp.Attribute.BORDER_WIDTH]: 0.5,
      });      

    // Remove File from root and Add that file to a specific folder
    try {
      const docFile = DriveApp.getFileById(docId);
      docFile.moveTo(folder);
      barcode.moveTo(folder);
      // Set permissions to 'anyone can edit' for that file
      let file = DriveApp.getFileById(docId);
      file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.EDIT); //set sharing
    } catch (err) {
      console.error(`Whoops : ${err}`);
    }

    // Return Document to use later
    console.info(`DOC ----> ${doc?.getUrl()?.toString()}`)
    this.url = doc?.getUrl()?.toString();
    return doc;
  };
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
    
      const tick = await new Ticket({
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

