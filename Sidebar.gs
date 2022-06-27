

const ShowSidebar = async () => {
  const ui = SpreadsheetApp.getUi();
  const inventorysheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(`Inventory`);
  let template = HtmlService.createTemplateFromFile('sidebar')
  template.items = GetColumnDataByHeader(OTHERSHEETS.Inventory, `Item Name`)
  template.staff = GetColumnDataByHeader(OTHERSHEETS.Staff, `NAME`).filter(Boolean);
  let html = HtmlService
    .createHtmlOutput(
      template.evaluate()
        .setSandboxMode(HtmlService.SandboxMode.IFRAME)
        .getBlob()
        .setName(`Jacobs Lending Library Menu`)
      ).setWidth(400)
  ui.showSidebar(html);
}

const ProcessForm = (formObject) => {
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



/** 
 * @NOTIMPLEMENTED
const ShowModal = async () => {
  const ui = SpreadsheetApp.getUi();
  const inventorysheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(`Inventory`);
  let template = HtmlService.createTemplateFromFile('sidebar')
  template.items = inventorysheet.getRange(2, 1, inventorysheet.getLastRow() -1, inventorysheet.getLastColumn()).getValues();
  template.ds = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(`StaffList`).getRange(2, 1, 9, 1).getValues();
  template.ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(`StaffList`).getRange(12, 1, 15, 1).getValues();
  let html = HtmlService.createHtmlOutput(template.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).getBlob().setName(`VR Hardware Menu`)).setWidth(800).setHeight(600)
  ui.showModalDialog(html, `VR Hardware Menu`);
}
*/



