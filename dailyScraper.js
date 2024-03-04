const scrapeTotalJobs = require('./totalJobsScraper');
const scrapeReedListings= require('./reedScraper');
const scrapeJobListings= require('./scraper');
const writeCSV = require('library/writeCSV')



async function dailyScraper() {

    let allResults

    let totalJobsResults = await scrapeTotalJobs('https://www.totaljobs.com/jobs/work-from-home/react-remote?postedWithin=1')
    allResults.push(totalJobsResults)

    let reedResults = await scrapeReedListings('https://www.reed.co.uk/jobs/work-from-home-react-developer-jobs?dateCreatedOffSet=lastthreedays');
    allResults.push(reedResults)

    let linkedInResults = await scrapeJobListings('https://www.linkedin.com/jobs/search?keywords=React%20Developer&location=United%20Kingdom&locationId=&geoId=101165590&f_TPR=r86400&f_E=2&f_WT=2&position=1&pageNum=0');
    allResults.push(linkedInResults)
   
    writeCSV(allResults)
}

dailyScraper