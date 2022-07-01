/**
 * -----------------------------------------------------------------------------------------------------------------
 * Send an Email
 * @required {string} Student Email
 * @required {string} Status
 */
class Emailer
{
  constructor({ 
    trackingNumber = `1000001`,
    status = STATUS.checkedOut,
    name = `Your Name`,
    email = `Your Email`, 
    checkedOutDate = new Date().toDateString(),
    returnedDate = new Date().toDateString(),
    dueDate, 
    designspecialist,
  }) {
    this.trackingNumber = trackingNumber ? trackingNumber : `1000001`;
    this.status = status ? status : STATUS.checkedOut;
    this.name = name ? name : `Your Name`;
    this.email = email ? email : `jacobsprojectsupport@berkeley.edu`;
    this.gmailName = `Jacobs Lending Library Tracking Bot`;
    this.checkedOutDate = checkedOutDate ? checkedOutDate.toDateString() : new Date().toDateString();
    this.returnedDate = returnedDate ? returnedDate.toDateString() : new Date().toDateString();
    this.dueDate = dueDate ? new Date(dueDate).toDateString() : new Date(new TimeConverter().ReturnDate(this.checkedOutDate)).toDateString();

    this.supportAlias = GmailApp.getAliases()[0];
    this.designspecialist = designspecialist ? designspecialist : `Staff`;
    this.designspecialistemail = this.designspecialist ? DSInfo(this.designspecialist).email : `jacobsprojectsupport@berkeley.edu`
    this.designspecialistemaillink = this.designspecialist ? DSInfo(this.designspecialist).emailLink : `<a href="mailto:jacobsprojectsupport@berkeley.edu">jacobsprojectsupport@berkeley.edu</a>`;

    this.message = new CreateMessage({
      name : this.name, 
      trackingNumber : this.trackingNumber,
      checkedOutDate : this.checkedOutDate,
      returnedDate : this.returnedDate, 
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
        GmailApp.sendEmail(this.email, `${this.gmailName} : Headset Checked Out`, "", {
          htmlBody: this.message.checkedOutMessage,
          from: this.supportAlias,
          cc: this.designspecialistemail,
          bcc: "",
          name: this.gmailName,
        });
        console.warn(`Student ${this.name} emailed ${this.status} message...`);
        break;
      case STATUS.checkedIn:
        GmailApp.sendEmail(this.email, `${this.gmailName} : Headset Returned`, "", {
            htmlBody: this.message.returnedMessage,
            from: this.supportAlias,
            cc: this.designspecialistemail,
            bcc: "",
            name: this.gmailName,
        });
        console.warn(`Student ${this.name} emailed ${this.status} message...`);
        break;
      case STATUS.overdue:
        GmailApp.sendEmail(this.email, `${this.gmailName} : Headset OVERDUE`, "", {
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


/** 
 * @NOTIMPLEMENTED
const CountTotalEmailsSent = async () => {
  let count = 0;
  try {
    let pageToken;
    do {
      const threadList = Gmail.Users.Threads.list('me', {
        q: `label:Jacobs Project Support/JPS Notifications`,
        pageToken: pageToken
      });
      count += threadList.threads.length;
      // if (threadList.threads && threadList.threads.length > 0) {
      //   threadList.threads.forEach(thread => {
      //     console.info(`Snip: ${thread.snippet}`);
      //   });
      // }
      pageToken = threadList.nextPageToken;
    } while (pageToken);
  } catch (err) {
    console.error(`Whoops ----> ${err}`);
  }
  console.warn(`Total Emails Sent : ${count}`);
  return count;
}
*/


/**
 * @NOTIMPLEMENTED
const ListInboxSnippets = () => {
  try {
    let pageToken;
    do {
      const threadList = Gmail.Users.Threads.list('me', {
        q: `label:inbox`,
        pageToken: pageToken
      });
      if (threadList.threads && threadList.threads.length > 0) {
        threadList.threads.forEach(thread => {
          console.info(`Snip: ${thread.snippet}`);
        });
      }
      pageToken = threadList.nextPageToken;
    } while (pageToken);
  } catch (err) {
    console.error(`Whoops ----> ${err}`);
  }
}
*/









