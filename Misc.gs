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
    if(typeof(sheet) !== typeof(SHEETS.Main)) throw new Error(`Bad input: Sheet: ${sheet} Col Name specified: ${columnName} Row: ${row}`);
    const data = sheet.getDataRange().getValues();
    const col = data[0].indexOf(columnName);
    if (col != -1) return data[row - 1][col];
    else {
      console.error(`Getting data by header fucking failed...`);
      return 1;
    }
  } catch (err) {
    console.error(`"GetByHeader()" failed : ${err}`);
    return 1;
  }
};


/**
 * ----------------------------------------------------------------------------------------------------------------
 * Return the values of a column by the name
 * @param {sheet} sheet
 * @param {string} colName
 * @param {number} row
 */
const GetColumnDataByHeader = (sheet, columnName) => {
  try {
    if(typeof(sheet) !== typeof(SHEETS.Main)) throw new Error(`Bad input: Sheet: ${sheet} Col Name specified: ${columnName}`);
    const data = sheet.getDataRange().getValues();
    const col = data[0].indexOf(columnName);
    let colData = data.map(d => d[col]);
    colData.splice(0, 1);
    if (col != -1) return colData;
    else {
      console.error(`Getting column data by header fucking failed...`);
      return 1;
    }
  } catch (err) {
    console.error(`"GetColumnDataByHeader()" failed : ${err}`);
    return 1;
  }
}


/**
 * ----------------------------------------------------------------------------------------------------------------
 * Return the values of a row by the number
 * @param {sheet} sheet
 * @param {number} row
 * @returns {dict} {header, value}
 */
const GetRowData = (sheet, row) => {
  if(typeof sheet != `object`) return 1;
  let dict = {};
  try {
    let headers = sheet.getRange(1, 1, 1, sheet.getMaxColumns()).getValues()[0];
    headers.forEach( (name, index) => {
      let linkedKey = Object.keys(HEADERNAMES).find(key => HEADERNAMES[key] === name);
      if(!linkedKey) headers[index] = name;
      else headers[index] = linkedKey;
    })
    let data = sheet.getRange(row, 1, 1, sheet.getMaxColumns()).getValues()[0];
    headers.forEach( (header, index) => {
      dict[header] = data[index];
    });
    dict[`sheetName`] = sheet.getSheetName();
    dict[`row`] = row;
    // console.info(dict);
    return dict;
  } catch (err) {
    console.error(`${err} : GetRowData failed - Sheet: ${sheet} Row: ${row}`);
    return 1;
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
  if(typeof sheet != `object`) return 1;
  let data;
  let col;
  try {
    data = sheet.getDataRange().getValues();
    col = data[0].indexOf(columnName) + 1;
    if(col != -1) {
      sheet.getRange(row, col).setValue(val);
      return 0;
    } else return 1;
  } catch (err) {
    console.error(`${err} : SetByHeader failed - Sheet: ${sheet} Row: ${row} Col: ${col} Value: ${val}`);
    return 1;
  }
};


/**
 * ----------------------------------------------------------------------------------------------------------------
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
  if(row == 0) return 1;
  const rd = GetRowData(OTHERSHEETS.Staff, row);
  return {
    name : rd[`NAME`],
    fullname : rd[`FIRST LAST NAME`],
    email : rd[`EMAIL`],
    emailLink : rd[`EMAIL LINK`],
    type : rd[`Type`],	
  }
}

const _testDS = () => {
  console.info(DSInfo(`Cody`));
  console.info(`DSInfo SHOULD return "1": Actual: ${DSInfo(`NOT A NAME`)}`);
}

const MakeFilename = (name) => `${name}-${Utilities.formatDate(new Date(), "PST", "yyyyMMddHHmmss").toString()}`;


/**
 * Check if this sheet is forbidden
 * @param {sheet} sheet to check
 * @returns {bool} false if sheet is allowed
 * @returns {bool} true if forbidden
 */
const CheckSheetIsForbidden = (someSheet) => {
  let forbiddenNames = [];
  Object.values(OTHERSHEETS).forEach(sheet => forbiddenNames.push(sheet.getSheetName()));
  const index = forbiddenNames.indexOf(someSheet.getName());
  if(index == -1 || index == undefined) {
    console.info(`Sheet is NOT FORBIDDEN : ${someSheet.getName()}`)
    return false;
  } else {
    console.error(`SHEET FORBIDDEN : ${forbiddenNames[index]}`);
    return true;
  }
}




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




