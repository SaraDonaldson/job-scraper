const fs = require('fs');

function writeCSV(jobData, fileName){
  

// Column headers
const headers = 'jobTitle;companyName;location;link;\n';

// data rows
const rows = []

jobData.forEach((jobListing) => {
   rows.push(`'"${jobListing.jobTitle}" ; "${jobListing.companyName}" ; "${jobListing.location}" ; ${jobListing.link} ;'`)
})
// console.log("ROWS: ", rows)
// Combine headers and rows. Each row is a new line.
const csvContent = headers + rows.join('\n');
// const path = `/path/to/your/directory/${fileName}.csv`;
path = `/Users/saradonaldson/dropbox/ZapierIntegrations/jobLists/${fileName}.csv`
// Write the CSV content to a file
fs.writeFileSync(path, csvContent);

}



module.exports =writeCSV;