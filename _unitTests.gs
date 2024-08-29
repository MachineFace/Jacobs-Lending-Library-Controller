/**
 * Load GasT for Testing
 * See : https://github.com/huan/gast for instructions
 */

const gasT_URL = UrlFetchApp
  .fetch('https://raw.githubusercontent.com/huan/gast/master/src/gas-tap-lib.js')
  .getContentText();

/**
 * Test with GasT
 */
const _gasTMainTesting = async () => {
  if ((typeof GasTap) === 'undefined') eval(gasT_URL);
  const test = new GasTap();
  console.warn(`Testing: ${new Error().stack.split('\n')[1].split(`at `)[1]}`);  // Print Enclosing Function Name

  await test(`BarcodeService`, (t) => {
    const x = new BarcodeService({number : ``}).Barcode;
    t.notThrow(() => x, `BarcodeService SHOULD NOT throw error: ${x}`);
    t.notEqual(x, undefined || null, `Barcode SHOULD NOT be undefined or null : ${x}`);
    const y = new BarcodeService({ number : `alskdfjalsdkfj` }).Barcode;
    t.notEqual(y, undefined || null, `Barcode SHOULD NOT be undefined or null : ${y}`);
    const z = new BarcodeService({}).Barcode;
    t.notEqual(z, undefined || null, `Barcode SHOULD NOT be undefined or null : ${z}`);
  });
  
  await test(`IDService`, (t) => {
    const x = IDService.createId();
    t.notEqual(x, undefined || null, `DEFAULT / EMPTY id should not return undefined or null, ${x}`);

    const y = IDService.isValid(IDService.createId());
    t.equal(y, true, `Valid uuid should be true : ${y}`);

    const z = IDService.isValid(`NoBueno`);
    t.equal(z, false, `Valid uuid should be false : ${z}`);

    const a = IDService.toDecimal(IDService.createId());
    t.notEqual(a, null || undefined, `UUID to decimal not null: ${a}`);

    // const goodDate = new CreateJobnumber({ date : jtypes.GoodDate }).Jobnumber;
    // t.equal(goodDate, 20151103000000, `Job Number for ${jtypes.GoodDate} should return 20151103000000`);
    // const badDate = new CreateJobnumber({ date : jtypes.BadDate }).Jobnumber;
    // t.notEqual(badDate, undefined || null, `Bad date should still return good jobnumber, ${badDate}`);
    // const anotherBad = new CreateJobnumber({ date : jtypes.AnotherBad }).Jobnumber;
    // t.notEqual(anotherBad, undefined || null, `Bad string date should still return good jobnumber, ${anotherBad}`);
    // const anotherBadString = new CreateJobnumber({ date : jtypes.AnotherBadString }).Jobnumber;
    // t.notEqual(anotherBadString, undefined || null, `Bad string date should still return good jobnumber, ${anotherBadString}`);
  
  });
  
  await test.finish();
  if (test.totalFailed() > 0) throw "Some test(s) failed!";
}


/**
 * Test Logger and Message with GasT
 */
const _gasTLoggerAndMessagingTesting = async () => {
  if ((typeof GasTap) === 'undefined') eval(gasT_URL);
  const test = new GasTap();
  console.warn(`Testing: ${new Error().stack.split('\n')[1].split(`at `)[1]}`);  // Print Enclosing Function Name

  await test(`CreateMessage DEFAULT`, (t) => {
    const message = new CreateMessage({});

    const a = `DEFAULT ${message.defaultMessage}`;
    t.notThrow(() => a, `DEFAULT SHOULD NOT throw error.`);
    const b = `REQUESTED ${message.requestedMessage}`;
    t.notThrow(() => b, `REQUESTED SHOULD NOT throw error.`);
    const c = `CHECKED OUT ${message.checkedOutMessage}`;
    t.notThrow(() => c, `CHECKED OUT SHOULD NOT throw error.`);
    const d = `RETURNED ${message.returnedMessage}`;
    t.notThrow(() => d, `RETURNED SHOULD NOT throw error.`);
    const e = `OVERDUE ${message.overdueMessage}`;
    t.notThrow(() => e, `OVERDUE SHOULD NOT throw error.`);

  });

  await test(`CreateMessage`, (t) => {
    const message = new CreateMessage({
      name : `Stew Dent`, 
      trackingNumber : `1000001`,
      checkedOutDate : new Date(),
      returnedDate : new Date(), 
      remainingDays : `10 days`,
      designspecialist : `Cody`,
    });

    const a = `DEFAULT ${message.defaultMessage}`;
    t.notEqual(a, undefined || null, `DEFAULT message should not return undefined or null. \n${a}`);
    const b = `REQUESTED ${message.requestedMessage}`;
    t.notEqual(b, undefined || null, `REQUESTED message should not return undefined or null. \n${b}`);
    const c = `CHECKED OUT ${message.checkedOutMessage}`;
    t.notEqual(c, undefined || null, `CHECKED OUT message should not return undefined or null. \n${c}`);
    const d = `RETURNED ${message.returnedMessage}`;
    t.notEqual(d, undefined || null, `RETURNED message should not return undefined or null. \n${d}`);
    const e = `OVERDUE ${message.overdueMessage}`;
    t.notEqual(e, undefined || null, `OVERDUE message should not return undefined or null. \n${e}`);

  });

  await test(`Log`, (t) => {
    const x = Log.Warning(`Warning Test ----> Message`);
    const y = Log.Info(`Info Test ----> Message`);
    const z = Log.Error(`ERROR Test ----> Message`);
    const w = Log.Debug(`Debugging Test ----> Message`);
    t.notThrow(() => x, `Warning SHOULD NOT throw error.`);
    t.notThrow(() => y, `Info SHOULD NOT throw error.`);
    t.notThrow(() => z, `Error SHOULD NOT throw error.`);
    t.notThrow(() => w, `Debug SHOULD NOT throw error.`);
  });

  await test.finish();
  if (test.totalFailed() > 0) throw "Some test(s) failed!";
}


/**
 * Test Ticket with GasT
 */
const _gasTTicketTesting = async () => {
  if ((typeof GasTap) === 'undefined') eval(gasT_URL); 
  const test = new GasTap();
  console.warn(`Testing: ${new Error().stack.split('\n')[1].split(`at `)[1]}`);  // Print Enclosing Function Name

  await test(`Ticket`, t => {

    let x = new Ticket({
      trackingNumber : `1000005`,
      status : STATUS.checkedOut, 
      name : `TestName`, 
      email : `email@email.com`, 
      issuer : `Cody`,
      checkedOutDate : new Date(), 
      basket : ["Tiny mitre saw/mitre box","Hot Glue Gun (+2 full glue sticks)","Breadboard","Sandpaper (one square each of 80, 220, 400)","Roomba","Scissors","Exacto (+3 new blades)"],
      notes : `Notes go here.... `,
      dueDate : new TimeConverter().ReturnDate(new Date()),
    }).CreateTicket();
    t.notThrow(() => x, `Ticket SHOULD NOT throw error: ${x}`);
    t.notEqual(x, undefined || null, `Ticket SHOULD NOT yield null. ${x}`);
  });

  await test(`FixMissingTickets`, t => {
    const x = FixMissingTickets();
    t.equal(x, 0, `FixMissingTickets SHOULD yield "0".`);
  });

  await test.finish();
  if (test.totalFailed() > 0) throw "Some test(s) failed!";
}


/**
 * Test AssignUserABasket with GasT
 */
const _gasTAssignmentTesting = async () => {
  if ((typeof GasTap) === 'undefined') eval(gasT_URL);
  const test = new GasTap();
  console.warn(`Testing: ${new Error().stack.split('\n')[1].split(`at `)[1]}`);  // Print Enclosing Function Name

  await test(`AssignmentService`, t => {
    const x = new AssignmentService({
      issuer: `Cody`,
      name : `Testa Fiesta`,
      email : `testa@test.com`,
      basket : [`Tiny mitre saw/mitre box`,`Hot Glue Gun (+2 full glue sticks)`,`Breadboard`,`Sandpaper (one square each of 80, 220, 400)`,`Roomba`,`Scissors`,`Exacto (+3 new blades)`,]
    }).Assign();
    t.notThrow(() => x, `AssignUserABasket SHOULD NOT throw error: ${x}`);
    SHEETS.Main.deleteRow(SHEETS.Main.getLastRow());
  });

  await test.finish();
  if (test.totalFailed() > 0) throw "Some test(s) failed!";

}


/**
 * Test Inventory Manager with GasT
 */
const _gasTInventoryManagerTesting = async () => {
  if ((typeof GasTap) === 'undefined') eval(gasT_URL);
  const test = new GasTap();
  console.warn(`Testing: ${new Error().stack.split('\n')[1].split(`at `)[1]}`);  // Print Enclosing Function Name

  await test(`InventoryManager`, t => {
    let testBasket = ["Tiny mitre saw/mitre box","Hot Glue Gun (+2 full glue sticks)","Breadboard","Sandpaper (one square each of 80, 220, 400)","Roomba","Scissors","Exacto (+3 new blades)"];
    const x = new InventoryManager({basket : testBasket});
    t.notThrow(() => x, `InventoryManager SHOULD NOT throw error: ${x}`);
    const y = x.CheckOutBasket();
    t.notThrow(() => y, `CheckOutBasket SHOULD NOT throw error: ${y}`);
    const z = x.CheckInBasket();
    t.notThrow(() => z, `CheckInBasket SHOULD NOT throw error: ${z}`);
  });

  await test.finish();
  if (test.totalFailed() > 0) throw "Some test(s) failed!";

}


/**
 * Test Record Taker with GasT
 */
const _gasTRecordTakerTesting = async () => {
  if ((typeof GasTap) === 'undefined') eval(gasT_URL); 
  const test = new GasTap();
  console.warn(`Testing: ${new Error().stack.split('\n')[1].split(`at `)[1]}`);  // Print Enclosing Function Name

  await test(`RecordTaker`, t => {
    const x = new RecordTaker({
      trackingNumber : GetByHeader(SHEETS.Main, HEADERNAMES.tracking, i + 5),
      date : GetByHeader(SHEETS.Main, HEADERNAMES.dateCheckedOut, i + 5),
      issuer : GetByHeader(SHEETS.Main, HEADERNAMES.issuer, i + 5),
      name : GetByHeader(SHEETS.Main, HEADERNAMES.name, i + 5),
      email : GetByHeader(SHEETS.Main, HEADERNAMES.studentEmail, i + 5),
      basket : GetByHeader(SHEETS.Main, HEADERNAMES.itemBasket, i + 5),
      notes : GetByHeader(SHEETS.Main, HEADERNAMES.notes, i + 5),
    });
    t.notThrow(() => x, `RecordTaker SHOULD NOT throw error: ${x}`);
  });

  await test.finish();
  if (test.totalFailed() > 0) throw "Some test(s) failed!";
}


/**
 * Test Misc with GasT
 */
const _gasTMiscTesting = async () => {
  if ((typeof GasTap) === 'undefined') eval(gasT_URL);
  const test = new GasTap();
  console.warn(`Testing: ${new Error().stack.split('\n')[1].split(`at `)[1]}`);  // Print Enclosing Function Name

  await test(`Search`, (t) => {
    const x = Search(`Cody`);
    t.notEqual(x, undefined || null, `Search should not return undefined or null. ${JSON.stringify(x)}`);
  });

  await test(`Search Specific Sheet`, (t) => {
    const x = SearchSpecificSheet(SHEETS.Fablight,`Cody`);
    t.notEqual(x, undefined || null, `SearchSpecificSheet should not return undefined or null. ${JSON.stringify(x)}`);
  });

  await test(`FindByJobNumber`, (t) => {
    const x = FindByJobNumber(20211025144607);
    t.notEqual(x, undefined || null, `FindByJobNumber should not return undefined or null. ${JSON.stringify(x)}`);
  });

  await test(`GetByHeader`, (t) => {
    const x = GetByHeader(SHEETS.Fablight, HEADERNAMES.email, 2);
    t.equal(x, `codyglen@berkeley.edu`, `Should fetch my email from that sheet.`);

    const y = GetByHeader(SHEETS.Laser, `BAD COLUMN NAME`, 2);
    t.equal(y, 1, `GetByHeader SHOULD return "1": ${y}`);

    const z = GetByHeader(`BAD SHEET`, HEADERNAMES.email, 2);
    t.equal(y, 1, `GetByHeader SHOULD return "1": ${y}`);

    const a = GetByHeader(`BAD SHEET`, `BAD COLUMN NAME`, `BAD ROW NUMBER`);
    t.equal(a, 1, `GetByHeader SHOULD return "1": ${a}`);

  });

  await test(`GetColumnDataByHeader`, (t) => {
    const x = GetColumnDataByHeader(SHEETS.Fablight, HEADERNAMES.email);
    t.notEqual(x, undefined || null, `GetColumnDataByHeader SHOULD NOT return undefined or null: ${x}`);

    const y = GetColumnDataByHeader(SHEETS.Laser, `BAD COLUMN NAME`);
    t.equal(y, 1, `GetByHeader SHOULD return "1": ${y}`);

    const z = GetColumnDataByHeader(`BAD SHEET`, `BAD COLUMN NAME`);
    t.equal(z, 1, `GetByHeader SHOULD return "1": ${z}`);

  });

  await test(`GetRowData`, (t) => {
    const x = GetRowData(SHEETS.Fablight, 2);
    t.notEqual(x, undefined || null, `GetRowData SHOULD NOT return undefined or null: ${JSON.stringify(x)}`);

    const y = GetRowData(SHEETS.Laser, `BAD COLUMN NAME`);
    t.equal(y, 1, `GetRowData SHOULD return "1": ${y}`);

    const z = GetRowData(`BAD SHEET`, `BAD COLUMN NAME`);
    t.equal(z, 1, `GetRowData SHOULD return "1": ${z}`);

  });

  await test(`FindOne`, (t) => {
    const x = FindOne(`cparsell@berkeley.edu`);
    t.notEqual(x, undefined || null, `FindOne should not return undefined or null. ${JSON.stringify(x)}`);

    const y = FindOne(`BAD NAME`);
    t.equal(0, Object.entries(y).length, `FindOne SHOULD return empty object: ${JSON.stringify(y)}`);
  });

  await test(`ValidateEmail`, (t) => {
    const x = ValidateEmail(`cparsell@berkeley.edu`);
    t.equal(x, true, `ValidateEmail SHOULD return true: ${x}`);

    const y = ValidateEmail(`BAD NAME`);
    t.equal(y, false, `ValidateEmail SHOULD return false: ${y}`);

    const z = ValidateEmail(`!#$%^%$123@berkeley.edu`);
    t.equal(z, false, `ValidateEmail SHOULD return false: ${z}`);

    const a = ValidateEmail(`normalname@!#&^*^&*$%^)$!#$#!`);
    t.equal(a, false, `ValidateEmail SHOULD return false: ${a}`);

    const b = ValidateEmail(`12345675645634599293487529384752938745923845293485729348572934875@berkeley.edu`);
    t.equal(b, true, `ValidateEmail SHOULD return true: ${b}`);

  });

  await test(`SetByHeader`, (t) => {
    const x = SetByHeader(OTHERSHEETS.Logger, `Date`, OTHERSHEETS.Logger.getLastRow(), `TESTING FUNCTIONALITY....`);
    t.notThrow(() => x, `SetByHeader SHOULD NOT throw an error. ${x}`);
    t.equal(x, 0, `SetByHeader SHOULD return "0": Actual: ${x}`);

    const y = SetByHeader(`BAD SHEET`, `Date`, OTHERSHEETS.Logger.getLastRow(), `TESTING FUNCTIONALITY....`);
    t.equal(y, 1, `SetByHeader SHOULD return "1": Actual: ${y}`);

    const z = SetByHeader(OTHERSHEETS.Logger, `BAD TITLE`, OTHERSHEETS.Logger.getLastRow(), `TESTING FUNCTIONALITY....`);
    t.throws(z, `SetByHeader SHOULD throw an error on bad column name: ${z}`)
    t.equal(z, 1, `SetByHeader SHOULD return "1": Actual: ${z}`);

    const a = SetByHeader(OTHERSHEETS.Logger, `Date`, -1, `TESTING FUNCTIONALITY....`);
    t.throws(a, `SetByHeader SHOULD throw an error on bad row number: ${a}`)
    t.equal(a, 1, `SetByHeader SHOULD return "1": Actual: ${a}`);

  });

  await test.finish();
  if (test.totalFailed() > 0) throw "Some test(s) failed!";
}


/**
 * Test Calculations with GasT
 */
const _gasTCalculationTesting = async () => {
  if ((typeof GasTap) === 'undefined') eval(gasT_URL); 
  const test = new GasTap();
  console.warn(`Testing: ${new Error().stack.split('\n')[1].split(`at `)[1]}`);  // Print Enclosing Function Name

  const calc = new Calculate();

  await test(`Calc Average Turnaround`, (t) => {
    const x = calc.GetAverageTurnaround(SHEETS.Laser);
    t.ok(x, `Time string is ok.`);
  });
  
  await test(`Calc Duration`, (t) => {
    const x = calc.CalculateDuration( new Date(1992,03,27), new Date(2022,01,01) );
    t.equal(x.toString(), `10872 1:00:00`, `Good calc`);
    t.notEqual(x, new Date(), `Not Equal to a new date.`);
  });
  
  await test(`Count Active Users`, (t) => {
    const x = calc.CountActiveUsers();
    t.notEqual(x, undefined, `Count of active users should not return undefined.`);
  });
  
  await test(`Count Each Submission`, (t) => {
    const x = calc.CountEachSubmission();
    t.notEqual(x, undefined, `Count Each Submission should not return undefined.`);
  });
  
  await test(`Create Top Ten`, (t) => {
    const x = calc.CreateTopTen();
    t.notEqual(x, undefined || null, `Top Ten should not return undefined or null.`);
  });
  
  await test(`Find an Email.`, (t) => {
    const x = calc.FindEmail(`Cody`);
    t.equal(x, `codyglen@berkeley.edu`, `Function should find my email: ${x}.`);
    t.notEqual(x, undefined || null, `Find an Email should not return undefined or null.`);
  });

  await test(`Calc Distribution`, (t) => {
    const x = calc.GetDistribution();
    t.notEqual(x, undefined, `Distribution should not return undefined.`);
  });

  await test(`Count Types`, (t) => {
    const x = calc.CountTypes();
    t.notEqual(x, undefined, `Count Types should not return undefined.`);
  });
  
  await test(`Calc Standard Deviation`, (t) => {
    const x = calc.GetStandardDeviation();
    t.notEqual(x, undefined || null, `Standard Deviation should not return undefined or null.`);
  });

  await test(`Calculate Arithmetic Mean`, (t) => {
    const x = calc.GetArithmeticMean();
    t.notEqual(x, undefined || null, `Arithmetic Mean should not return undefined or null.`);
  });
  
  await test(`Count Tiers`, (t) => {
    const x = calc.CountTiers();
    t.notEqual(x, undefined || null, `Count Tiers should not return undefined or null.`);
  });
  
  await test(`Count Statuses`, (t) => {
    const x = calc.CountStatuses();
    t.notEqual(x, undefined || null, `Count Statuses should not return undefined or null.`);
  });
  
  await test(`Count Funding`, (t) => {
    const x = calc.CountFunding();
    console.warn(x);
    t.notEqual(x, undefined || null, `Count Funding should not return undefined or null.`);
  });

  await test.finish();
  if (test.totalFailed() > 0) throw "Some test(s) failed!";
}


/**
 * Test Email Service with GasT
 */
const _gasTEmailTesting = async () => {
  if ((typeof GasTap) === 'undefined') eval(gasT_URL);
  const test = new GasTap();
  console.warn(`Testing: ${new Error().stack.split('\n')[1].split(`at `)[1]}`);  // Print Enclosing Function Name

  await test(`Emailer`, async(t) => {
    const name = `Dingus`; 
    const email = "codyglen@berkeley.edu";
    const jobnumber = new IDService().id;
    const projectname = `Some Kinda Project`;
    const message = new CreateMessage({
      name : name,
      jobnumber : jobnumber,
      projectname : projectname,
    });
    Object.values(STATUS).forEach(async (status) => {
      const x = await new Emailer({
        name : name,
        status : status,
        email : email,
        designspecialistemail : `codyglen@berkeley.edu`,
        message : message, 
      })
      t.notThrow(() => x, `Emailer SHOULD NOT throw error`);
    })
  });

  

  /** 
  const __thing__ = () => {
    const message = new CreateMessage({
      name : `Cingus`,
      jobnumber : 192384712938,
      projectname : `P Funk`,
    });
    if(message instanceof CreateMessage) console.warn(`Message is instance of Message Class...`);
    else console.warn(`message is NOT instance of Message class.`)
  }
  */
  await test.finish();
  if (test.totalFailed() > 0) throw "Some test(s) failed!";
}


/**
 * Test All with GasT
 */
const _gasTTestAll = async () => {
  console.warn(`Testing: ${new Error().stack.split('\n')[1].split(`at `)[1]}`);  // Print Enclosing Function Name

  Promise.all([
    await _gasTMainTesting(),
    await _gasTLoggerAndMessagingTesting(),
    await _gasTMiscTesting(),
    await _gasTCalculationTesting(),
    await _gasTShopifyTesting(),
    await _gasTTicketTesting(),
    await _gasTEmailTesting(),
  ])
  .then(console.info('Test Success.'))
  .catch(err => {
    console.error(`Failure: ${err}`);
  });
}






