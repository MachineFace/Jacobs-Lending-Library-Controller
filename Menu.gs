/**
 * -----------------------------------------------------------------------------------------------------------------
 * Menu Functions
 */


/**
 * Count Checked Out Popup
 */
const PopupCountCheckedOut = async () => {
  let ui = await SpreadsheetApp.getUi();
  let counts = CountStatuses();
  let checkedOut = 0;
  Object.entries(counts).forEach(([key, value], index) => {
    if(key == STATUS.checkedOut) checkedOut = value;
  });
  ui.alert(
    SERVICE_NAME, 
    `Currently Checked Out Baskets: ${checkedOut}`, 
    ui.ButtonSet.OK_CANCEL
  );
}

/**
 * Count Checked In
 */
const PopupCountCheckedIn = async () => {
  let ui = await SpreadsheetApp.getUi();
  let counts = CountStatuses();
  let checkedIn = 0;
  Object.entries(counts).forEach(([key, value], index) => {
    if(key == STATUS.checkedIn) checkedIn = value;
  });
  let prompt = ui.alert(
    SERVICE_NAME, 
    `Currently Checked In Baskets: ${checkedIn}`, 
    ui.ButtonSet.OK_CANCEL
  );
}

/**
 * Count Overdue
 */
const PopupCountOverdue = async () => {
  let ui = await SpreadsheetApp.getUi();
  let counts = CountStatuses();
  let overdue = 0;
  Object.entries(counts).forEach(([key, value], index) => {
    if(key == STATUS.overdue) overdue = value;
  });
  ui.alert(
    SERVICE_NAME, 
    `Currently Checked Out Baskets: ${overdue}`, 
    ui.ButtonSet.OK_CANCEL
  );
}

/**
 * Count Statuses
 */
const CountStatuses = () => {
  let count = {};
  GetColumnDataByHeader(SHEETS.Main, HEADERNAMES.status)
    .filter(Boolean)
    .forEach((keys) => count[keys] = ++count[keys] || 1);
  return count;
}

/**
 * Return by barcode
 */
const PopupReturnByBarcode = async () => {
  let ui = await SpreadsheetApp.getUi();
  let result = ui.prompt(
    SERVICE_NAME,
    'Please enter the Tracking ID Number:',
    ui.ButtonSet.OK_CANCEL
  );
  let button = result.getSelectedButton();
  let trackingNumber = result.getResponseText();
  if (button == ui.Button.OK) ui.alert(`Tracker Number is : ${trackingNumber}`);
  else if (button == ui.Button.CANCEL) ui.alert(`I didn't get your name.`);
  else if (button == ui.Button.CLOSE) ui.alert(`You closed the dialog.`);
}

/**
 * Builds HTML file for the modal pop-up from the help list.
 */
const BuildHTMLHELP = () => {
  let items = [
    `On the sidebar: Fill in the student name / email and assign yourself as the DS / SS.`,
    `Check any items the student will be checking out.`,
    `Add notes if needed.`,
    `Click: "Assign Basket To Student"`,
    `A new line will be added to the "Main" tab and the student will be emailed.`,
    `When the student returns the items, mark their tracking number as "Checked-In."`,
  ];
  let html = `<h2 style="text-align:center"><b> HELP MENU </b></h2>`;
  html += `<h3 style="font-family:Roboto">How to Use ${SERVICE_NAME} : </h3>`;
  html += `<hr>`;
  html += `<p>Note : All status changes trigger an email to the student. USE with CAUTION.</p>`;
  html += `<ol style="font-family:Roboto font-size:10">`;
  items.forEach(item =>  html += `<li>${item}</li>`);
  html += `</ol>`;
  html += `<p>See Cody or Nicole for additional help / protips.</p>`;

  console.info(html);
  return html;
};

/**
 * Help Menu
 */
const PopupHelp = () => {
  let ui = SpreadsheetApp.getUi();
  let title = `${SERVICE_NAME} HELP`;
  let htmlOutput = HtmlService.createHtmlOutput(BuildHTMLHELP())
    .setWidth(640)
    .setHeight(480);
  ui.showModalDialog(htmlOutput, title);
};

/**
 * Metrics
 */
const PopupMetrics = () => {
  let ui = SpreadsheetApp.getUi();
  Metrics();
  ui.alert(
    SERVICE_NAME, 
    `Recomputed Statistics`, 
    ui.ButtonSet.OK
  );
};

/**
 * Calc Turnaround Times
 */
const PopupCalcTurnaround = async () => {
  let ui = SpreadsheetApp.getUi();
  let thisRow = SpreadsheetApp.getActiveSheet().getActiveRange().getRow();
  let name = GetByHeader(SHEETS.Main, HEADERNAMES.name, thisRow);
  new Calculate().PrintAverageTurnaround();
  ui.alert(
    SERVICE_NAME, 
    `Recalculated ${name}'s Turnaround Time.`, 
    ui.ButtonSet.OK,
  );

};

/**
 * Return Modal
 */
const PopupReturnModal = async () => {
  const thisSheet = SpreadsheetApp.getActiveSheet();
  if(thisSheet.getSheetName() != SHEETS.Main) return;
  let thisRow = thisSheet.getActiveRange().getRow();
  if (thisRow <= 1) return;
  let data = await GetRowData(thisRow);
  await ShowReturnModal(data);
}

/**
 * Create a pop-up to make a new Jobnumber
 */
const PopupCreateNewId = async () => {
  const ui = await SpreadsheetApp.getUi();
  const thisSheet = SpreadsheetApp.getActiveSheet();
  if(Object.values(OTHERSHEETS).includes(thisSheet)) {
    ui.alert(
      `${SERVICE_NAME}:\n Error!`,
      `Bad Sheet Selected`,
      ui.ButtonSet.OK
    );
    return 0;
  }
  let thisRow = thisSheet.getActiveRange().getRow();
  const id = CreateID();

  SetByHeader(thisSheet, HEADERNAMES.tracking, thisRow, id);
  const a = ui.alert(
    `${SERVICE_NAME}:\n Job Number Created!`,
    `Created a New ID:\nID:${id}`,
    ui.ButtonSet.OK
  );
  if(a === ui.Button.OK) return 0;
};

/**
 * Create a new Barcode
 */
const PopupCreateBarcode = async () => {
  const ui = await SpreadsheetApp.getUi();
  const thisSheet = SpreadsheetApp.getActiveSheet();
  const thisRow = thisSheet.getActiveRange().getRow();

  if(thisSheet.getSheetId() !== SHEETS.Main.getSheetId()) {
    const a = ui.alert(
      `${SERVICE_NAME}: Alert!`,
      `Select a user on the Main Sheet...`,
      ui.ButtonSet.OK
    );
    if(a === ui.Button.OK) return;
  }

  let { tracking, status, issuer, name, itemBasket, dateCheckedOut, ticket, notes, dueDate, } = GetRowData(thisSheet, thisRow);

  const b = new BarcodeService({ number : tracking });
  b.Barcode;
  const url = b.url
  console.info(url)
  SetByHeader(thisSheet, HEADERNAMES.barcode, thisRow, url);
  const a = ui.alert(
    `${SERVICE_NAME}: Alert!`,
    `Created a New Barcode for ${name}:\n${url}`,
    ui.ButtonSet.OK
  );
  if(a === ui.Button.OK) return;
}

const PopupCreateTicket = async () => {
  const ui = await SpreadsheetApp.getUi();
  const thisSheet = SpreadsheetApp.getActiveSheet();
  const thisRow = thisSheet.getActiveRange().getRow();
  if(thisSheet.getSheetId() !== SHEETS.Main.getSheetId()) {
    const a = ui.alert(
      `${SERVICE_NAME}: Alert!`,
      `Select a user on the Main Sheet...`,
      ui.ButtonSet.OK
    );
    if(a === ui.Button.OK) return;
  }
  let { tracking, status, issuer, name, email, itemBasket, dateCheckedOut, ticket, notes, dueDate, } = GetRowData(thisSheet, thisRow);

  const tick = await new Ticket({
    trackingNumber : tracking,
    status : status, 
    name : name, 
    email : email, 
    issuer : issuer,
    checkedOutDate : dateCheckedOut, 
    basket : Array.from(itemBasket.split(`,`)),
    notes : notes,
    dueDate : dueDate,
  });
  tick.CreateTicket();
  const url = tick.url;
  SetByHeader(thisSheet, HEADERNAMES.ticket, thisRow, url);
  console.warn(`Ticket Created....`);
  const a = ui.alert(
    `${SERVICE_NAME}: Alert!`,
    `Created a New Ticket for ${name}:\n${url}`,
    ui.ButtonSet.OK
  );
  if(a === ui.Button.OK) return;
}


/**
 * Builds our JPS Menu and sets functions.
 */
const BarMenu = () => {
  const ui = SpreadsheetApp.getUi();
  ui
    .createMenu(`${SERVICE_NAME} Menu`)
    .addItem(`Create New Id for SELECTED User`, `PopupCreateNewId`)
    .addItem(`Create New Barcode for SELECTED User`, `PopupCreateBarcode`)
    .addItem(`Create New Ticket for SELECTED User`, `PopupCreateTicket`)
    .addItem(`Get Turnaround Time for SELECTED User`, `PopupCalcTurnaround`)
    .addSeparator()
    .addSubMenu(
      ui.createMenu(`Checkout`)
        .addItem(`Manual Checkout for SELECTED User`, `ShowCheckoutModal`)
        .addItem(`Manual Return for SELECTED User`, `PopupReturnModal`)
        .addItem(`Edit Submission for SELECTED User`, `EditFromSelected`)
        .addItem(`Return Items for SELECTED User`, `PopupReturnByBarcode`)
    )
    .addSeparator()
    .addItem(`Go to Scanner Page`, `OpenBarcodeTab`)
    .addSeparator()
    .addSubMenu(
      ui.createMenu(`Metrics`)
        .addItem(`Recompute Metrics`, `PopupMetrics`)
        .addItem(`Count Currently Checked Out`, `PopupCountCheckedOut`)
        .addItem(`Count Currently Checked In`, `PopupCountCheckedIn`)
        .addItem(`Count Currently Overdue!`, `PopupCountOverdue`)
    )
    .addSeparator()
    .addItem(`Help`, `PopupHelp`)
    .addToUi();
}; 


/**
 * Switch to scanning page.
 */
const OpenBarcodeTab = async () => await SpreadsheetApp.getActiveSpreadsheet()
  .setActiveSheet(OTHERSHEETS.Scanner)
  .getRange('B3')
  .activate();




const _akshdjfg = () => {
  let { tracking, status, issuer, name, email, itemBasket, dateCheckedOut, ticket, notes, dueDate, } = GetRowData(SHEETS.Main, 3);
  const ar = Array.from(itemBasket.split(`,`));
  console.info(`Basket --> ${ar}`)
}

