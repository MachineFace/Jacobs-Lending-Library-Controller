


/**
 * -----------------------------------------------------------------------------------------------------------------
 * Creates a pop-up for setting up Tracking.
 */
const PopupCountCheckedOut = async () => {
  let ui = await SpreadsheetApp.getUi();
  let counts = CountStatuses();
  let checkedOut = 0;
  Object.entries(counts).forEach(([key, value], index) => {
    if(key == STATUS.checkedOut) checkedOut = value;
  });
  ui.alert(
    ServiceName, 
    `Currently Checked Out Baskets: ${checkedOut}`, 
    ui.ButtonSet.OK_CANCEL
  );
}
const PopupCountCheckedIn = async () => {
  let ui = await SpreadsheetApp.getUi();
  let counts = CountStatuses();
  let checkedIn = 0;
  Object.entries(counts).forEach(([key, value], index) => {
    if(key == STATUS.checkedIn) checkedIn = value;
  });
  let prompt = ui.alert(
    ServiceName, 
    `Currently Checked In Baskets: ${checkedIn}`, 
    ui.ButtonSet.OK_CANCEL
  );
}
const PopupCountOverdue = async () => {
  let ui = await SpreadsheetApp.getUi();
  let counts = CountStatuses();
  let overdue = 0;
  Object.entries(counts).forEach(([key, value], index) => {
    if(key == STATUS.overdue) overdue = value;
  });
  ui.alert(
    ServiceName, 
    `Currently Checked Out Baskets: ${overdue}`, 
    ui.ButtonSet.OK_CANCEL
  );
}
const CountStatuses = () => {
  let count = {};
  let statuses = GetColumnDataByHeader(SHEETS.Main, HEADERNAMES.status);
  statuses = [].concat(...statuses);
  let countFunc = (keys) => {
    count[keys] = ++count[keys] || 1;
  }
  statuses.forEach(countFunc);
  return count;
}

const PopupReturnByBarcode = async () => {
  let ui = await SpreadsheetApp.getUi();
  let result = ui.prompt(
    ServiceName,
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
  html += `<h3 style="font-family:Roboto">How to Use ${ServiceName} : </h3>`;
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
const PopupHelp = () => {
  let ui = SpreadsheetApp.getUi();
  let title = `${ServiceName} HELP`;
  let htmlOutput = HtmlService.createHtmlOutput(BuildHTMLHELP())
    .setWidth(640)
    .setHeight(480);
  ui.showModalDialog(htmlOutput, title);
};

const PopupMetrics = () => {
  let ui = SpreadsheetApp.getUi();
  Metrics();
  ui.alert(
    ServiceName, 
    `Recomputed Statistics`, 
    ui.ButtonSet.OK
  );
};

const PopupCalcTurnaround = async () => {
  let ui = SpreadsheetApp.getUi();
  let thisRow = SpreadsheetApp.getActiveSheet().getActiveRange().getRow();
  let name = GetByHeader(SHEETS.Main, HEADERNAMES.name, thisRow);
  ui.alert(
    ServiceName, 
    `Recalculated ${name}'s Turnaround Time.`, 
    ui.ButtonSet.OK,
  );

};

const PopupReturnModal = async () => {
  const thisSheet = SpreadsheetApp.getActiveSheet();
  if(thisSheet.getSheetName() != SHEETS.Main) return;
  let thisRow = thisSheet.getActiveRange().getRow();
  if (thisRow <= 1) return;
  let data = await GetRowData(thisRow);
  await ShowReturnModal(data);
}


/**
 * Builds our JPS Menu and sets functions.
 */
const BarMenu = () => {
  SpreadsheetApp.getUi()
    .createMenu(ServiceName)
    .addItem(`Manual Checkout`, `ShowCheckoutModal`)
    .addItem(`Manual Return`, `PopupReturnModal`)
    .addItem(`Edit Selected Submission`, `EditFromSelected`)
    .addItem(`Go to Scanner Page`, `OpenBarcodeTab`)
    .addItem(`Return Items`, `PopupReturnByBarcode`)
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


