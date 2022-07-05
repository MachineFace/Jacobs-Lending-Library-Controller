/**
 * -----------------------------------------------------------------------------------------------------------------
 * Class for Creating Response Messages
 * Properties accessed via 'this.receivedMessage' or 'this.failedMessage'
 * @param {string} name
 * @param {string} projectname
 * @param {number} jobnumber
 * @param {string} approvalURL
 * @param {number} material1Quantity
 * @param {number} material2Quantity
 * @param {string} designspecialist
 * @param {string} designspecialistemaillink
 */
class CreateMessage 
{
  constructor({
    name : name, 
    trackingNumber : trackingNumber,
    checkedOutDate : checkedOutDate,
    returnedDate : returnedDate,
    dueDate : dueDate,
    remainingDays : remainingDays, 
    designspecialist : designspecialist, 
    designspecialistemaillink : designspecialistemaillink,
  }){
    this.name = name ? name : `Student Name`;
    this.trackingNumber = trackingNumber ? trackingNumber : `1000001`;
    this.checkedOutDate = checkedOutDate instanceof Date ? checkedOutDate.toDateString() : new Date().toDateString();
    this.returnedDate = returnedDate instanceof Date ? returnedDate.toDateString() : new Date().toDateString();
    this.dueDate = dueDate ? new Date(dueDate).toDateString() : new Date(new TimeConverter().ReturnDate(this.checkedOutDate)).toDateString();
    this.remainingDays = remainingDays ? remainingDays : `0 days`;
    this.designspecialist = designspecialist ? designspecialist : `Staff`;
    this.designspecialistemail = this.designspecialist ? DSInfo(this.designspecialist).email : `jacobsprojectsupport@berkeley.edu`
    this.designspecialistemaillink = this.designspecialist ? DSInfo(this.designspecialist).emailLink : `<a href="mailto:jacobsprojectsupport@berkeley.edu">jacobsprojectsupport@berkeley.edu</a>`;
  }
  get defaultMessage() {
    let message = `<p>Hi ${this.name},</p>`;
      message += `<p>Thank you for checking out tools with Jacobs Project Support.<br/><br/>`;
      message += `If you have questions or need assistance please email ${this.designspecialistemaillink}. <br/></p>`;
      message += `<p>Best,<br />Jacobs Hall Staff</p>`;
    return message; 
  }
  get requestedMessage() {
    let message = `<p>Hi ${this.name},</p>`;
      message += `<p>Thank you for requesting to check out fabrication tools with Jacobs Project Support.<br />`;
      message += `These tools <b><i>ID: ${this.trackingNumber}</i></b> can be picked up in person.<br/>`;
      message += `<br/>`;
      message += `<b>Pick-up Location:<br/>`;
      message += `<a href="https://www.google.com/maps/d/edit?mid=19_zxiFYyxGysWTUDnMZl27gPX9b--2gz&usp=sharing">Jacobs Hall LeRoy Ave. Main Entrance - Room 234 / Lobby. <br/>`; 
      message += `2530 Ridge Rd, Berkeley, CA 94709</a><br/><br/></b>`;
      message += `<b>Pick-up Hours:<br/>`;
      message += `${PickupHours}</b><br/><br/>`
      message += `If you have questions or need assistance please email ${this.designspecialistemaillink}. <br/>`;
      message += `</p>`;
      message += `<p>Best,<br />Jacobs Hall Staff</p>`;
    return message;
  }
  get checkedOutMessage() {
    let message = `<p>Hi ${this.name},</p>`;
      message += `<p>Thank you for checking out fabrication tools with Jacobs Project Support on ${this.checkedOutDate}.<br />`;
      message += `These tools <b><i>ID: ${this.trackingNumber}</i></b> have been issued.<br/>`;
      message += `Please return them <b>ON or BEFORE ${this.dueDate}.</b><br/>`;
      message += `Items can be returned here:<br/><br/>`;
      message += `<b>Drop-off Location:<br/>`;
      message += `<a href="https://www.google.com/maps/d/edit?mid=19_zxiFYyxGysWTUDnMZl27gPX9b--2gz&usp=sharing">Jacobs Hall LeRoy Ave. Main Entrance - Room 234 / Lobby. <br/>`; 
      message += `2530 Ridge Rd, Berkeley, CA 94709</a><br/><br/></b>`;
      message += `<b>Drop-off Hours:<br/>`;
      message += `${PickupHours}</b><br/><br/>`
      message += `If you have questions or need assistance please email ${this.designspecialistemaillink}. <br/>`;
      message += `</p>`;
      message += `<p>Best,<br />Jacobs Hall Staff</p>`;
    return message;
  }
  get returnedMessage() {
    let message = `<p>Hi ${this.name},</p>`;
      message += `<p>Thank you for returning our tools on ${this.returnedDate}.<br />`;
      message += `These tools <b><i>ID: ${this.trackingNumber}</i></b> have been returned.<br/>`;
      message += `If you have questions or need assistance please email ${this.designspecialistemaillink}. <br/>`;
      message += `</p>`;
      message += `<p>Best,<br />Jacobs Hall Staff</p>`;
    return message;
  }
  get overdueMessage() {
    let message = `<p>Hi ${this.name},</p>`;
      message += `<p>Thank you for checking out tools with Jacobs Project Support on ${this.checkedOutDate}.<br />`;
      message += `<font style="color:#FF0000";><b>The tools <i>ID: ${this.trackingNumber}</i> were due back on ${this.returnedDate}, and are now (${this.remainingDays}) OVERDUE.</b></font><br/>`;
      message += `<font style="color:#FF0000";><b>Please return these tools IMMEDIATELY.</b></font><br/>`;
      message += `Items can be returned here:<br/><br/>`;
      message += `<b>Drop-off Location:<br/>`;
      message += `<a href="https://www.google.com/maps/d/edit?mid=19_zxiFYyxGysWTUDnMZl27gPX9b--2gz&usp=sharing">Jacobs Hall LeRoy Ave. Main Entrance - Room 234 / Lobby. <br/>`; 
      message += `2530 Ridge Rd, Berkeley, CA 94709</a><br/><br/></b>`;
      message += `<b>Drop-off Hours:<br/>`;
      message += `${PickupHours}</b><br/><br/>`
      message += `If you have questions or are having trouble returning the headset, please email ${this.designspecialistemaillink}. <br/>`;
      message += `</p>`;
      message += `<p>Best,<br />Jacobs Hall Staff</p>`;
    return message;
  }
}




/**
 * -----------------------------------------------------------------------------------------------------------------
 * Unit Test for Making 'OnEdit' Messages
 */
const _testMessages = async () => {
  console.time(`Execution Timer`);
  const message = new CreateMessage({
    name : `Stew Dent`, 
    trackingNumber : `1000001`,
    checkedOutDate : new Date(),
    returnedDate : new Date(), 
    remainingDays : `10 days`,
    designspecialist : `Cody`,
  })

  console.warn(`DEFAULT ---> ${message.defaultMessage}`);
  console.warn(`CHECKED OUT ---> ${message.checkedOutMessage}`);
  console.warn(`RETURNED ---> ${message.returnedMessage}`);
  console.warn(`OVERDUE ---> ${message.overdueMessage}`);

  console.timeEnd(`Execution Timer`);
  
}



