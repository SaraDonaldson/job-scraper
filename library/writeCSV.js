const fs = require('fs');

function writeCSV(jobData){
  
let today = Date.now()
let fileName = "jobs"+ today;
// Column headers
const headers = 'id;jobTitle;companyName;location;jobDescription;link\n';

// data rows
const rows = []
// create unique ids for each  job

jobData.forEach((jobListing) => {
   rows.push(`"${jobListing.id}" ; "${jobListing.jobTitle}" ; "${jobListing.companyName}" ;  "${jobListing.location}" ; "${jobListing.jobDescription}"; "${jobListing.link}"`)
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