
/**
 * Seeker Class to Search for Terms
 */
class Seeker
{
  constructor() {
  }

  /**
   * Search all sheets for a specific value
   * @param {string} value
   * @returns {json} results
   */
  FindAllInstances (value) {
    if (value) value = this._CleanInput(value);
    let res = {};
    Object.values(SHEETS).forEach( (sheet, index) => {
      const finder = sheet.createTextFinder(value).findAll();
      if (finder != null) {
        let temp = [];
        finder.forEach(result => temp.push(result.getRow()));
        console.info(temp)
        const sheetKey = Object.keys(SHEETS)[index];
        res[sheetKey] = temp;
      }
    });
    console.info(`FindAllInstances ---> ${JSON.stringify(res)}`);
    return res;
  }

  /**
   * Find all values in a given sheet
   * @param {string} value
   * @param {sheet} sheet
   * @returns {json} results
   */
  FindAllOnSpecificSheet (value, sheet) {
    if (value) value = this._CleanInput(value);
    let res = {};
    const finder = sheet.createTextFinder(value).findAll();
    if (finder != null) {
      let temp = [];
      finder.forEach(result => temp.push(result.getRow()));
      res[sheet.getSheetName()] = temp;
    }
    console.info(`FindAllOnSpecificSheet ---> ${JSON.stringify(res)}`);
    return res;
  }

  /**
   * Search all Sheets for one specific value
   * @required {string} value
   * @returns {[sheet, [number]]} [sheetname, row]
   */
  FindOne (value) {
    if (value) value = this._CleanInput(value);
    let res = {};
    Object.values(SHEETS).forEach(sheet => {
      const finder = sheet.createTextFinder(value).findNext();
      if (finder != null) res = this.GetRowData(sheet, finder.getRow());
    })
    return res;
  }

  /**
   * Search all sheets for a specific jobnumber
   * @param {number} jobnumber
   * @returns {json} results
   */
  FindByJobID (jobID) {
    // jobnumber = 20211025144607;  // test good jnum
    if (jobID) jobID = this._CleanInput(jobID);
    let res = {};
    Object.values(SHEETS).forEach(sheet => {
      const finder = sheet.createTextFinder(jobID).findNext();
      if (finder != null) {
        res[sheet.getName()] = finder.getRow();
      }
    });
    console.info(`SEARCH BY JobID ---> ${JSON.stringify(res)}`);
    return res;
  }

  /**
   * Search In a Column on a sheet
   * @param {sheet} sheet
   * @param {string} column - `A` or `D` etc
   * @param {string} value
   * @returns {[int]} indexes
   */
  SearchInColumn (sheet, column, value) {
    let indexes = [];
    let values = sheet.getRange(`${column}2:${column}`).getValues(); 
    let row = 2;
    while (values[row] && values[row][0] !== value) row++;
    if (values[row][0] === value) indexes.push(row + 1);
    else return -1;
    console.info(`SEARCH IN COLUMN ---> ${indexes}`);
    return indexes;
  };

  SearchInRow (sheet, data) {
    let indexes = [];
    let rows = sheet.getDataRange.getValues();

    // Loop through all the rows and return a matching index
    for (let r = 1; r < rows.length; r++) {
      let index = rows[r].indexOf(data) + 1;
      indexes.push(index);
    }
    return indexes;
  };

  GetByHeader (sheet, columnName, row) {
    try {
      let data = sheet.getDataRange().getValues();
      let col = data[0].indexOf(columnName);
      if (col != -1) return data[row - 1][col];
    } catch (err) {
      console.error(`${err} : GetByHeader failed - Sheet: ${sheet} Col Name specified: ${columnName} Row: ${row}`);
    }
  };

  GetColumnDataByHeader (sheet, columnName) {
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

  GetRowData (sheet, row) {
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

  SetByHeader (sheet, columnName, row, val) {
    try {
      const data = sheet.getDataRange().getValues();
      const col = data[0].indexOf(columnName) + 1;
      sheet.getRange(row, col).setValue(val);
    } catch (err) {
      console.error(`${err} : SetByHeader failed - Sheet: ${sheet} Row: ${row} Col: ${col} Value: ${val}`);
    }
  };

  _CleanInput (value) {
    return value.toString().replace(/\s+/g, "");
  }
}

const _testSeeker = () => {
  const seek = new Seeker();
  seek.FindAllInstances(`1000023`);
  seek.FindAllOnSpecificSheet(`Cody`, SHEETS.Main);
  seek.FindOne(`Cody`);
  // seek.SearchByJobNumber(`20220306013149`);
  // seek.SearchInColumn(SHEETS.Main, `N`, `Mild Steel Plate - 0.125" - priced per square inch`);
  // seek.GetRowData(SHEETS.Main, 38);
}