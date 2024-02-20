const fs = require('fs');

function writeReportLog(reportData){



    let fileContent = reportData
// Combine headers and rows. Each row is a new line.

// const path = `/path/to/your/directory/${fileName}.csv`;
path = `${date}webScrapeReport.txt`
// Write the CSV content to a file
fs.writeFileSync(path, fileContent);

}



module.exports =writeReportLog;