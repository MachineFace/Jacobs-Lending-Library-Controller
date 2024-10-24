

const EditFromSelected = async () => {
  const ui = SpreadsheetApp.getUi();
  let thisSheet = SpreadsheetApp.getActiveSheet();
  let thisRow = thisSheet.getActiveRange().getRow();

  // Is this the correct sheet?
  if (thisSheet.getSheetName() != SHEETS.Main.getSheetName()) {
    Browser.msgBox(
      SERVICE_NAME_WITH_ICON,
      `Please select 'Form Responses'. Select one cell in the row and an editing sidebar will pop up.`,
      Browser.Buttons.OK
    );
    return;
  }

  // Get row data
  const rowData = SheetService.GetRowData(thisSheet, thisRow);
  console.warn(rowData);
  let { tracking, status, issuer, timestamp, studentEmail, name, studentId, affiliation, itemBasket, dateCheckedOut, dateReturned, ticket, barcode, notes, dueDate, remainingDays, sheetName, row } = rowData;

  // Pass rowData to Sidebar
  itemBasket = itemBasket?.split(', ');
  
  let template = HtmlService.createTemplateFromFile('editingsidebar');
  template.rowData = rowData;
  template.name = name;
  template.issuer = issuer;
  template.studentEmail = studentEmail;
  template.studentId = studentId;
  template.items = SheetService.GetColumnDataByHeader(OTHERSHEETS.Inventory, `Item Name`);
  template.itemBasket = itemBasket;
  template.staff = SheetService.GetColumnDataByHeader(OTHERSHEETS.Staff, `NAME`).filter(Boolean);
  let html = HtmlService
    .createHtmlOutput(
      template.evaluate()
        .setSandboxMode(HtmlService.SandboxMode.IFRAME)
        .getBlob()
        .setName(`${SERVICE_NAME_WITH_ICON} Menu`)
      ).setWidth(400)
  ui.showSidebar(html);
}

/** 
 * @NOTIMPLEMENTED
const ShowEditingSidebar = async (rowData) => {
  const ui = SpreadsheetApp.getUi();
  const name = rowData.name;
  const studentEmail = rowData.studentEmail;
  const studentId = rowData.studentId;
  const itemBasket = rowData.itemBasketitemsBasket.split(', ');
  let template = HtmlService.createTemplateFromFile('editingsidebar');
  template.name = name;
  template.studentEmail = studentEmail;
  template.studentId = studentId;
  template.items = SheetService.GetColumnDataByHeader(OTHERSHEETS.Inventory, `Item Name`);
  template.checkedItems = itemBasket;
  template.staff = SheetService.GetColumnDataByHeader(OTHERSHEETS.Staff, `NAME`).filter(Boolean);
  let html = HtmlService
    .createHtmlOutput(
      template.evaluate()
        .setSandboxMode(HtmlService.SandboxMode.IFRAME)
        .getBlob()
        .setName(`${SERVICE_NAME_WITH_ICON} Menu`)
      ).setWidth(400)
  ui.showSidebar(html);
}
*/

const ProcessEditForm = (formObject, rowData) => {
  let name = ``, email = ``, staff = ``, basket = {}, notes = ``; 
  Object.entries(formObject).forEach( pair => {
    console.info(`Key: ${pair[0]}, Value: ${pair[1]}`);
    if(pair[0] == `name`) name = pair[1] ? TitleCase(pair[1]) : `Unknown Name`;
    if(pair[0] == `email`) email = Emailer.ValidateEmail(pair[1]) ? pair[1] : `Unknown Email`;
    if(pair[0] == `staff`) staff = pair[1] ? pair[1] : `Staff`;
    if(pair[0] == `notes`) notes = pair[1] ? pair[1] : `Notes`;
    // else if(pair[1] == `true`) basket.push(pair[0])
    for (i = 0; i < items.length; i++) {
      if (pair[0] == items[i]) basket.push(pair[0])
    }
  })
  console.info(`Name: ${name}, Email: ${email}, Staff: ${staff}, Basket: ${basket}`);
  ModifyOrder(rowData);

}
