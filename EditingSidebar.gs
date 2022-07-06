

const EditFromSelected = async () => {
  const ui = SpreadsheetApp.getUi();
  let thisSheet = SpreadsheetApp.getActiveSheet();
  let thisRow = thisSheet.getActiveRange().getRow();

  // Is this the correct sheet?
  if (thisSheet.getSheetName() != SHEETS.Main.getSheetName()) {
    Browser.msgBox(
      `Incorrect Sheet Active`,
      `Please select 'Form Responses'. Select one cell in the row and an editing sidebar will pop up.`,
      Browser.Buttons.OK
    );
    return;
  }

  // Get row data
  const rowData = GetRowData(thisSheet, thisRow);
  console.warn(rowData)

  // Pass rowData to ShowEditingSidebar
  const name = rowData?.name;
  const studentEmail = rowData?.studentEmail;
  const studentId = rowData?.studentId;
  const itemBasket = rowData?.itemBasket?.split(', ');
  let template = HtmlService.createTemplateFromFile('editingsidebar');
  template.data = rowData;
  template.name = name;
  template.studentEmail = studentEmail;
  template.studentId = studentId;
  template.items = GetColumnDataByHeader(OTHERSHEETS.Inventory, `Item Name`);
  template.checkedItems = itemBasket;
  template.staff = GetColumnDataByHeader(OTHERSHEETS.Staff, `NAME`).filter(Boolean);
  let html = HtmlService
    .createHtmlOutput(
      template.evaluate()
        .setSandboxMode(HtmlService.SandboxMode.IFRAME)
        .getBlob()
        .setName(`${ServiceName} Menu`)
      ).setWidth(400)
  ui.showSidebar(html);
}

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
  template.items = GetColumnDataByHeader(OTHERSHEETS.Inventory, `Item Name`);
  template.checkedItems = itemBasket;
  template.staff = GetColumnDataByHeader(OTHERSHEETS.Staff, `NAME`).filter(Boolean);
  let html = HtmlService
    .createHtmlOutput(
      template.evaluate()
        .setSandboxMode(HtmlService.SandboxMode.IFRAME)
        .getBlob()
        .setName(`${ServiceName} Menu`)
      ).setWidth(400)
  ui.showSidebar(html);
}

const ProcessEditForm = (formObject) => {
  let name = ``, email = ``, staff = ``, basket = [], notes = ``; 
  Object.entries(formObject).forEach( pair => {
    // console.info(`Key: ${pair[0]}, Value: ${pair[1]}`);
    if(pair[0] == `name`) name = pair[1] ? TitleCase(pair[1]) : `Unknown Name`;
    if(pair[0] == `email`) email = ValidateEmail(pair[1]) ? pair[1] : `Unknown Email`;
    if(pair[0] == `staff`) staff = pair[1] ? pair[1] : `Staff`;
    if(pair[0] == `notes`) notes = pair[1] ? pair[1] : `Notes`;
    else if(pair[1] == `true`) basket.push(pair[0])
  })
  console.info(`Name: ${name}, Email: ${email}, Staff: ${staff}, Basket: ${basket}`);
  new AssignUserABasket({
    name : name,
    email : email,
    issuer : staff,
    basket : basket,
    notes : notes,
  })
  let thisRow = SHEETS.Main.getLastRow() + 1;
  console.warn(`Form processed to row: ${thisRow}`);

}
