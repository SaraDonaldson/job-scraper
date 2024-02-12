const puppeteer = require('puppeteer');
const sortTitles = require('./library/sortTitles');
const autoScroll = require('./library/autoscroll');



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
 const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url);

//   await page.click('button.show-more-less-html__button.show-more-less-button.show-more-less-html__button--more');

//   const jobListing = await page.evaluate(() => {

//             const listingText = document.querySelector('section.core-section-container.my-3.description > div > div > section')?.innerText

//         return listingText


//   });


//   console.log(jobListing)

//    await page.waitForSelector('div.artdeco-global-alert-action__wrapper', { visible: true });
//   page.screenshot({path: 'screenshot.png'})
//   await page.click('div.artdeco-global-alert-action__wrapper > button:nth-child(2)');
//   page.screenshot({path: 'screenshotTwo.png'})
  
//  Extract job listings
page.screenshot({path: 'screenshot.png'})
  await autoScroll(page);
  

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
    await new Promise(resolve => setTimeout(resolve, 6000)); // 2000 milliseconds = 2 seconds
 
    await page.goto(listing.link, { waitUntil: 'networkidle0' }); // 'networkidle0': consider navigation to be finished when there are no more than 0 network connections for at least 500 ms
    
    await autoScroll(page);

    await page.waitForSelector('section.core-section-container.my-3.description > div > div > section', { visible: true });
    // Now scrape the detailed information from this listing page.
    const detailedJobDescription = await page.evaluate(() => {
        
      // Extract details
      const jobDescription =  document.querySelector('section.core-section-container.my-3.description > div > div > section > div')?.innerHTML
    
        
  
      return jobDescription;
    });
  
    // console.log(detailedJobDescription); // Or push to an array to process later
    listing. JobDetails = detailedJobDescription
    console.log(listing)
  }
//   console.log(jobDescriptions)

  await browser.close();
}

// scrapeJobListings('https://www.linkedin.com/jobs/search/?f_E=2&f_TPR=r86400&f_WT=2&keywords=react%20developer&origin=JOB_SEARCH_PAGE_JOB_FILTER&refresh=true'); 
scrapeJobListings('https://www.linkedin.com/jobs/search?keywords=React%20Developer&location=United%20Kingdom&locationId=&geoId=101165590&f_TPR=r86400&f_E=2&f_WT=2&position=1&pageNum=0');

// scrapeJobListings('https://uk.linkedin.com/jobs/view/frontend-engineer-at-windranger-labs-3824547188?refId=gYu0ASJX1pU4iE5ZZUZUlQ%3D%3D&trackingId=c6ZbyJH2MdTYfsRbAz575A%3D%3D&position=1&pageNum=0&trk=public_jobs_jserp-result_search-card');