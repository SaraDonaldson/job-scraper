const puppeteer = require('puppeteer');
const sortTitles = require('./library/sortTitles');
const autoScroll = require('./library/autoscroll');
const formatDescription = require('./library/formatDescription');



// async function autoScroll(page){
//     await page.evaluate(async () => {
//         await new Promise((resolve, reject) => {
//             var totalHeight = 0;
//             var distance = 100; // Should be less than or equal to window.innerHeight
//             var timer = setInterval(() => {
//                 var scrollHeight = document.body.scrollHeight;
//                 window.scrollBy(0, distance);
//                 totalHeight += distance;

//                 if(totalHeight >= scrollHeight){
//                     clearInterval(timer);
//                     resolve();
//                 }
//             }, 100);
//         });
//     });
// }


// ---------------------------------------------------------------------------------


async function scrapeJobListings(url) {

  //  -------- authwall ---------------

const AUTHWALL_PATH = 'linkedin.com/authwall';
const STATUS_TOO_MANY_REQUESTS = 429;



function throwErrorIfAuthwall(page, nowUrl) { 
      if (nowUrl.includes(AUTHWALL_PATH)) {
          console.error('Authwall error');
          throw {message: `Linkedin authwall! url: ${nowUrl}`, retry: true};
      }
  };

//  ---------------------------------


 const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
  
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 5000)); 
  const followUrl = page.url();
  await page.goto(url, { waitUntil: 'networkidle0' });
 

page.screenshot({path: 'screenshot.png'})
  await autoScroll(page);
  

    try {
      await page.waitForSelector('#main-content > section.two-pane-serp-page__results-list > ul > li > div', { visible: true });
    } catch (error) {
      console.log('Current URL:', followUrl);
      throwErrorIfAuthwall(newPage, followUrl) 
    }

 const jobListings = await page.evaluate(() => {
    const listings = [];
    document.querySelectorAll('#main-content > section.two-pane-serp-page__results-list > ul > li > div').forEach((listing) => {
      const jobTitle = listing.querySelector('div.base-search-card__info > h3.base-search-card__title')?.innerText;
      const companyName = listing.querySelector('div.base-search-card__info > h4.base-search-card__subtitle')?.innerText;
      const location = listing.querySelector('div.base-search-card__info > div.base-search-card__metadata > .job-search-card__location')?.innerText;
      const link = listing.querySelector('#main-content > section.two-pane-serp-page__results-list > ul > li > div > a')?.href;

      listings.push({ jobTitle, companyName, location, link });
    });
    return listings;
  });

  console.log("Job listings here:", jobListings, "there are: ", jobListings.length, " job results");
  
  const filteredJobListings = sortTitles(jobListings)




// Extract detailed Jobs
for (const listing of filteredJobListings) {
  const newPage = await browser.newPage();
  await newPage.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
  
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 5000)); 
  await newPage.goto(listing.link, { waitUntil: 'networkidle0' }); // 'networkidle0': consider navigation to be finished when there are no more than 0 network connections for at least 500 ms
  const currentUrl = newPage.url();
  await autoScroll(page);

  try {
    await page.waitForSelector('.core-section-container__content', { visible: true });
    
  } catch (error) {
    console.log('Current URL:', currentUrl);
    page.screenshot({path: `error${currentUrl}.png`})
    throwErrorIfAuthwall(newPage, currentUrl) 
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 5000)); 
    await newPage.goto(listing.link, { waitUntil: 'networkidle0' }); 
}
  
  
  // await page.waitForSelector('.core-section-container__content', { visible: true });
  // Now scrape the detailed information from this listing page.
  const detailedJobDescription = await page.evaluate(() => {
    // Extract details
    return  document.querySelector('.core-section-container__content')?.innerHTML      
  });

  let formattedDescription = formatDescription(detailedJobDescription, 'linkedIn');
  
  listing.jobDescription = formattedDescription;
  // return jobDescription;

  // console.log(detailedJobDescription); // Or push to an array to process later
  // listing.JobDetails = detailedJobDescription
  console.log(listing)
  await newPage.close();
}

//   console.log(jobDescriptions)

  await browser.close();
  // return 
}

// scrapeJobListings('https://www.linkedin.com/jobs/search/?f_E=2&f_TPR=r86400&f_WT=2&keywords=react%20developer&origin=JOB_SEARCH_PAGE_JOB_FILTER&refresh=true'); 
scrapeJobListings('https://www.linkedin.com/jobs/search?keywords=React%20Developer&location=United%20Kingdom&locationId=&geoId=101165590&f_TPR=r86400&f_E=2&f_WT=2&position=1&pageNum=0');

// scrapeJobListings('https://uk.linkedin.com/jobs/view/frontend-engineer-at-windranger-labs-3824547188?refId=gYu0ASJX1pU4iE5ZZUZUlQ%3D%3D&trackingId=c6ZbyJH2MdTYfsRbAz575A%3D%3D&position=1&pageNum=0&trk=public_jobs_jserp-result_search-card');