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
   * Print Top Ten
   */
  PrintTopTen() {
    let names = [...GetColumnDataByHeader(OTHERSHEETS.Record, `Name`)]
      .filter(Boolean);
    const distribution = this.Distribution(names);

    // Create a new array with only the first 10 items
    let chop = distribution.slice(0, 11);
    const chop2 = chop.map((list, i) => [i + 1, ...list]);
    console.info(chop2);
    OTHERSHEETS.Metrics.getRange(1, 16, 1, 3).setValues([[ `Place`, `Name`, `Number of Checkouts` ]]);
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
    let names = [...GetColumnDataByHeader(OTHERSHEETS.Record, `Name`)]
      .filter(Boolean);
    const distribution = this.Distribution(names);
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
   * Arithmetic Mean
   */
  GetAverageCheckoutsPerUser() {
    try {
      let emails = [...GetColumnDataByHeader(SHEETS.Main, HEADERNAMES.studentEmail)]
        .filter(Boolean);
      const distribution = this.Distribution(emails);
      const mean = this.GeometricMean(distribution);
      console.info(`Mean = ${mean}`);

      const values = [
        [ `Average Checkouts per User` ],
        [ mean ],
      ];

      OTHERSHEETS.Metrics.getRange(1, 10, 2, 1).setValues(values);
      return mean;
    } catch(err) {
      console.error(`"GetAverageCheckoutsPerUser()" failed: ${err}`);
      return 1;
    }
  }



  /**
   * --------------------------------------------------------------------------------------------------------------
   */

  /**
   * Calculate Distribution
   * @param {Array} input array to calculate Distribution
   * @returns {[string, number]} sorted list of users
   */
  Distribution(numbers = []) {
    try {
      if(numbers.length < 2) throw new Error(`List is empty: ${numbers.length}`);
      let values = [];
      if (Array.isArray(numbers[0])) values = numbers.map(item => item[1]);
      else values = numbers;
      const occurrences = values.reduce( (acc, curr) => {
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
    } catch(err) {
      console.error(`"Distribution()" failed: ${err}`);
      return 1;
    }
  }


  /**
   * Calculate Standard Deviation
   * @param {Array} array of keys and values: "[[key, value],[]...]"
   * @returns {number} Standard Deviation
   */
  StandardDeviation(numbers = []) {
    try {
      if(numbers.length < 2) throw new Error(`List is empty: ${numbers.length}`);

      let values = [];
      if (Array.isArray(numbers[0])) values = numbers.map(item => item[1]);
      else values = numbers;

      const mean = this.GeometricMean(values);
      console.warn(`Mean = ${mean}`);

      const s = Math.sqrt(values.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / values.length);
      const standardDeviation = Number(s - mean).toFixed(3);
      console.warn(`Standard Deviation: +/-${standardDeviation}`);
      return standardDeviation;
    } catch(err) {
      console.error(`"StandardDeviation()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Z Scores for Each Distribution Entry
   * @param {Array} distribution [[key, value], [key, value], ... ]
   * @param {number} standard deviation
   * @returns {Array} ZScored Entries [[key, value, score], [key, value, score], ... ]
   */
  ZScore(distribution = [], stdDev = 0) {
    try {
      if(distribution.length < 2) throw new Error(`Distribution Empty: ${distribution.length}`);
      const mean = this.GeometricMean(distribution);

      // Compute the Z-Score for each entry
      const zScore = distribution.map(([key, value]) => {
        const zScore = (value - mean) / stdDev;
        return [key, value, zScore];
      });
      return zScore;
    } catch(err) {
      console.error(`"ZScore()" failed: ${err}`);
      return 1;
    }
  }

  /**
   * Kurtosis
   * Measures the "tailedness" of the data distribution.
   * High kurtosis means more outliers; Low kurtosis means fewer outliers.
   * @param {Array} distribution [[key, value], [key, value], ... ]
   * @param {number} standard deviation
   * @returns {number} Kurtosis Number
   */
  Kurtosis(distribution = [], stdDev = 0) {
    try {
      if(distribution.length < 2) throw new Error(`Distribution Empty: ${distribution.length}`);

      const mean = this.GeometricMean(distribution);

      // Calculate the fourth moment
      const fourthMoment = distribution.reduce((acc, curr) => {
        return acc + Math.pow(curr[1] - mean, 4);
      }, 0) / distribution.length;

      // Calculate variance (standard deviation squared)
      const variance = Math.pow(stdDev, 2);

      // Compute kurtosis
      const kurtosis = fourthMoment / Math.pow(variance, 2);

      // Excess kurtosis (subtract 3 to make kurtosis of a normal distribution zero)
      const excessKurtosis = kurtosis - 3;

      return excessKurtosis;
    } catch(err) {
      console.error(`"Kurtosis()" failed: ${err}`);
      return 1;
    }
  }

  /**
   * Skewness
   * Measures the asymmetry of the data distribution.
   * Positive skew means a long right tail; Negative skew means a long left tail.
   * @param {Array} distribution [[key, value], [key, value], ... ]
   * @param {number} standard deviation
   * @returns {number} Skewness Number
   */
  Skewness(distribution = [], stdDev = 0) {
    try {
      // Calculate the mean of the distribution
      const mean = this.GeometricMean(distribution);

      // Calculate the third moment
      const thirdMoment = distribution.reduce((acc, curr) => {
        return acc + Math.pow(curr[1] - mean, 3);
      }, 0) / distribution.length;

      // Calculate the skewness
      const skewness = thirdMoment / Math.pow(stdDev, 3);

      return skewness;
    } catch(err) {
      console.error(`"Skewness()" failed: ${err}`);
      return 1;
    }
  }

  /**
   * Detect Outliers
   * Outlier detection typically involves identifying data points that are far from the mean of a distribution, 
   * often using a threshold based on the standard deviation. 
   * A common method for detecting outliers is to flag values that are more than a certain number of standard deviations away from the mean. 
   * For example, values beyond 2 or 3 standard deviations can be considered outliers.
   * @param {Array} distribution [[key, value], [key, value], ... ]
   * @param {number} standard deviation
   * @param {number} threshold
   * @returns {Array} Outliers
   */
  DetectOutliers(distribution = [], stdDev = 0, threshold = 3) {
    try {
      // Calculate the mean of the distribution
      const mean = this.GeometricMean(distribution);

      // Find outliers
      const outliers = distribution.filter(x => {
        const diff = Math.abs(x[1] - mean);
        return diff > threshold * stdDev;
      });

      // Return the outliers as an array of [key, value] pairs
      return outliers;
    } catch(err) {
      console.error(`"DetectOutliers()" failed: ${err}`);
      return 1;
    }
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
      if (Array.isArray(distribution[0])) values = distribution.map(item => item[1]);
      else values = distribution;

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
      if(numbers.length < 2) throw new Error(`Distribution is empty: ${numbers.length}`);

      let values = [];
      if (Array.isArray(numbers[0])) values = numbers.map(item => item[1]);
      else values = numbers;

      const product = values.reduce((product, num) => product * num, 1);
      const geometricMean = Math.pow(product, 1 / values.length);
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
      if(numbers.length < 2) throw new Error(`Distribution is empty: ${numbers.length}`);
      
      let values = [];
      if (Array.isArray(numbers[0])) values = numbers.map(item => item[1]);
      else values = numbers;

      const harmonicMean = values.length / values.reduce((a, b) => a + 1 / b, 0);
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
      if(numbers.length < 2) throw new Error(`Distribution is empty: ${numbers.length}`);

      let values = [];
      if (Array.isArray(numbers[0])) values = numbers.map(item => item[1]);
      else values = numbers;

      const quadraticMean = Math.sqrt(values.reduce((a, b) => a + b * b, 0) / values.length);
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
      if(numbers.length < 2) throw new Error(`Input less than 2: ${numbers.length}`);

      let values = [];
      if (Array.isArray(numbers[0])) values = numbers.map(item => item[1]);
      else values = numbers;

      const sortedNumbers = [...values].sort((a, b) => a - b);
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
    calculate.CountTotalCheckouts();
    calculate.PrintTopTen();
    calculate.CountUniqueUsers();
    calculate.GetStandardDeviationOfSubmissions();
    calculate.GetAverageCheckoutsPerUser();
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
  c.GetAverageCheckoutsPerUser();
}





