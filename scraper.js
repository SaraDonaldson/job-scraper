const puppeteer = require('puppeteer');
const sortTitles = require('./library/sortTitles');
const autoScroll = require('./library/autoscroll');
const formatLinkedInDescription = require('./library/formatLinkedInDescription');


// ---------------------------------------------------------------------------------


async function scrapeJobListings(url) {

  //  -------- authwall ---------------

const AUTHWALL_PATH = 'linkedin.com/authwall';
const STATUS_TOO_MANY_REQUESTS = 429;
const CHROME_ERROR_PATH = 'chrome-error://chromewebdata/';

function throwErrorIfAuthwall(page, nowUrl) { 
      if (nowUrl.includes(AUTHWALL_PATH)) {
          console.error('Authwall error');
          console.log('Authwall error, at: ' , nowUrl)
          // throw {message: `Linkedin authwall! url: ${nowUrl}`, retry: true};
      }
  };

function throwErrorIfChromeError(page, nowUrl) { 
    if (nowUrl.includes(CHROME_ERROR_PATH)) {
        console.error('Chrome error');
        console.log('Chrome error, at: ' , nowUrl)
        // throw {message: `Chrome error at url: ${nowUrl}`, retry: true};
        
    }
};
//  ---------------------------------

  let  linkedinErrLog = [];
 const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.112 Safari/537.36');
  
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 5000)); 

  await page.goto(url, { waitUntil: 'networkidle0' });
  const followUrl = page.url();

  page.screenshot({path: 'screenshot.png'})
  console.log('URL after "go to":', followUrl);

  await autoScroll(page);

/*----------  Load Linked in Search page Successfully */
  const maxAttempts = 4
 loadSearchPage: for (let count = 0; count < maxAttempts; count++) {
    if( count === maxAttempts){
      console.log("Error: max attempts reached in accessing Linkedin search")
      linkedinErrLog.push({loadSearchFailure: "unsuccessful with max attempts"})
      return [];
    }
    try {
     let searchPageSuccess = await page.waitForSelector('#main-content > section.two-pane-serp-page__results-list > ul > li > div', { visible: true });
     if (searchPageSuccess){
        linkedinErrLog.push({loadSearch: `successful on ${count+1} attempts`})
        console.log(`Search page  load successful on ${count+1} attempts`)
        break loadSearchPage
      }
    } catch (error) {
      console.log('Current URL:', followUrl);
      throwErrorIfAuthwall(page, followUrl) 
      throwErrorIfChromeError(page, followUrl) 
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 5000)); 
      await page.goto(url, { waitUntil: 'networkidle0' });
    }
  }



 const jobListings = await page.evaluate(() => {
    const listings = [];
    console.log("looping through:  ", document.querySelectorAll('#main-content > section.two-pane-serp-page__results-list > ul > li > div').length, " results")
    document.querySelectorAll('#main-content > section.two-pane-serp-page__results-list > ul > li > div').forEach((listing, i) => {
      console.log("getting details for result ", i)
      const jobTitle = listing.querySelector('div.base-search-card__info > h3.base-search-card__title')?.innerText;
      const companyName = listing.querySelector('div.base-search-card__info > h4.base-search-card__subtitle')?.innerText;
      const location = listing.querySelector('div.base-search-card__info > div.base-search-card__metadata > .job-search-card__location')?.innerText;
      const link = listing.querySelector('#main-content > section.two-pane-serp-page__results-list > ul > li > div > a')?.href;

      const selectRef = link.split("refId=")[1]
      const id = selectRef.split('&')[0]

      listings.push({ id, jobTitle, companyName, location, link });
    });
    return listings;
  });

  // console.log("Job listings here:", jobListings, "there are: ", jobListings.length, " job results");
  
  const filteredJobListings = sortTitles(jobListings)




/* -----------------------------------------------------------------*/
/* -----------------------------------------------------------------*/
// Extract detailed Jobs
let listingsCount= 1;


getJobDescriptions: for (const listing of filteredJobListings) {

  const newPage = await browser.newPage();
  await newPage.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.112 Safari/537.36');
  
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 5000)); 
  await newPage.goto(listing.link, { waitUntil: 'networkidle0' }); // 'networkidle0': consider navigation to be finished when there are no more than 0 network connections for at least 500 ms
  const currentUrl = newPage.url();
  await autoScroll(newPage);



 pageLoad: for (let count = 0; count < maxAttempts; count++) {
    if( count === maxAttempts){
      linkedinErrLog.push([`${listing.id}`, `max attempts at reached in accessing Linkedin job link page`])
      console.log("Error: max attempts reached in accessing Linkedin job link page")
      continue getJobDescriptions;
    }
    console.log("Getting link ", listingsCount, " of ", filteredJobListings.length, " attempt: ", count+1);
    try {

      await page.waitForSelector('#main-content', { visible: true });
      await page.waitForSelector('#main-content > section', { visible: true }); 
      let jobLinkPageSucces= await page.waitForSelector('.core-section-container__content', { visible: true });
 

     if (jobLinkPageSuccess == "CdpElementHandle {handle: CdpJSHandle {},[Symbol(_isElementHandle)]: true}"){
        console.log("Job page load success: Listing ", listingsCount, " of ", filteredJobListings.length)
        break pageLoad;
      }

      if(currentUrl.includes(AUTHWALL_PATH)) {
        linkedinErrLog.push([`Page link ${listingsCount} Authwall Error: `, `Attempt ${count} accessing Linkedin job link page :`, `${listing.link}`])
        throwErrorIfAuthwall(page, nowUrl);
        console.error('Authwall error');
        page.screenshot({path: `errLIAuthWL${listingsCount}A${listingsCount}.png`});
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 5000)); 
        continue pageLoad 
      }
      if(currentUrl.includes(CHROME_ERROR_PATH)){
      throwErrorIfChromeError(newPage, currentUrl) 
       page.screenshot({path: `errLIChromeL${listingsCount}A${listingsCount}.png`});
       linkedinErrLog.push([`Page link ${listingsCount} Chrome Error: `, `Attempt ${count} accessing Linkedin job link page :`, `${listing.link}`])
       console.error('Chrome error');
       await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 5000)); 
       continue pageLoad 
      }
    } catch (error) {
      console.log('Error on linked in job page. URL:', newPage.url(), "ERR: ", error);
      page.screenshot({path: `liJobPageError.png`})
    // if(currentUrl.includes(AUTHWALL_PATH)) {
    //   linkedinErrLog.push([`Page link ${listingsCount} Authwall Error: `, `Attempt ${count} accessing Linkedin job link page :`, `${listing.link}`])
    //   throwErrorIfAuthwall(page, nowUrl);
    //   console.error('Authwall error');
    //   await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 5000)); 
    // }
    // if(currentUrl.includes(CHROME_ERROR_PATH)){
    // throwErrorIfChromeError(newPage, currentUrl) 
    //  page.screenshot({path: `liChromeError.png`});
    //  linkedinErrLog.push([`Page link ${listingsCount} Chrome Error: `, `Attempt ${count} accessing Linkedin job link page :`, `${listing.link}`])
    //  console.error('Chrome error');
    //  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 5000)); 
    // }
    continue pageLoad 
    
  }
}


  // Scrape the detailed information from this listing page
  const detailedJobDescription = await page.evaluate(() => {
    return  document.querySelector('.core-section-container__content')?.innerHTML      
  });

  // console.log(detailedJobDescription) 
  let formattedDescription = await formatLinkedInDescription(detailedJobDescription);
  
  listing.jobDescription = formattedDescription;
 


  // console.log(listing)
  await newPage.close();
}

  await browser.close();
  console.log(linkedinErrLog);
  return filteredJobListings
}

// scrapeJobListings('https://www.linkedin.com/jobs/search/?f_E=2&f_TPR=r86400&f_WT=2&keywords=react%20developer&origin=JOB_SEARCH_PAGE_JOB_FILTER&refresh=true'); 
// scrapeJobListings('https://www.linkedin.com/jobs/search?keywords=React%20Developer&location=United%20Kingdom&locationId=&geoId=101165590&f_TPR=r86400&f_E=2&f_WT=2&position=1&pageNum=0');

// scrapeJobListings('https://uk.linkedin.com/jobs/view/frontend-engineer-at-windranger-labs-3824547188?refId=gYu0ASJX1pU4iE5ZZUZUlQ%3D%3D&trackingId=c6ZbyJH2MdTYfsRbAz575A%3D%3D&position=1&pageNum=0&trk=public_jobs_jserp-result_search-card');

module.exports = scrapeJobListings;