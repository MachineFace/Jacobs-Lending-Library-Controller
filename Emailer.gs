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
    email : email = `jacobsprojectsupport@berkeley.edu`, 
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
    this.gmailName = `Jacobs Lending Library Tracking Bot`;
    this.checkedOutDate = checkedOutDate;
    this.returnedDate = returnedDate;
    this.dueDate = dueDate ? new Date(dueDate).toDateString() : new Date(new TimeConverter().ReturnDate(this.checkedOutDate)).toDateString();
    this.remainingDays = remainingDays ? remainingDays : `0 days`;
    this.supportAlias = GmailApp.getAliases()[0];
    this.designspecialist = designspecialist ? designspecialist : `Staff`;
    this.designspecialistemail = this.designspecialist ? DSInfo(this.designspecialist).email : `jacobsprojectsupport@berkeley.edu`
    this.designspecialistemaillink = this.designspecialist ? DSInfo(this.designspecialist).emailLink : `<a href="mailto:jacobsprojectsupport@berkeley.edu">jacobsprojectsupport@berkeley.edu</a>`;
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
    switch (this.status) {
      case STATUS.requested:
        GmailApp.sendEmail(this.email, `${this.gmailName} : Tools Requested`, "", {
          htmlBody: this.message.requestedMessage,
          from: this.supportAlias,
          cc: this.designspecialistemail,
          bcc: "",
          name: this.gmailName,
        });
        console.warn(`Student ${this.name} emailed ${this.status} message...`);
        break;
      case STATUS.checkedOut:
        GmailApp.sendEmail(this.email, `${this.gmailName} : Tools Checked Out`, "", {
          htmlBody: this.message.checkedOutMessage,
          from: this.supportAlias,
          cc: this.designspecialistemail,
          bcc: "",
          name: this.gmailName,
        });
        console.warn(`Student ${this.name} emailed ${this.status} message...`);
        break;
      case STATUS.checkedIn:
        GmailApp.sendEmail(this.email, `${this.gmailName} : Tools Returned`, "", {
            htmlBody: this.message.returnedMessage,
            from: this.supportAlias,
            cc: this.designspecialistemail,
            bcc: "",
            name: this.gmailName,
        });
        console.warn(`Student ${this.name} emailed ${this.status} message...`);
        break;
      case STATUS.overdue:
        GmailApp.sendEmail(this.email, `${this.gmailName} : Tools OVERDUE!!`, "", {
            htmlBody: this.message.overdueMessage,
            from: this.supportAlias,
            cc: this.designspecialistemail,
            bcc: "",
            name: this.gmailName,
        });
        console.warn(`Student ${this.name} emailed ${this.status} message...`);
        break;
      case "":
      case undefined:
        console.warn(`Student ${this.name} NOT emailed...`);
        break;
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
      designspecialist : `Cody`,
    })
  })
}











