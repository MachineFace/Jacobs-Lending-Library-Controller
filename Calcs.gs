/**
 * -----------------------------------------------------------------------------------------------------------------
 * Calculate Metrics
 */
class Calculate {
  constructor() {

  }

  /**
   * Calculate Average Turnaround Time
   */
  GetAverageTurnaround() {
    let completionTimes = GetColumnDataByHeader(SHEETS.Main, HEADERNAMES.remainingDays)
      .filter(Boolean);

    let total = 0;
    completionTimes.forEach( time => {
      if(!time) total += 0;
      else total += TimeService.TimerStringToMilliseconds(time);
    });

    // Average the totals (a list of times in minutes)
    let average = Number.parseFloat(total / completionTimes.length).toFixed(2);
    let time = TimeService.MillisecondsToTimerString(average);
    console.info(`Total Time : ${total}, Average : ${time}`);
    return time;
  }

  /**
   * Print Average Turnaround Times
   */
  PrintAverageTurnaround() {
    OTHERSHEETS.Metrics.getRange(6, 2, 1, 2).setValues([[ `Average Checkout Length`, this.GetAverageTurnaround()]]);
  }

  /**
   * Sum all Statuses
   */
  StatusCounts() {
    let count = {};
    GetColumnDataByHeader(SHEETS.Main, HEADERNAMES.status)
      .forEach((keys) => count[keys] = ++count[keys] || 1);
    console.info(`Status Counts: ${JSON.stringify(count, null, 4)}`);
    return count;
  }

  /**
   * Print Status Counts
   */
  PrintStatusCounts() {
    let counts = this.StatusCounts();
    Object.entries(counts).forEach(([key, value], index) => {
      // console.warn(`Key: ${key}, Value: ${value}`);
      if(key == STATUS.checkedIn) {
        OTHERSHEETS.Metrics.getRange(5, 2, 1, 2).setValues([[ `Currently Checked In`, value ]]);
      } else if(key == STATUS.checkedOut) {
        OTHERSHEETS.Metrics.getRange(4, 2, 1, 2).setValues([[ `Currently Checked Out`, value ]]);
      } else if(key == STATUS.overdue) {
        OTHERSHEETS.Metrics.getRange(11, 2, 1, 2).setValues([[ `Currently Overdue`, value ]]);
      }
    });
  }

  /**
   * Calculate the distribution of occurrances in a list
   * How many times does some value show up in a list?
   */
  GetDistribution(sheet, headername) {
    let list = GetColumnDataByHeader(sheet, headername)
      .filter(Boolean);

    let occurrences = list.reduce( (acc, curr) => {
      return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
    }, {});
    let items = Object.keys(occurrences).map((key) => {
      if (key != "" || key != undefined || key != null) {
        return [key, occurrences[key]];
      }
    });
    items.sort((first, second) => second[1] - first[1]);
    return items;  
  }

  /**
   * Print Top Ten
   */
  PrintTopTen() {
    const distribution = this.GetDistribution(OTHERSHEETS.Record, `Name`);

    // Create a new array with only the first 10 items
    let chop = distribution.slice(0, 11);
    const chop2 = chop.map((list, i) => [i + 1, ...list]);
    console.info(chop2);
    OTHERSHEETS.Metrics.getRange(16, 1, chop.length, 3).setValues(chop2);
  }

  /**
   * Calculate the total number of checkouts
   */
  CountTotalCheckouts() {
    let count = OTHERSHEETS.Record.getLastRow() - 1;
    console.info(`Total Count : ${count}`);
    OTHERSHEETS.Metrics.getRange(7, 2, 1, 2).setValues([[ `Total Checkouts`, count ]]);
    return count;
  }

  /**
   * Count all unique users who have checked out an item
   */
  CountUniqueUsers() {
    let users = GetColumnDataByHeader(OTHERSHEETS.Record, `Name`);
    const count = new Set(users).size;
    console.info(`Number of Users -----> ${count}`);
    OTHERSHEETS.Metrics.getRange(8, 2, 1, 2).setValues([[ `Number of Unique Users`, count ]]);
    return count;
  }

  /**
   * Standard Deviation of All Users and their checkout counts
   */
  GetStandardDeviation() {
    const distribution = this.GetDistribution(OTHERSHEETS.Record, `Name`);
    const n = distribution.length;

    const data = [];
    distribution.forEach(item => data.push(item[1]));
      
    const mean = data.reduce((a, b) => a + b) / n;
    const standardDeviation = Math.sqrt(data.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
    const truncatedDeviation = Number(standardDeviation).toFixed(3);

    console.info(`Standard Deviation for Number of Submissions : +/- ${truncatedDeviation}`);
    OTHERSHEETS.Metrics.getRange(10, 2, 1, 2).setValues([[ `Standard Deviation of Checkouts to Users`, `+/- ${truncatedDeviation}` ]]);
    return truncatedDeviation;
  }

  /**
   * Arithmetic Mean
   */
  GetArithmeticMean(sheet, headername) {
    sheet = sheet ? sheet : OTHERSHEETS.Record;
    headername = headername ? headername : `Name`;
    const distribution = this.GetDistribution(sheet, headername);
    const n = distribution.length;

    const data = []
    distribution.forEach(item => data.push(item[1]));
      
    let mean = data.reduce((a, b) => a + b) / n;

    console.info(`Mean = ${mean}`);
    OTHERSHEETS.Metrics.getRange(9, 2, 1, 2).setValues([[ `Average Checkouts per Users`, mean ]]);
    return mean;
  }

}


/**
 * -----------------------------------------------------------------------------------------------------------------
 * Run Metrics
 */
const Metrics = () => {
  const calculate = new Calculate();
  try {
    console.warn(`Calculating Metrics .... `);
    calculate.PrintAverageTurnaround();
    calculate.PrintStatusCounts();
    calculate.PrintTopTen();
    calculate.CountUniqueUsers();
    calculate.GetStandardDeviation();
    calculate.GetArithmeticMean();
    calculate.StatusCounts();
    console.warn(`Recalculated Metrics`);
  }
  catch (err) {
    console.error(`${err} : Couldn't generate statistics...`);
  }
}


/**
 * -----------------------------------------------------------------------------------------------------------------
 * Testing for Metrics
 */
const PrintAllTurnarounds = () => {
  let outs = GetColumnDataByHeader(SHEETS.Main, HEADERNAMES.dateCheckedOut);
  let returns = GetColumnDataByHeader(SHEETS.Main, HEADERNAMES.dateReturned);
  outs.forEach( async (timeOut, index) => {
    if(timeOut && returns[index]) {
      console.info(index + 2);    
      let time = await TimeService.Duration(timeOut, returns[index]);
      SetByHeader(SHEETS.Main, HEADERNAMES.remainingDays, index + 2, time);
    }
  })
}

const PrintTurnaround = async (row) => {
  const dateCheckedOut = GetByHeader(SHEETS.Main, HEADERNAMES.dateCheckedOut, row);
  const datecheckedIn = GetByHeader(SHEETS.Main, HEADERNAMES.dateReturned, row);
  if(dateCheckedOut && datecheckedIn) {
    const time = await TimeService.Duration(dateCheckedOut, datecheckedIn);
    await SetByHeader(SHEETS.Main, HEADERNAMES.remainingDays, row, time);
  }
}

const _testCalc = () => {
  const c = new Calculate();
  // c.GetArithmeticMean(OTHERSHEETS.Record, `Name`);
  c.GetArithmeticMean();
}





