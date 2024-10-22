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
  static AverageTurnaround() {
    try {
      const completionTimes = [...SheetService.GetColumnDataByHeader(SHEETS.Main, HEADERNAMES.remainingDays)]
        .filter(Boolean)
        .map(time => TimeService.TimerStringToMilliseconds(time));

      const average = Calculate.GeometricMean(completionTimes);
      const time = TimeService.MillisecondsToTimerString(average);

      const values = [
        [ `Average Checkout Length` ], 
        [ time ]
      ];
      console.info(values);
      OTHERSHEETS.Metrics.getRange(1, 6, 2, 1).setValues(values);
      return time;
    } catch(err) {
      console.error(`"AverageTurnaround()" failed: ${err}`);
      return 1;
    }

  }

  /**
   * Sum all Statuses
   */
  static StatusCounts() {
    try {
      const statuses = [...SheetService.GetColumnDataByHeader(SHEETS.Main, HEADERNAMES.status)];
      const distribution = [...Calculate.Distribution(statuses)];
      const distSet = new Set(distribution.map(([key, _]) => key));

      let list = Object.values(STATUS);
      list.forEach(key => {
        if (!distSet.has(key)) {
          distribution.push([key, 0]);
        }
      });
      
      const values = [
        [ `Status`, `Count`, ],
        ...distribution,
      ];
      console.info(distribution);
      OTHERSHEETS.Metrics.getRange(1, 2, values.length, 2).setValues(values);
      return distribution;
    } catch(err) {
      console.error(`"StatusCounts()" failed: ${err}`);
      return 1;
    }
  }

  /**
   * Print Top Ten
   */
  static PrintTopTen() {
    try {
      let names = [...SheetService.GetColumnDataByHeader(OTHERSHEETS.Record, `Name`)]
        .filter(Boolean)
        .filter(x => x[0] != `Testa Fiesta`);
      const distribution = [...Calculate.Distribution(names)]
        .slice(0, 11)
        .map((list, i) => [i + 1, ...list]);
      const values = [
        [ `Place`, `Name`, `Number of Checkouts` ],
        ...distribution,
      ];
      console.info(values);
      OTHERSHEETS.Metrics.getRange(1, 16, values.length, 3).setValues(values);
    } catch(err) {
      console.error(`"PrintTopTen()" failed: ${err}`);
      return 1;
    }
  }

  /**
   * Calculate the total number of checkouts
   */
  static CountTotalCheckouts() {
    try {
      const statuses = [...Calculate.StatusCounts()]
        .filter(x => x[0] == STATUS.checkedOut);
      const count = statuses[0][1];
      const values = [
        [ `Total Checkouts` ], 
        [ count ],
      ];
      console.info(values);
      OTHERSHEETS.Metrics.getRange(1, 8, 2, 1).setValues(values);
      return count;
    } catch(err) {
      console.error(`"CountTotalCheckouts()" failed: ${err}`);
      return 1;
    }
  }

  /**
   * Count all unique users who have checked out an item
   */
  static CountUniqueUsers() {
    try {
      let users = [...SheetService.GetColumnDataByHeader(OTHERSHEETS.Record, `Name`)];
      const count = new Set(users).size;
      const values = [
        [ `Number of Unique Users`],
        [ count ],
      ];
      console.info(values);
      OTHERSHEETS.Metrics.getRange(1, 5, 2, 1).setValues(values);
      return count;
    } catch(err) {
      console.error(`"CountUniqueUsers()" failed: ${err}`);
      return 1;
    }
  }

  /**
   * Standard Deviation of All Users and their checkout counts
   */
  static UserSubmissionStandardDeviation() {
    try {
      let names = [...SheetService.GetColumnDataByHeader(OTHERSHEETS.Record, `Name`)]
        .filter(Boolean);
      const distribution = Calculate.Distribution(names);
      const stdDev = Calculate.StandardDeviation(distribution);
      const truncatedDeviation = Math.abs(Number(stdDev).toFixed(3)) || 0;

      const values = [
        [ `Standard Deviation of # of Checkouts Per User` ], 
        [ `+/- ${truncatedDeviation}` ],
      ];
      console.warn(values);
      OTHERSHEETS.Metrics.getRange(1, 11, 2, 1).setValues(values);
      return truncatedDeviation;

    } catch(err) {
      console.error(`"UserSubmissionStandardDeviation()" failed: ${err}`);
      return 1;
    }
  }

  /**
   * Arithmetic Mean
   */
  static GetAverageCheckoutsPerUser() {
    try {
      let emails = [...SheetService.GetColumnDataByHeader(SHEETS.Main, HEADERNAMES.studentEmail)]
        .filter(Boolean);
      const distribution = Calculate.Distribution(emails);
      const mean = Calculate.GeometricMean(distribution);

      const values = [
        [ `Average Checkouts per User` ],
        [ mean ],
      ];
      console.warn(values);
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
  static Distribution(numbers = []) {
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
  static StandardDeviation(numbers = []) {
    try {
      if(numbers.length < 2) throw new Error(`List is empty: ${numbers.length}`);

      let values = [];
      if (Array.isArray(numbers[0])) values = numbers.map(item => item[1]);
      else values = numbers;

      const mean = Calculate.GeometricMean(values);
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
  static ZScore(distribution = [], stdDev = 0) {
    try {
      if(distribution.length < 2) throw new Error(`Distribution Empty: ${distribution.length}`);
      const mean = Calculate.GeometricMean(distribution);

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
  static Kurtosis(distribution = [], stdDev = 0) {
    try {
      if(distribution.length < 2) throw new Error(`Distribution Empty: ${distribution.length}`);

      const mean = Calculate.GeometricMean(distribution);

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
  static Skewness(distribution = [], stdDev = 0) {
    try {
      // Calculate the mean of the distribution
      const mean = Calculate.GeometricMean(distribution);

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
  static DetectOutliers(distribution = [], stdDev = 0, threshold = 3) {
    try {
      // Calculate the mean of the distribution
      const mean = Calculate.GeometricMean(distribution);

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
   * Quartiles
   * The list is divided into two halves for computing the lower (Q1) and upper (Q3) quartiles.
   * The median of the whole distribution is computed as Q2.
   * @param {Array} distribution [[key, value], [key, value]...]
   * @returns {Object} quartiles { q1 : value, q2 : value, q3 : value, }
   */
  static Quartiles(distribution = []) {
    try {
      const sorted = distribution
        .map(([key, value]) => value)
        .slice()
        .sort((a, b) => a - b);
      const len = sorted.length;

      // Split the sorted data into two halves
      const lowerHalf = sorted.slice(0, Math.floor(len * 0.5));
      const upperHalf = sorted.slice(Math.ceil(len * 0.5));

      // Calculate Q1, Q2 (median), and Q3
      const q1 = Calculate.Median(lowerHalf);
      const q2 = Calculate.Median(sorted);
      const q3 = Calculate.Median(upperHalf);

      return { 
        Q1 : q1, 
        Q2 : q2, 
        Q3 : q3, 
      }
    } catch(err) {
      console.error(`"Quartiles()" failed: ${err}`);
      return 1;
    }
  }

  /**
   * Calculate Arithmetic Mean
   * @returns {number} arithmetic mean
   */
  static ArithmeticMean(distribution = []) {
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
  static GeometricMean(numbers = []) {
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
  static HarmonicMean(numbers = []) {
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
  static QuadraticMean(numbers = []) {
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
  static Median(numbers = []) {
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
  try {
    console.warn(`Calculating Metrics .... `);
    Calculate.AverageTurnaround();
    Calculate.StatusCounts();
    Calculate.CountTotalCheckouts();
    Calculate.PrintTopTen();
    Calculate.CountUniqueUsers();
    Calculate.UserSubmissionStandardDeviation();
    Calculate.GetAverageCheckoutsPerUser();
    Calculate.StatusCounts();
    console.warn(`Recalculated Metrics`);
  } catch(err) {
    console.error(`${err} : Couldn't generate statistics...`);
  }
}


/**
 * -----------------------------------------------------------------------------------------------------------------
 * Testing for Metrics
 */
const PrintAllTurnarounds = () => {
  let outs = SheetService.GetColumnDataByHeader(SHEETS.Main, HEADERNAMES.dateCheckedOut);
  let returns = SheetService.GetColumnDataByHeader(SHEETS.Main, HEADERNAMES.dateReturned);
  outs.forEach( async (timeOut, index) => {
    if(timeOut && returns[index]) {
      console.info(index + 2);    
      let time = await TimeService.Duration(timeOut, returns[index]);
      SheetService.SetByHeader(SHEETS.Main, HEADERNAMES.remainingDays, index + 2, time);
    }
  })
}

const PrintTurnaround = async (row) => {
  const dateCheckedOut = SheetService.GetByHeader(SHEETS.Main, HEADERNAMES.dateCheckedOut, row);
  const datecheckedIn = SheetService.GetByHeader(SHEETS.Main, HEADERNAMES.dateReturned, row);
  if(dateCheckedOut && datecheckedIn) {
    const time = await TimeService.Duration(dateCheckedOut, datecheckedIn);
    SheetService.SetByHeader(SHEETS.Main, HEADERNAMES.remainingDays, row, time);
  }
}

const _testCalc = () => {
  Calculate.GetAverageCheckoutsPerUser();
}





