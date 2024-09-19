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
  AverageTurnaround() {
    let completionTimes = [...GetColumnDataByHeader(SHEETS.Main, HEADERNAMES.remainingDays)]
      .filter(Boolean);

    let total = 0;
    completionTimes.forEach( time => {
      if(!time) total += 0;
      else total += TimeService.TimerStringToMilliseconds(time);
    });

    let times = [];
    completionTimes.forEach(t => times.push(TimeService.TimerStringToMilliseconds(t)));
    let average = this.GeometricMean(times);
    let time = TimeService.MillisecondsToTimerString(average);
    console.info(`Total Time : ${TimeService.MillisecondsToTimerString(total)}, Average : ${time}`);
    OTHERSHEETS.Metrics.getRange(1, 6, 2, 1).setValues([[ `Average Checkout Length` ], [ time ]]);
    return time;
  }

  /**
   * Sum all Statuses
   */
  StatusCounts() {
    try {
      const statuses = [...GetColumnDataByHeader(SHEETS.Main, HEADERNAMES.status)];
      const distribution = [...this.Distribution(statuses)];
      const distSet = new Set(distribution.map(([key, _]) => key));

      let list = Object.values(STATUS);
      list.forEach(key => {
        if (!distSet.has(key)) {
          distribution.push([key, 0]);
        }
      });
      
      console.info(distribution);
      OTHERSHEETS.Metrics.getRange(1, 2, 1, 2).setValues([[ `Status`, `Count`, ]]);
      OTHERSHEETS.Metrics.getRange(2, 2, distribution.length, 2).setValues(distribution);
      return distribution;
    } catch(err) {
      console.error(`"StatusCounts()" failed: ${err}`);
      return 1;
    }
  }

  /**
   * Calculate Distribution
   * @param {Array} input array to calculate Distribution
   * @returns {[string, number]} sorted list of users
   */
  Distribution(data = []) {
    const occurrences = data.reduce( (acc, curr) => {
      return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
    }, {});

    let items = Object.keys(occurrences).map((key) => {
      if (key != "" || key != undefined || key != null || key != " ") {
        return [key, occurrences[key]];
      }
    });

    items.sort((first, second) => second[1] - first[1]);
    console.warn(items);
    return items;  
  }

  /**
   * Calculate the distribution of occurrances in a list
   * How many times does some value show up in a list?
   */
  GetDistributionFromSheet(sheet, headername) {
    let list = [...GetColumnDataByHeader(sheet, headername)]
      .filter(Boolean);
    let items = this.Distribution(list);
    return items;  
  }

  /**
   * Print Top Ten
   */
  PrintTopTen() {
    const distribution = this.GetDistributionFromSheet(OTHERSHEETS.Record, `Name`);

    // Create a new array with only the first 10 items
    let chop = distribution.slice(0, 11);
    const chop2 = chop.map((list, i) => [i + 1, ...list]);
    console.info(chop2);
    OTHERSHEETS.Metrics.getRange(1, 16, 1, 3).setValues([[`Place`, `Name`, `Number of Checkouts` ]]);
    OTHERSHEETS.Metrics.getRange(2, 16, chop.length, 3).setValues(chop2);
  }

  /**
   * Calculate the total number of checkouts
   */
  CountTotalCheckouts() {
    let count = OTHERSHEETS.Record.getLastRow() - 1;
    console.info(`Total Count : ${count}`);
    const values = [
      [ `Total Checkouts` ], 
      [ count ],
    ];
    OTHERSHEETS.Metrics.getRange(1, 8, 2, 1).setValues(values);
    return count;
  }

  /**
   * Count all unique users who have checked out an item
   */
  CountUniqueUsers() {
    let users = GetColumnDataByHeader(OTHERSHEETS.Record, `Name`);
    const count = new Set(users).size;
    console.info(`Number of Users -----> ${count}`);
    OTHERSHEETS.Metrics.getRange(1, 5, 2, 1).setValues([[ `Number of Unique Users`],[ count ]]);
    return count;
  }

  /**
   * Standard Deviation of All Users and their checkout counts
   */
  GetStandardDeviationOfSubmissions() {
    const distribution = this.GetDistributionFromSheet(OTHERSHEETS.Record, `Name`);
    const stdDev = this.StandardDeviation(distribution);
    const truncatedDeviation = Math.abs(Number(stdDev).toFixed(3) || 0);
    console.info(`Standard Deviation for Number of Submissions : +/- ${truncatedDeviation}`);
    const values = [
      [ `Standard Deviation of # of Checkouts Per User` ], 
      [ `+/- ${truncatedDeviation}` ],
    ];
    OTHERSHEETS.Metrics.getRange(1, 11, 2, 1).setValues(values);
    return truncatedDeviation;
  }

  /**
   * Calculate Standard Deviation
   * @param {Array} array of keys and values: "[[key, value],[]...]"
   * @returns {number} Standard Deviation
   */
  StandardDeviation(list = []) {
    try {
      const n = list.length;
      if(list.length < 2) throw new Error(`List is empty: ${n}`);

      let values = [];
      list.forEach(x => values.push(x[1]))

      const mean = this.GeometricMean(values);
      console.warn(`Mean = ${mean}`);

      const s = Math.sqrt(values.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
      const standardDeviation = Number(s - mean).toFixed(3);
      console.warn(`Standard Deviation: +/-${standardDeviation}`);
      return standardDeviation;
    } catch(err) {
      console.error(`"StandardDeviation()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Arithmetic Mean
   */
  GetArithmeticMean(sheet, headername) {
    sheet = sheet ? sheet : OTHERSHEETS.Record;
    headername = headername ? headername : `Name`;
    const distribution = this.GetDistributionFromSheet(sheet, headername);
    const n = distribution.length;

    const data = []
    distribution.forEach(item => data.push(item[1]));
      
    let mean = data.reduce((a, b) => a + b) / n;

    console.info(`Mean = ${mean}`);
    OTHERSHEETS.Metrics.getRange(9, 2, 1, 2).setValues([[ `Average Checkouts per Users`, mean ]]);
    return mean;
  }

  /**
   * Calculate Arithmetic Mean
   * @returns {number} arithmetic mean
   */
  ArithmeticMean(distribution = []) {
    try {
      const n = distribution.length;
      if(n == 0) throw new Error(`Distribution is empty: ${n}`);

      let values = [];
      distribution.forEach(x => values.push(x[1]))
      const mean = values.reduce((a, b) => a + b) / n;
      console.warn(`ARITHMETIC MEAN: ${mean}`);
      return mean.toFixed(3);
    } catch(err) {
      console.error(`"ArithmeticMean()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Geometric Mean
   * @param {Array} numbers
   * @returns {number} Geometric Mean
   */
  GeometricMean(numbers = []) {
    try {
      const n = numbers.length;
      if(n == 0) throw new Error(`Distribution is empty: ${n}`);
      const product = numbers.reduce((product, num) => product * num, 1);
      const geometricMean = Math.pow(product, 1 / n);
      console.warn(`GEOMETRIC MEAN: ${geometricMean}`);
      return geometricMean;
    } catch(err) {
      console.error(`"GeometricMean()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Harmonic Mean
   * @param {Array} numbers
   * @returns {number} Harmonic Mean
   */
  HarmonicMean(numbers = []) {
    try {
      const n = numbers.length;
      if(n == 0) throw new Error(`Distribution is empty: ${n}`);
      const harmonicMean = n / numbers.reduce((sum, num) => sum + 1 / num, 0);
      console.warn(`HERMONIC MEAN: ${harmonicMean}`);
      return harmonicMean;
    } catch(err) {
      console.error(`"HarmonicMean()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Quadratic Mean
   * @param {Array} numbers
   * @returns {number} Quadratic Mean
   */
  QuadraticMean(numbers = []) {
    try {
      const n = numbers.length;
      if(n == 0) throw new Error(`Distribution is empty: ${n}`);
      const quadraticMean = Math.sqrt(numbers.reduce((sum, num) => sum + num * num, 0) / n);
      console.warn(`QUADRATIC MEAN: ${quadraticMean}`);
      return quadraticMean;
    } catch(err) {
      console.error(`"QuadraticMean()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Median Mean
   * @param {Array} numbers
   * @returns {number} Median
   */
  Median(numbers = []) {
    try {
      const sortedNumbers = [...numbers].sort((a, b) => a - b);
      const middle = Math.floor(sortedNumbers.length / 2);
      const median = sortedNumbers.length % 2 === 0 ?
          (sortedNumbers[middle - 1] + sortedNumbers[middle]) / 2 :
          sortedNumbers[middle];

      console.warn(`MEDIAN: ${median}`);
      return median;
    } catch(err) {
      console.error(`"Median()" failed : ${err}`);
      return 1;
    }
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
    calculate.AverageTurnaround();
    calculate.StatusCounts();
    calculate.PrintTopTen();
    calculate.CountUniqueUsers();
    calculate.GetStandardDeviationOfSubmissions();
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
  c.PrintTopTen();
}





