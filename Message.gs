/**
 * -----------------------------------------------------------------------------------------------------------------
 * Create Message
 * @param {string} name
 * @param {number} trackingNumber
 * @param {Date} checkedOutDate
 * @param {Date} returnedDate
 * @param {Date} dueDate
 * @param {string} remainingDays
 * @param {string} designspecialist
 */
class CreateMessage {
  constructor({
    name : name = `Student Name`, 
    trackingNumber : trackingNumber = `1000001`,
    checkedOutDate : checkedOutDate = new Date().toDateString(),
    returnedDate : returnedDate = new Date().toDateString(),
    dueDate : dueDate = new Date().toDateString(),
    remainingDays : remainingDays = `0 days`, 
    designspecialist : designspecialist = `Staff`, 
  }){
    /** @private */
    this.name = name;
    /** @private */
    this.trackingNumber = trackingNumber;
    /** @private */
    this.checkedOutDate = checkedOutDate;
    /** @private */
    this.returnedDate = returnedDate instanceof Date ? returnedDate.toDateString() : new Date().toDateString();
    /** @private */
    this.dueDate = dueDate ? new Date(dueDate).toDateString() : new Date(new TimeConverter().ReturnDate(this.checkedOutDate)).toDateString();
    /** @private */
    this.remainingDays = remainingDays;
    /** @private */
    this.designspecialist = designspecialist;
    /** @private */
    this.designspecialistemail = this.designspecialist ? DSInfo(this.designspecialist).email : `${SERVICE_EMAIL}`
    /** @private */
    this.designspecialistemaillink = this.designspecialist ? DSInfo(this.designspecialist).emailLink : `<a href="mailto:${SERVICE_EMAIL}">${SERVICE_EMAIL}</a>`;

    /** @private */
    this.greetings = `<p>Hi ${this.name},</p>`;
    /** @private */
    this.thanks = `Thank you for checking out tools with ${SERVICE_NAME_NO_ICON}<br/><br/>`;
    /** @private */
    this.location = `<b>Pick-up / Drop-off Location:<br/>
      <a href="https://www.google.com/maps/d/edit?mid=19_zxiFYyxGysWTUDnMZl27gPX9b--2gz&usp=sharing">Jacobs Hall LeRoy Ave. Main Entrance - Room 234 / Lobby.<br/>
      2530 Ridge Rd, Berkeley, CA 94709</a></b><br/><br/>`;
    /** @private */
    this.hours = `<b>Pick-up / Drop-off Hours:<br/>${PICKUP_HOURS}</b><br/><br/>`;
    /** @private */
    this.help = `If you have questions or need assistance please email ${this.designspecialistemaillink}.<br/>`;
    /** @private */
    this.salutations = `<p>Best,<br/>Jacobs Hall Staff</p>`;
    /** @private */
    this.survey = `<p><small>Please take a moment to take our survey so we can improve ${SERVICE_NAME}:<br/>
      <a href="https://docs.google.com/forms/d/1fICKWXj67v8k6EznXgkYz6qgiy45V8bV-X8dlRwRPDc/viewform">Take Survey</a></small></p>`;
  }
  get defaultMessage() {
    let message = this.greetings;
      message += `<p>`;
      message += this.thanks;
      message += this.help;
      message += `</p>`;
      message += this.salutations;
      message += this.survey;
    return message; 
  }
  get requestedMessage() {
    let message = this.greetings;
      message += `<p>`;
      message += this.thanks;
      message += `These tools <b><i>ID: ${this.trackingNumber}</i></b> can be picked up in person.<br/>`;
      message += `<br/>`;
      message += this.location;
      message += this.hours;
      message += this.help;
      message += `</p>`;
      message += this.salutations;
      message += this.survey;
    return message;
  }
  get checkedOutMessage() {
    let message = this.greetings;
      message += `<p>`;
      message += this.thanks;
      message += `These tools <b><i>ID: ${this.trackingNumber}</i></b> have been issued on ${this.checkedOutDate}.<br/>`;
      message += `Please return them <b>ON or BEFORE ${this.dueDate}.</b><br/>`;
      message += `Items can be returned here:<br/><br/>`;
      message += this.location;
      message += this.hours;
      message += this.help;
      message += `</p>`;
      message += this.salutations;
      message += this.survey;
    return message;
  }
  get returnedMessage() {
    let message = this.greetings;
      message += `<p>`;
      message += `Thank you for returning our tools on ${this.returnedDate}.<br />`;
      message += `These tools <b><i>ID: ${this.trackingNumber}</i></b> have been returned.<br/>`;
      message += this.help;
      message += `</p>`;
      message += this.salutations;
      message += this.survey;
    return message;
  }
  get overdueMessage() {
    let message = this.greetings;
      message += `<p>`;
      message += this.thanks;
      message += `<font style="color:#FF0000";><b>The tools <i>ID: ${this.trackingNumber}</i> were due back on ${this.dueDate}, and are now (${this.remainingDays}) OVERDUE.</b></font><br/>`;
      message += `<font style="color:#FF0000";><b>Please return these tools IMMEDIATELY.</b></font><br/>`;
      message += `Items can be returned here:<br/><br/>`;
      message += this.location;
      message += this.hours;
      message += this.help;
      message += `</p>`;
      message += this.salutations;
      message += this.survey;
    return message;
  }
}








