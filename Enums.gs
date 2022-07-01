/**
 * -----------------------------------------------------------------------------------------------------------------
 * Code Enumerations
 */
const ServiceName = `🤖 Jacobs LendingBot`;
const ServiceNameNoIcon = `Jacobs LendingBot`;
const CheckoutLength = 14; // How many days a student can hold a headset
const PickupHours = `Monday - Friday: 11am - 1pm & 4pm - 6pm.`;

const COLORS = {
  green_light : `#d9ead3`,
  green : `74d975`, 
  green_dark : `#93c47d`, 
  green_dark_2 : `#38761d`,
  yellow_light : `#fff2cc`,
  yellow : `#f1c232`,
  yellow_dark : `#f1c232`,
  yellow_dark_2 : `#bf9000`,
  orange_light : `#fce5cd`,
  orange_bright : `#ff9900`,
  orange : `#f6b26b`,
  orange_dark : `#e69138`, 
  orange_dark_2 : `#b45f06`,
  red_light : `#f4cccc`, 
  red : `	#ff0000`,  
  red_dark : `#cc0000`,
  red_dark_2 : `#990000`,
  red_dark_berry_2 : `#85200c`,
  purle_light : `	#d9d2e9`,
  purple : `#b4a7d6`,
  purple_dark : `#20124d`,
  purple_dark_2 : `#351c75`,
  grey_light : `#efefef`,
  grey : `#cccccc`, 
  grey_dark : `#999999`,
  black : `#000000`,
}

const RESPONSECODES = {
	200 : `OK`,
	201 : `Created`,
	202 : `Accepted`,
	203 : `Non-Authoritative Information`,
	204 : `No Content`,
	205 : `Reset Content`,
	206 : `Partial Content`,
	207 : `Multi-Status (WebDAV)`,
	208 : `Already Reported (WebDAV)`,
	226 : `IM Used`,
	300 : `Multiple Choices`,
	301 : `Moved Permanently`,
	302 : `Found`,
	303 : `See Other`,
	304 : `Not Modified`,
	305 : `Use Proxy`,
	306 : `(Unused)`,
	307 : `Temporary Redirect`,
	308 : `Permanent Redirect (experimental)`,
 	400 : `Bad Request`,
	401 : `Unauthorized`,
	402 : `Payment Required`,
	403 : `Forbidden`,
	404 : `Not Found`,
	405 : `Method Not Allowed`,
	406 : `Not Acceptable`,
	407 : `Proxy Authentication Required`,
	408 : `Request Timeout`,
	409 : `Conflict`,
	410 : `Gone`,
	411 : `Length Required`,
	412 : `Precondition Failed`,
	413 : `Request Entity Too Large`,
	414 : `Request-URI Too Long`,
	415 : `Unsupported Media Type`,
	416 : `Requested Range Not Satisfiable`,
	417 : `Expectation Failed`,
	418 : `I'm a teapot (RFC 2324)`,
	420 : `Enhance Your Calm (Twitter)`,
	422 : `Unprocessable Entity (WebDAV)`,
	423 : `Locked (WebDAV)`,
	424 : `Failed Dependency (WebDAV)`,
	425 : `Reserved for WebDAV`,
	426 : `Upgrade Required`,
	428 : `Precondition Required`,
	429 : `Too Many Requests`,
	431 : `Request Header Fields Too Large`,
	444 : `No Response (Nginx)`,
	449 : `Retry With (Microsoft)`,
	450 : `Blocked by Windows Parental Controls (Microsoft)`,
	451 : `Unavailable For Legal Reasons`,
	499 : `Client Closed Request (Nginx)`,
	500 : `Internal Server Error`,
	501 : `Not Implemented`,
	502 : `Bad Gateway`,
	503 : `Service Unavailable`,
	504 : `Gateway Timeout`,
	505 : `HTTP Version Not Supported`,
	506 : `Variant Also Negotiates (Experimental)`,
	507 : `Insufficient Storage (WebDAV)`,
	508 : `Loop Detected (WebDAV)`,
	509 : `Bandwidth Limit Exceeded (Apache)`,
	510 : `Not Extended`,
	511 : `Network Authentication Required`,
	598 : `Network read timeout error`,
	599 : `Network connect timeout error`,
}

const STATUS = {
  checkedOut : `Checked Out`,
  checkedIn : `Checked In`,
  overdue : `Overdue!`,
}


const HEADERNAMES = {
	timestamp : `Timestamp`,	
	studentEmail : `Email Address`,	
	name : `What is your name?`,	
	studentId : `What is your Student ID Number?`,	
	affiliation : `What is your affiliation to the Jacobs Institute?`,	
	itemBasket : `Please select the tools you would like to check out.`,	
  tracking : `Tracking Number`,	
  status : `Status`,
  checkedOutBy : `Checked Out By`,	
  dateCheckedOut : `Date Checked Out`,	
  dateReturned : `Date Returned`,
  barcode : `Barcode`,
  ticket : `Ticket`,	
  notes : `Notes`,
  checkedOutCount : `Number of Times Checked Out`,
  dueDate : `Due Date`,
  remainingDays : `Days Remaining Until Overdue`,												
};

const SHEETS = {
  Main : SpreadsheetApp.getActiveSpreadsheet().getSheetByName(`Main`),
};

const OTHERSHEETS = {
  Scanner : SpreadsheetApp.getActiveSpreadsheet().getSheetByName(`Pickup Scanner`),
  Staff : SpreadsheetApp.getActiveSpreadsheet().getSheetByName(`StaffList`),
  Logger : SpreadsheetApp.getActiveSpreadsheet().getSheetByName(`Logger`),
  Metrics : SpreadsheetApp.getActiveSpreadsheet().getSheetByName(`Metrics`),
  Record : SpreadsheetApp.getActiveSpreadsheet().getSheetByName(`CheckOut Record`),
  Inventory : SpreadsheetApp.getActiveSpreadsheet().getSheetByName(`Inventory`),
}

const DRIVEFOLDERS = {
  barcodeTarget : DriveApp.getFolderById(`1jGfdwx4GwiMegVySKj28YW4XH_neI2Oz`),
}

const FORM = {
  location : `1FAIpQLSfEBfrAmisR-whlGRNX4Iip-QIQkZIsxU4Y8J4edrLUfr3YHA`,
  form : FormApp.openById(`1FAIpQLSfEBfrAmisR-whlGRNX4Iip-QIQkZIsxU4Y8J4edrLUfr3YHA`),
}



const PAGESIZES = {
  letter: {width: 612.283, height: 790.866},
  tabloid: {width: 790.866,height: 1224.57},
  statement: {width: 396.85, height: 612.283},
  a3: {width: 841.89, height: 1190.55},
  a4: {width: 595.276, height: 841.89},
  a5: {width: 419.528, height: 595.276},
  custom: {width: 204.000, height: 566.000},
}




