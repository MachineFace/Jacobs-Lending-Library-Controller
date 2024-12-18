/**
 * -----------------------------------------------------------------------------------------------------------------
 * Code Enumerations
 */
const SERVICE_NAME = `Jacobs LendingBot`;
const SERVICE_NAME_WITH_ICON = `🤖 ${SERVICE_NAME}`;
const SERVICE_EMAIL = `jacobs-project-support@berkeley.edu`;

/** @private */
const THIS_SPREADSHEET = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty(`SPREADSHEET_ID`));

const CHECKOUT_LENGTH = 14; // How many days a student can hold a headset
const PICKUP_HOURS = `Monday - Friday: 11am - 1pm & 4pm - 6pm.`;

/**
 * Colors
 */
const COLORS = Object.freeze({
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
});

/**
 * Response Codes
 */
const RESPONSECODES = Object.freeze({
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
});

/**
 * Affilliation
 */
const AFFILLIATION = Object.freeze({
  researcher : `Researcher`,
  desinvfaculty : `DES INV Faculty`,
  faculty : `Jacobs-affiliated Course Faculty`,
  mdes : `MDES Student`,
  desinv : `DES INV Student`,
  scholar : `Jacobs Engineering Design Scholar`,
  catalyst : `Innovation Catalysts Grantee`,
  staff : `Jacobs Staff (Including Work-studies)`,
  students : `Students in Jacobs-affiliated courses (NON-DES INV)`,
  club : `Club and/or Team`,
  other : `Other: Berkeley Faculty, Berkeley Staff`,
  generalStudents : `General Students`,
});

/**
 * Status
 */
const STATUS = Object.freeze({
  requested : `Requested`,
  checkedOut : `Checked Out`,
  checkedIn : `Checked In`,
  overdue : `Overdue!`,
  reserved : `Reserved`,
  missing : `Missing`,
});

/**
 * Headernames
 */
const HEADERNAMES = Object.freeze({
  tracking: `Tracking Number`,
  status: `Status`,
  issuer: `Issuer`,
  timestamp: `Timestamp`,
  studentEmail: `Email Address`,
  name: `What is your name?`,
  studentId: `What is your Student ID Number?`,
  affiliation: `What is your affiliation to the Jacobs Institute?`,
  itemBasket: `Please select the tools you would like to check out.`,
  dateCheckedOut: `Date Checked Out`,
  dateReturned: `Date Returned`,
  ticket: `Ticket`,
  barcode: `Barcode`,
  notes: `Notes`,
  dueDate: `Due Date`,
  remainingDays: `Days Remaining Until Overdue`,
  checkedOutCount: `Number of Times Checked Out`,
});

/**
 * Sheets
 */
const SHEETS = Object.freeze({
  Main : THIS_SPREADSHEET.getSheetByName(`Main`),
});

/**
 * Other Sheets
 */
const OTHERSHEETS = Object.freeze({
  Scanner :   THIS_SPREADSHEET.getSheetByName(`Pickup Scanner`),
  Staff :     THIS_SPREADSHEET.getSheetByName(`StaffList`),
  Logger :    THIS_SPREADSHEET.getSheetByName(`Logger`),
  Metrics :   THIS_SPREADSHEET.getSheetByName(`Metrics`),
  Record :    THIS_SPREADSHEET.getSheetByName(`CheckOut Record`),
  Inventory : THIS_SPREADSHEET.getSheetByName(`Inventory`),
});

/**
 * Drive Folders
 */
const DRIVEFOLDERS = Object.freeze({
  ticketfolder : PropertiesService.getScriptProperties().getProperty(`DRIVE_FOLDER`),
});

/**
 * Forms
 */
const FORM = Object.freeze({
  id : PropertiesService.getScriptProperties().getProperty(`FORM`),
  url : PropertiesService.getScriptProperties().getProperty(`DRIVE_FOLDER_URL`),
});

/**
 * Page Sizes
 */
const PAGESIZES = Object.freeze({
  letter: {width: 612.283, height: 790.866},
  tabloid: {width: 790.866,height: 1224.57},
  statement: {width: 396.85, height: 612.283},
  a3: {width: 841.89, height: 1190.55},
  a4: {width: 595.276, height: 841.89},
  a5: {width: 419.528, height: 595.276},
  custom: {width: 204.000, height: 566.000},
});




