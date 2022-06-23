
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
    `Jacobs VR Hardware Tracker`, 
    `Currently Checked Out Headsets: ${checkedOut}`, 
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
    `Jacobs VR Hardware Tracker`, 
    `Currently Checked In Headsets: ${checkedIn}`, 
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
    `Jacobs VR Hardware Tracker`, 
    `Currently Checked Out Headsets: ${checkedOut}`, 
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

/**
 * Builds HTML file for the modal pop-up from the help list.
 */
const BuildHTMLHELP = () => {
  let items = [
    `Note : All status changes trigger an email to the student. USE with CAUTION.`,
    `Assign yourself as the DS / SS and fill in the email and student name.`,
    `Change the status to 'Checked Out' when you're ready to check out the hardware.`,
    `The 'Checked Out' Date will automatically set itself.`,
    `Change the status to 'Checked In' if the student is returning hardware.`,
    `The 'Returned' Date will automatically set itself.`,
    `Please do not change the hardware ID for the headsets.`,
    `See Cody or Chris for additional help + protips.`,
  ];
  let html = '<h2 style="text-align:center"><b> HELP MENU </b></h2>';
  html += '<h3 style="font-family:Roboto">How to Use JPS : </h3>';
  html += "<hr>";
  html += "<p>" + items[0] + "</p>";
  html += '<ol style="font-family:Roboto font-size:10">';
  items.forEach((item, index) => {
    if (index > 0 && index < items.length - 1) {
      html += "<li>" + item + "</li>";
    }
  });
  html += "</ol>";
  html += "<p>" + items[items.length - 1] + "</p>";

  console.info(html);
  return html;
};
const PopupHelp = () => {
  let ui = SpreadsheetApp.getUi();
  let title = "Jacobs VR Hardware Tracker HELP";
  let htmlOutput = HtmlService.createHtmlOutput(BuildHTMLHELP())
    .setWidth(640)
    .setHeight(480);
  ui.showModalDialog(htmlOutput, title);
};

const PopupMetrics = () => {
  let ui = SpreadsheetApp.getUi();
  Metrics();
  ui.alert(
    `Jacobs VR Hardware Tracker`, 
    `Recomputed Statistics`, 
    ui.ButtonSet.OK
  );
};

const PopupCalcTurnaround = async () => {
  let ui = SpreadsheetApp.getUi();
  let thisRow = SpreadsheetApp.getActiveSheet().getActiveRange().getRow();
  let name = GetByHeader(SHEETS.Main, HEADERNAMES.name, thisRow);
  ui.alert(
    `Jacobs VR Hardware Tracker`, 
    `Recalculated ${name}'s Turnaround Time.`, 
    ui.ButtonSet.OK,
  );

};


/**
 * Builds our JPS Menu and sets functions.
 */
const BarMenu = () => {
  SpreadsheetApp.getUi()
    .createMenu("Jacobs LendingBot")
    .addItem(`SideBar`, `ShowSidebar`)
    .addItem("Go to Scanner Page", "OpenBarcodeTab")
    .addSeparator()
    .addItem("Count Currently Checked Out", "PopupCountCheckedOut")
    .addItem(`Count Currently Checked In`, `PopupCountCheckedIn`)
    .addItem(`Count Currently Overdue!`, `PopupCountOverdue`)
    .addSeparator()
    .addItem("Help", "PopupHelp")
    .addSeparator()
    .addItem(`Recompute Metrics`, `PopupMetrics`)
    .addItem(`Calculate Selected Person's Turnaround Time`, `PopupCalcTurnaround`)
    .addToUi();
};



/**
 * Switch to scanning page.
 */
const OpenBarcodeTab = async () => await SpreadsheetApp.getActiveSpreadsheet().setActiveSheet(OTHERSHEETS.Scanner).getRange('B3').activate();


