const scrapeTotalJobs = require('./totalJobsScraper');
const scrapeReedListings= require('./reedScraper');
const writeJobList = require('./library/writeJobList');




scrapeTotalJobs('https://www.totaljobs.com/jobs/work-from-home/react-remote?postedWithin=1')


scrapeReedListings('https://www.reed.co.uk/jobs/work-from-home-react-developer-jobs?dateCreatedOffSet=lastthreedays');
