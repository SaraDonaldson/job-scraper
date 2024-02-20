const fs = require('fs');
const markdown = require('markdown-it')();

function writeMarkDown(jobData){
// / Generate Markdown content for jobs
let markdownContent = "# Job Listings\n\n";
jobData.forEach(job => {
   
    markdownContent += `## ${job.jobTitle} posted by ${job.companyName}\n\n`;
    markdownContent += `**Location:** ${job.location}\n\n`;
    markdownContent += `**Link:** ${job.link} \n\n`;
    markdownContent += `**Job Description:**${job.jobDescription}\n\n`;
    markdownContent += '------------------------------------------------------ \n\n';
});

// Write Markdown content to a file
fs.writeFileSync('job_listings.md', markdown.render(markdownContent));

console.log('Markdown file has been generated.');

}


module.exports = writeMarkDown;