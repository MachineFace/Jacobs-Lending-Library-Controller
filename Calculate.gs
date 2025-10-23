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
      const average = StatisticsService.GeometricMean(completionTimes);
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
      const distribution = [...StatisticsService.Distribution(statuses)];
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
      const distribution = [...StatisticsService.Distribution(names)]
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
      const distribution = StatisticsService.Distribution(names);
      const stdDev = StatisticsService.StandardDeviation(distribution);
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
      const distribution = StatisticsService.Distribution(emails);
      const mean = StatisticsService.GeometricMean(distribution);

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





