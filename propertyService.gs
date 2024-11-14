/**
 * Set the document properties
 */
try {
  PropertiesService.getScriptProperties()
    .setProperties({
      SPREADSHEET_ID : `1IcBrLJ511mxN4skXBw3RalCvS9urZhk0WzKNPcf7I88`,
      DRIVE_FOLDER : `1DUpHmj0zxchXjhsrA7EfahuPcI9M0HqU`, 
      DRIVE_FOLDER_URL : `https://docs.google.com/forms/d/e/1FAIpQLSfEBfrAmisR-whlGRNX4Iip-QIQkZIsxU4Y8J4edrLUfr3YHA/viewform`,
      FORM : `17-Ll2AninOpRfapyNw6flEP2OlEQ0cYxfXAKlXcSbe0`,
    });
} catch (err) {
  console.log(`Failed with error: ${err.message}`);
}
