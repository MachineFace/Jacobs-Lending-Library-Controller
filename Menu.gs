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
  else if (button == ui.Button.CANCEL) ui.alert('I didn\'t get your name.');
  else if (button == ui.Button.CLOSE) ui.alert('You closed the dialog.');
}

/**
 * Builds HTML file for the modal pop-up from the help list.
 */
const BuildHTMLHELP = () => {
  let items = [
    `Note : All status changes trigger an email to the student. USE with CAUTION.`,
    `On the sidebar: Fill in the student name / email and assign yourself as the DS / SS.`,
    `Check any items the student will be checking out.`,
    `Add notes if needed.`,
    `Click: "Assign Basket To Student"`,
    `A new line will be added to the "Main" tab and the student will be emailed.`,
    `When the student returns the items, mark their tracking number as "Checked-In."`,
    `See Cody or Chris for additional help + protips.`,
  ];
  let html = `<h2 style="text-align:center"><b> HELP MENU </b></h2>`;
  html += `<h3 style="font-family:Roboto">How to Use ${SERVICE_NAME} : </h3>`;
  html += `<hr>`;
  html += `<p>${items[0]}</p>`;
  html += `<ol style="font-family:Roboto font-size:10">`;
  items.forEach((item, index) => {
    if (index > 0 && index < items.length - 1) {
      html += `<li>${item}</li>`;
    }
  });
  html += `</ol>`;
  html += `<p>${items[items.length - 1]}</p>`;

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
 * Builds our JPS Menu and sets functions.
 */
const BarMenu = () => {
  SpreadsheetApp.getUi()
    .createMenu(SERVICE_NAME)
    .addItem(`Manual Checkout`, `ShowCheckoutModal`)
    .addItem(`Manual Return`, `PopupReturnModal`)
    .addItem(`Edit Selected Submission`, `EditFromSelected`)
    .addItem(`Go to Scanner Page`, `OpenBarcodeTab`)
    .addItem(`Return Items`, `PopupReturnByBarcode`)
    .addItem(`Create New Id`, `PopupCreateNewId`)
    .addSeparator()
    .addItem(`Count Currently Checked Out`, `PopupCountCheckedOut`)
    .addItem(`Count Currently Checked In`, `PopupCountCheckedIn`)
    .addItem(`Count Currently Overdue!`, `PopupCountOverdue`)
    .addSeparator()
    .addItem(`Help`, `PopupHelp`)
    .addSeparator()
    .addItem(`Recompute Metrics`, `PopupMetrics`)
    .addItem(
      `Calculate Selected Person's Turnaround Time`,
      `PopupCalcTurnaround`
    )
    .addToUi();
}; 


/**
 * Switch to scanning page.
 */
const OpenBarcodeTab = async () => await SpreadsheetApp.getActiveSpreadsheet()
  .setActiveSheet(OTHERSHEETS.Scanner)
  .getRange('B3')
  .activate();






