/**
 * -----------------------------------------------------------------------------------------------------------------
 * MISC
 */



/**
 * Get Drive ID from URL
 */
const GetDriveIDFromUrl = (url) => { 
  try {
    let id = "";
    const parts = url.split(/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/);
    if (url.indexOf('?id=') >= 0){
      id = (parts[6].split("=")[1]).replace("&usp","");
      return id;
    } else {
      id = parts[5].split("/");
      // Using sort to get the id as it is the longest element. 
      var sortArr = id.sort(function(a,b){return b.length - a.length});
      id = sortArr[0];
      return id;
    }
  } catch (err) {
    console.error(`${err} : Whoops, Couldn't get DriveID from URL`);
  }
}

/**
 * DS Info
 * @param {string} ds firstname
 * @return {json} ds info
 */
const DSInfo = (ds) => {
  const row = SheetService.SearchSpecificSheet(OTHERSHEETS.Staff, ds);
  if(row < 1) return 1;
  const rd = SheetService.GetRowData(OTHERSHEETS.Staff, row);
  return {
    name : rd[`NAME`],
    fullname : rd[`FIRST LAST NAME`],
    email : rd[`EMAIL`],
    emailLink : rd[`EMAIL LINK`],
    type : rd[`Type`],	
  }
}

// const _testDS = () => {
//   console.info(DSInfo(`Cody`));
//   console.info(`DSInfo SHOULD return "1": Actual: ${DSInfo(`NOT A NAME`)}`);
// }

const MakeFilename = (name) => `${name}-${Utilities.formatDate(new Date(), "PST", "yyyyMMddHHmmss").toString()}`;


/**
 * @NOTIMPLEMENTED
 * Assign only available headsets to column. 
 * @TRIGGERED
 *
const SetValidationBasedOnAvailability = () => {
  let trackingNumbers = SheetService.GetColumnDataByHeader(SHEETS.Main, HEADERNAMES.tracking);
  let statuses = SheetService.GetColumnDataByHeader(SHEETS.Main, HEADERNAMES.status);
  let filtered = trackingNumbers.filter((trackingNumber, index) => { 
    if(statuses[index] == STATUS.checkedIn) return trackingNumber;
  });
  const rule = SpreadsheetApp.newDataValidation().requireValueInList(filtered);
  SHEETS.Submissions.getRange(2, 1, SHEETS.Submissions.getLastRow(), 1).setDataValidation(rule);
}
*/



/**
 * Set the Conditional Formatting for each page
 * @TRIGGERED
 */
const SetConditionalFormatting = () => {
  let rules = [
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied(`=$B2="${STATUS.requested}"`)
      .setRanges([SHEETS.Main.getRange(2, 1, SHEETS.Main.getMaxRows(), SHEETS.Main.getMaxColumns()),])
      .setBackground(COLORS.yellow_light)
      .setFontColor(COLORS.yellow_dark)
      .build()
    ,
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied(`=$B2="${STATUS.checkedIn}"`)
      .setRanges([SHEETS.Main.getRange(2, 1, SHEETS.Main.getMaxRows(), SHEETS.Main.getMaxColumns()),])
      .setBackground(COLORS.green_light)
      .setFontColor(COLORS.green_dark)
      .build()
    ,
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied(`=$B2="${STATUS.checkedOut}"`)
      .setRanges([SHEETS.Main.getRange(2, 1, SHEETS.Main.getMaxRows(), SHEETS.Main.getMaxColumns()),])
      .setBackground(COLORS.orange_light)
      .setFontColor(COLORS.orange)
      .build()
    ,
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied(`=$B2="${STATUS.overdue}"`)
      .setRanges([SHEETS.Main.getRange(2, 1, SHEETS.Main.getMaxRows(), SHEETS.Main.getMaxColumns()),])
      .setBackground(COLORS.red_light)
      .setFontColor(COLORS.red)
      .build()
    ,
  ];
  SHEETS.Main.setConditionalFormatRules(rules);
}



/**
 * Helper Method for TitleCasing Names
 * @param {string} string
 * @returns {string} titlecased
 */
const TitleCase = (str) => {
  str = str
    .toLowerCase()
    .split(' ');
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1); 
  }
  return str.join(' ');
}








