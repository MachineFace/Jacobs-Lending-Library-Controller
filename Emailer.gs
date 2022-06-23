/**
 * -----------------------------------------------------------------------------------------------------------------
 * Send an Email
 * @required {string} Student Email
 * @required {string} Status
 */
class Emailer
{
  constructor({ 
    headsetID,
    status,
    name,
    email, 
    checkedOutDate,
    returnedDate,
    dueDate, 
    designspecialist,
    designspecialistemail,
    designspecialistemaillink, 
  }) {
    this.headsetID = headsetID ? headsetID : `1000001`;
    this.status = status ? status : STATUS.checkedOut;
    this.name = name ? name : `Your Name`;
    this.email = email ? email : `jacobsprojectsupport@berkeley.edu`;
    this.gmailName = `Jacobs Lending Library Tracking Bot`;
    this.checkedOutDate = checkedOutDate ? checkedOutDate.toDateString() : new Date().toDateString();
    this.returnedDate = returnedDate ? returnedDate.toDateString() : new Date().toDateString();
    this.dueDate = dueDate ? new Date(dueDate).toDateString() : new Date(new TimeConverter().ReturnDate(this.checkedOutDate)).toDateString();

    this.supportAlias = GmailApp.getAliases()[0];
    this.designspecialist = designspecialist ? designspecialist : `Staff`;
    this.designspecialistemail = designspecialistemail ? designspecialistemail : `jacobsprojectsupport@berkeley.edu`;
    this.designspecialistemaillink = designspecialistemaillink ? designspecialistemaillink : `<a href="mailto:jacobsprojectsupport@berkeley.edu">jacobsprojectsupport@berkeley.edu</a>`;

    this.message = new CreateMessage({
      name : this.name, 
      headsetID : this.headsetID,
      checkedOutDate : this.checkedOutDate,
      returnedDate : this.returnedDate, 
      dueDate : this.dueDate,
      designspecialist : this.designspecialist,
      designspecialistemaillink : this.designspecialistemaillink,
    });
    this.SendEmail();
  }

  SendEmail () {
    switch (this.status) {
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
      headsetID : `1000001`,
      checkedOutDate : new Date(),
      returnedDate : new Date(),
      email : "codyglen@berkeley.edu",
      status : status,
      name : `Dingus Dongus`,
      designspecialist : `Cody Glen`,
      designspecialistemail : `codyglen@berkeley.edu`,
      designspecialistemaillink : `<a href="mailto:codyglen@berkeley.edu">codyglen@berkeley.edu</a>`, 
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









