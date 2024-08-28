/**
 * -----------------------------------------------------------------------------------------------------------------
 * Send an Email
 * @required {string} Student Email
 * @required {string} Status
 */
class Emailer {
  constructor({ 
    trackingNumber : trackingNumber = `1001`,
    status : status = STATUS.checkedOut,
    name : name = `Your Name`,
    email : email = SERVICE_EMAIL, 
    checkedOutDate : checkedOutDate = new Date().toDateString(),
    returnedDate : returnedDate = new Date().toDateString(),
    remainingDays : remainingDays = `0 days`,
    dueDate : dueDate, 
    designspecialist : designspecialist,
  }) {
    this.trackingNumber = trackingNumber;
    this.status = status;
    this.name = name;
    this.email = email;
    this.checkedOutDate = checkedOutDate;
    this.returnedDate = returnedDate;
    this.dueDate = dueDate ? new Date(dueDate).toDateString() : new Date(new TimeConverter().ReturnDate(this.checkedOutDate)).toDateString();
    this.remainingDays = remainingDays ? remainingDays : `0 days`;
    this.designspecialist = designspecialist ? designspecialist : `Staff`;
    this.designspecialistemail = this.designspecialist ? DSInfo(this.designspecialist).email : SERVICE_EMAIL;
    this.designspecialistemaillink = this.designspecialist ? DSInfo(this.designspecialist).emailLink : `<a href="mailto:${SERVICE_EMAIL}">${SERVICE_EMAIL}</a>`;
    /** @private */
    this.message = new CreateMessage({
      name : this.name, 
      trackingNumber : this.trackingNumber,
      checkedOutDate : this.checkedOutDate,
      returnedDate : this.returnedDate,
      remainingDays : this.remainingDays, 
      dueDate : this.dueDate,
      designspecialist : this.designspecialist,
    });
    this.SendEmail();
  }

  SendEmail () {
    try {
      switch (this.status) {
        case STATUS.requested:
          MailApp.sendEmail(this.email, `${SERVICE_NAME_NO_ICON} : Tools Requested`, "", {
            htmlBody: this.message.requestedMessage,
            from: SERVICE_EMAIL,
            cc: this.designspecialistemail,
            bcc: SERVICE_EMAIL,
            name: SERVICE_NAME_NO_ICON,
          });
          console.warn(`Student ${this.name} emailed ${this.status} message...`);
          break;
        case STATUS.checkedOut:
          MailApp.sendEmail(this.email, `${SERVICE_NAME_NO_ICON} : Tools Checked Out`, "", {
            htmlBody: this.message.checkedOutMessage,
            from: SERVICE_EMAIL,
            cc: this.designspecialistemail,
            bcc: SERVICE_EMAIL,
            name: SERVICE_NAME_NO_ICON,
          });
          console.warn(`Student ${this.name} emailed ${this.status} message...`);
          break;
        case STATUS.checkedIn:
          MailApp.sendEmail(this.email, `${SERVICE_NAME_NO_ICON} : Tools Returned`, "", {
              htmlBody: this.message.returnedMessage,
              from: SERVICE_EMAIL,
              cc: this.designspecialistemail,
              bcc: SERVICE_EMAIL,
              name: SERVICE_NAME_NO_ICON,
          });
          console.warn(`Student ${this.name} emailed ${this.status} message...`);
          break;
        case STATUS.overdue:
          MailApp.sendEmail(this.email, `${SERVICE_NAME_NO_ICON} : Tools OVERDUE!!`, "", {
              htmlBody: this.message.overdueMessage,
              from: SERVICE_EMAIL,
              cc: this.designspecialistemail,
              bcc: SERVICE_EMAIL,
              name: SERVICE_NAME_NO_ICON,
          });
          console.warn(`Student ${this.name} emailed ${this.status} message...`);
          break;
        case "":
        case undefined:
          console.warn(`Student ${this.name} NOT emailed...`);
          break;
      }
      return 0;
    } catch(err) {
      console.error(`"SendEmail()" failed: ${err}`);
      return 1;
    }
  }
}

/**
 * -----------------------------------------------------------------------------------------------------------------
 * Unit Test for Emailer
 */
const _testEmailer = () => {
  Object.values(STATUS).forEach(async (status) => {
    await new Emailer({
      trackingNumber : `1000001`,
      checkedOutDate : new Date(),
      returnedDate : new Date(),
      email : "codyglen@berkeley.edu",
      status : status,
      name : `Dingus Dongus`,
    })
  })
}











