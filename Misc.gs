/**
 * -----------------------------------------------------------------------------------------------------------------
 * MISC
 */


/**
 * ----------------------------------------------------------------------------------------------------------------
 * Return the value of a cell by column name and row number
 * @param {sheet} sheet
 * @param {string} colName
 * @param {number} row
 */
const GetByHeader = (sheet, columnName, row) => {
  try {
    let data = sheet.getDataRange().getValues();
    let col = data[0].indexOf(columnName);
    if (col != -1) return data[row - 1][col];
  } catch (err) {
    console.error(`${err} : GetByHeader failed - Sheet: ${sheet} Col Name specified: ${columnName} Row: ${row}`);
  }
};

/**
 * Search all Sheets for one specific value
 * @required {string} value
 * @returns {[sheet, [number]]} [sheetname, row]
 */
const FindOne = (value) => {
  if (value) value.toString().replace(/\s+/g, "");
  let res = {};
  for(const [key, sheet] of Object.entries(SHEETS)) {
    const finder = sheet.createTextFinder(value).findNext();
    if (finder != null) {
      // res[key] = finder.getRow();
      res = GetRowData(sheet, finder.getRow());
    }
  }
  return res;
}


/**
 * ----------------------------------------------------------------------------------------------------------------
 * Return the values of a column by the name
 * @param {sheet} sheet
 * @param {string} colName
 * @param {number} row
 */
const GetColumnDataByHeader = (sheet, columnName) => {
  try {
    const data = sheet.getDataRange().getValues();
    const col = data[0].indexOf(columnName);
    let colData = data.map(d => d[col]);
    colData.splice(0, 1);
    if (col != -1) return colData;
  } catch (err) {
    console.error(`${err} : GetByHeader failed - Sheet: ${sheet} Col Name specified: ${columnName}`);
  }
};


/**
 * ----------------------------------------------------------------------------------------------------------------
 * Return the values of a row by the number
 * @param {sheet} sheet
 * @param {number} row
 * @returns {dict} {header, value}
 */
const GetRowData = (sheet, row) => {
  let dict = {};
  try {
    let headers = sheet.getRange(1, 1, 1, sheet.getMaxColumns()).getValues()[0];
    headers.forEach( (name, index) => {
      headers[index] = Object.keys(HEADERNAMES).find(key => HEADERNAMES[key] === name);
    })
    let data = sheet.getRange(row, 1, 1, sheet.getMaxColumns()).getValues()[0];
    headers.forEach((header, index) => dict[header] = data[index]);
    dict[`sheetname`] = sheet.getSheetName();
    dict[`row`] = row;
    console.info(dict);
    return dict;
  } catch (err) {
    console.error(`${err} : GetRowData failed - Sheet: ${sheet} Row: ${row}`);
  }
}



/**
 * ----------------------------------------------------------------------------------------------------------------
 * Set the value of a cell by column name and row number
 * @param {sheet} sheet
 * @param {string} colName
 * @param {number} row
 * @param {any} val
 */
const SetByHeader = (sheet, columnName, row, val) => {
  try {
    const data = sheet.getDataRange().getValues();
    const col = data[0].indexOf(columnName) + 1;
    sheet.getRange(row, col).setValue(val);
  } catch (err) {
    console.error(`${err} : SetByHeader failed - Sheet: ${sheet} Row: ${row} Col: ${col} Value: ${val}`);
  }
};


/**
 * ----------------------------------------------------------------------------------------------------------------
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
 * ----------------------------------------------------------------------------------------------------------------
 * Search all Sheets for a value
 * @required {string} value
 * @returns {[sheet, [values]]} list of sheets with lists of indexes
 */
const Search = (value) => {
  try {
    if (value) value.toString().replace(/\s+/g, "");
    let res = {};
    Object.values(SHEETS).forEach(sheet => {
      const finder = sheet.createTextFinder(value).findAll();
      if (finder != null) {
        temp = [];
        finder.forEach(result => temp.push(result.getRow()));
        res[sheet.getName()] = temp;
      }
    })
    // for(const [key, sheet] of Object.entries(SHEETS)) {
    // }
    // console.info(JSON.stringify(res));
    return res;
  } catch(err) {
    console.error(`${err} : Whoops, Couldn't get Search.`);
  }
}


/**
 * ----------------------------------------------------------------------------------------------------------------
 * Search a Specific Sheets for a value
 * @required {string} value
 * @returns {[sheet, [values]]} list of sheets with lists of indexes
 */
const SearchSpecificSheet = (sheet, value) => {
  if (value) value.toString().replace(/\s+/g, "");

  const finder = sheet.createTextFinder(value).findNext();
  if (finder != null) {
    return finder.getRow();
  } else return false;

}


/**
 * ----------------------------------------------------------------------------------------------------------------
 * DS Info
 * @param {string} ds firstname
 * @return {json} ds info
 */
const DSInfo = (ds) => {
  const row = SearchSpecificSheet(OTHERSHEETS.Staff, ds);
  const name = GetByHeader(OTHERSHEETS.Staff, `NAME`, row);
  const fullname = GetByHeader(OTHERSHEETS.Staff, `FIRST LAST NAME`, row);
  const email = GetByHeader(OTHERSHEETS.Staff, `EMAIL`, row);
  const emailLink = GetByHeader(OTHERSHEETS.Staff, `EMAIL LINK`, row);
  const type = GetByHeader(OTHERSHEETS.Staff, `Type`, row);
  return {
    name : name,
    fullname : fullname,
    email : email,
    emailLink : emailLink,
    type : type,	
  }
}

const MakeFilename = (name) => `${name}-${Utilities.formatDate(new Date(), "PST", "yyyyMMddHHmmss").toString()}`;


/**
 * @NOTIMPLEMENTED
 * Assign only available headsets to column. 
 * @TRIGGERED
 *
const SetValidationBasedOnAvailability = () => {
  let trackingNumbers = GetColumnDataByHeader(SHEETS.Main, HEADERNAMES.tracking);
  let statuses = GetColumnDataByHeader(SHEETS.Main, HEADERNAMES.status);
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
      .setBackground(COLORS.orange_light)
      .setFontColor(COLORS.orange)
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

/**
 * Make a Tracking Number
 * @returns {number} trackingNumber
 */
const MakeTrackingNumber = () => {
  const prevRowNum = SHEETS.Main.getLastRow() - 1;
  const trackingNumber = Number.parseInt(100000 + prevRowNum);
  return trackingNumber;
}

/**
 * Validate an email string
 * @param {string} email
 * @returns {bool} boolean
 */
const ValidateEmail = (email) => {
  const regex = new RegExp(/^[a-zA-Z0-9+_.-]+@[berkeley.edu]+$/);
  let match = regex.test(email);
  return match;
}




