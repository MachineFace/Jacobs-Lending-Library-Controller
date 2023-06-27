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
  CalculateAverageTurnaround() {
    const timeFunc = new TimeConverter();
    let completionTimes = GetColumnDataByHeader(SHEETS.Main, HEADERNAMES.remainingDays)
      .filter(Boolean);

    let total = 0;
    completionTimes.forEach( time => {
      if(!time) total += 0;
      else total += timeFunc.TimerStringToMilliseconds(time);
    });
    console.info(total);

    // Average the totals (a list of times in minutes)
    let average = Number.parseFloat(total / culled.length).toFixed(2);
    let time = timeFunc.MillisecondsToTimerString(average);
    console.info(`Total Time : ${total}, Average : ${time}`);
    return time;
  }

  /**
   * Print Average Turnaround Times
   */
  PrintAverageTurnaround() {
    OTHERSHEETS.Metrics.getRange(`B6`).setValue(`Average Checkout Length`);
    OTHERSHEETS.Metrics.getRange(`C6`).setValue(this.CalculateAverageTurnaround());
  }

  /**
   * Sum all Statuses
   */
  StatusCounts() {
    let count = {};
    GetColumnDataByHeader(SHEETS.Main, HEADERNAMES.status)
      .filter(Boolean)
      .forEach((keys) => count[keys] = ++count[keys] || 1);
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
        OTHERSHEETS.Metrics.getRange(`B5`).setValue(`Currently Checked In`);
        OTHERSHEETS.Metrics.getRange(`C5`).setValue(value);
      } else if(key == STATUS.checkedOut) {
        OTHERSHEETS.Metrics.getRange(`B4`).setValue(`Currently Checked Out`);
        OTHERSHEETS.Metrics.getRange(`C4`).setValue(value);
      } else if(key == STATUS.overdue) {
        OTHERSHEETS.Metrics.getRange(`B11`).setValue(`Currently Overdue`);
        OTHERSHEETS.Metrics.getRange(`C11`).setValue(value);
      }
    });
  }

  /**
   * Calculate the distribution of occurrances in a list
   * How many times does some value show up in a list?
   */
  CalculateDistribution(sheet, headername) {
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
    items.sort((first, second) => {
      return second[1] - first[1];
    });
    items.forEach(item => console.info(item));
    return items;  
  }

  /**
   * Print Top Ten
   */
  PrintTopTen() {
    const distribution = this.CalculateDistribution(OTHERSHEETS.Record, `Name`);

    // Create a new array with only the first 10 items
    let chop = distribution.slice(0, 11);
    console.info(chop);

    chop.forEach((pair, index) => {
      console.info(`${pair[0]} -----> ${pair[1]}`);
      OTHERSHEETS.Metrics.getRange(16 + index, 1, 1, 1).setValue(index + 1);
      OTHERSHEETS.Metrics.getRange(16 + index, 2, 1, 1).setValue(pair[0]);
      OTHERSHEETS.Metrics.getRange(16 + index, 3, 1, 1).setValue(pair[1]);
    });
  }

  /**
   * Calculate the total number of checkouts
   */
  CountTotalCheckouts() {
    let count = OTHERSHEETS.Record.getLastRow() - 1;
    console.info(`Total Count : ${count}`);
    OTHERSHEETS.Metrics.getRange(`B7`).setValue(`Total Checkouts`);
    OTHERSHEETS.Metrics.getRange(`C7`).setValue(count);
    return count;
  }

  /**
   * Count all unique users who have checked out an item
   */
  CountUniqueUsers() {
    let users = GetColumnDataByHeader(OTHERSHEETS.Record, `Name`);
    const count = new Set(users).size
    console.info(`Number of Users -----> ${count}`);
    OTHERSHEETS.Metrics.getRange(`B8`).setValue(`Number of Unique Users`);
    OTHERSHEETS.Metrics.getRange(`C8`).setValue(count);
    return count;
  }

  /**
   * Standard Deviation of All Users and their checkout counts
   */
  CalculateStandardDeviation () {
    const distribution = this.CalculateDistribution(OTHERSHEETS.Record, `Name`);
    const n = distribution.length;

    const data = []
    distribution.forEach(item => data.push(item[1]));
      
    let mean = data.reduce((a, b) => a + b) / n;

    let standardDeviation = Math.sqrt(data.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
    console.info(`Standard Deviation for Number of Submissions : ${standardDeviation}`);
    OTHERSHEETS.Metrics.getRange(`B9`).setValue(`Standard Deviation of Checkouts to Users`);
    OTHERSHEETS.Metrics.getRange(`C9`).setValue(standardDeviation);
    return standardDeviation;
  }

  /**
   * Arithmetic Mean
   */
  CalculateArithmeticMean (sheet, headername) {
    const distribution = this.CalculateDistribution(sheet, headername);
    const n = distribution.length;

    const data = []
    distribution.forEach(item => data.push(item[1]));
      
    let mean = data.reduce((a, b) => a + b) / n;
    console.info(`Mean = ${mean}`);

    // OTHERSHEETS.Metrics.getRange(44, 3, 1, 1).setValue(mean);
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
    calculate.CalculateStandardDeviation();
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
  const t = new TimeConverter();
  let outs = GetColumnDataByHeader(SHEETS.Main, HEADERNAMES.dateCheckedOut);
  let returns = GetColumnDataByHeader(SHEETS.Main, HEADERNAMES.dateReturned);
  outs.forEach( async (timeOut, index) => {
    if(timeOut && returns[index]) {
      console.info(index + 2);    
      let time = await t.Duration(timeOut, returns[index]);
      SetByHeader(SHEETS.Main, HEADERNAMES.remainingDays, index + 2, time);
    }
  })
}

const PrintTurnaround = async (row) => {
  const t = new TimeConverter();
  const dateCheckedOut = GetByHeader(SHEETS.Main, HEADERNAMES.dateCheckedOut, row);
  const datecheckedIn = GetByHeader(SHEETS.Main, HEADERNAMES.dateReturned, row);
  if(dateCheckedOut && datecheckedIn) {
    const time = await t.Duration(dateCheckedOut, datecheckedIn);
    await SetByHeader(SHEETS.Main, HEADERNAMES.remainingDays, row, time);
  }
}

const _testCalc = () => {
  const c = new Calculate();
  c.CalculateArithmeticMean(OTHERSHEETS.Record, `Name`);
}





