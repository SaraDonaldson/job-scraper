const puppeteer = require('puppeteer');
const sortTitles = require('./library/sortTitles');
const autoScroll = require('./library/autoscroll');
const writeCSV = require('./library/writeCSV');
const writeMarkDown = require('./library/writeMarkDown');
const formatDescription = require('./library/formatDescription');

//  if error then....
//  Note: error name... at ... point in process, error code?
//  screenshot, save screenshot pathname to error log
//  


async function scrapeTotalJobs(url) {
//  const browser = await puppeteer.launch();
    const browser = await puppeteer.launch({slowMo: 250}); // Slows down Puppeteer operations by 250ms
    const page = await browser.newPage();

    await page.goto(url);




    await page.screenshot({path: 'totalJobsLoadScreenshot.png'})

    await page.waitForSelector('#ccmgt_explicit_preferences', { visible: true });
    await page.click('div.options-button'); // Primary selector for the close button
    await page.screenshot({path: 'totalJobsinterim.png'})
    await page.waitForSelector('#ccmgt_preferences_reject', { visible: true });
    await page.click('#ccmgt_preferences_reject');


    await page.screenshot({path: 'totalJobsAfterPopupScreenshot.png'})

// //Close the popup/iframe
// //  try {
// //     await page.waitForSelector('#onetrust-accept-btn-handler', { visible: true });
// //     await page.click('#onetrust-accept-btn-handler'); // Primary selector for the close button
// //   } catch (error) {
// //     console.error("Couldn't close the pop-up with the primary selector. Trying alternative selectors...");
// //           const frame = await page.frames().find(f => f.url().includes('safeframe'));
// //   if (frame) {
// //     const closeButton = await frame.waitForSelector('#onetrust-accept-btn-handler', {visible: true});
// //     await closeButton.click();
// //   }
// //   }

    // await page.screenshot({path: 'totalJobsAfterPopupScreenshot.png'})

// Pagination
await page.waitForSelector('div.res-130ff2y > div > h1 > span.res-vurnku', { visible: true });
 const resultsTotal =  await page.evaluate(() => {
   return document.querySelector('div.res-130ff2y > div > h1 > span.res-vurnku').innerText
});
 const resultsNumber = Number(resultsTotal);
 const resultsPages = Math.ceil(resultsNumber/25)
 const pagination = resultsPages >= 2;

 console.log("there are ", resultsNumber, " results, ", resultsPages, " pages.  Pagination is: ", pagination);

 const allJobListings= []


 if(pagination){
 
        for (let i = 0; i < resultsPages ; i++) {
    //    need to loop through pages
    let lastPage = resultsPages-1
     await autoScroll(page);      
    
     // read and save data
    const paginatedListings = await page.evaluate(() => {
        const listings= []
        
        document.querySelectorAll('article.res-vxbpca ').forEach((listing) => {
            const rawJobTitle = listing.querySelector('article.res-vxbpca > div > h2').innerText
            const rawCompanyName = listing.querySelector('article.res-vxbpca > div > div > div.res-1r68twq')?.innerText;
            const rawLocation = listing.querySelector('article.res-vxbpca > div > div > div.res-qchjmw')?.innerText;
            const link = listing.querySelector('article.res-vxbpca > div > h2 > a')?.href;    
            const extractUrl = link.split('/')[5]
            const id = extractUrl.split("-")[this.length].replace("job", '')
           //  remove commas
           const jobTitle = rawJobTitle.replaceAll(",", " ")
           const  companyName = rawCompanyName.replaceAll(",", " ")
           const  location = rawLocation.replaceAll(",", " ")

       listings.push({ id, jobTitle, companyName, location, link });
       console.log({ id, jobTitle, companyName, location, link })
      
        });
 
        return listings;
      });
      console.log("reading listings from page: ", i+1, " of ", resultsPages)
        allJobListings.push(paginatedListings)
        
       
    // Navigate Pagination unless last page
          if(i != lastPage){

            //----- Navigation -> imitate human pagination clicks ---
              try {
                await page.waitForSelector('div.results-container > div.job-results-row > div.stst-rlr > div > div > div > div > div > nav > ul > li', { visible: true });
              } catch (error) {
                await page.screenshot({path: 'totalJobsError.png'})
                await page.waitForSelector('div.results-container > div.job-results-row > div.stst-rlr > div > div > div > div > div > nav', { visible: true });
                await page.waitForSelector('div.results-container > div.job-results-row > div.stst-rlr > div > div > div > div > div > nav > ul', { visible: true });
              }
            
            let nextLink = `https://www.totaljobs.com/jobs/work-from-home/react-remote?page=${i+2}&postedWithin=1`

            await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 5000)); 
            // await page.click('a.res-1xvjmp2');
            let lastItem = await page.evaluate(() => { 
            let list = document.querySelectorAll('div.results-container > div.job-results-row > div.stst-rlr > div > div > div > div > div > nav > ul > li').length
            return list})
            console.log(lastItem)
            let nextPageSelector = 'div.results-container > div.job-results-row > div.stst-rlr > div > div > div > div > div > nav > ul > li:nth-child' + `(${lastItem})`
            await page.click(nextPageSelector);
            
            
            //----- Navigation -> redirect page ---
            pageRedirect : for(let navTryCount = 0; navTryCount < 4;){
                try {
                  let success = await page.goto(nextLink, { waitUntil: 'networkidle0' });
                  if (success){
                    console.log("navigation to next page in pagination successful on attempt: ", navTryCount+1)
                    break pageRedirect
                  }
                } catch (error) {
                  console.log("error navigating to next page, from page: ", i+1, " to page ", i+2, " attempt no: ", navTryCount+1);
                  await page.screenshot({path: 'tjErrPagNav.png'})
                  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 5000));
                  navTryCount++   
                  continue  pageRedirect
                }
               
              }
            
            await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 5000));      
          }  
        }
       } 
       
// ------------ If only one page of results --------------------
       else {

    await autoScroll(page);
    const jobListings = await page.evaluate(() => {
       const listings = [];
      
       document.querySelectorAll('article.res-vxbpca ').forEach((listing) => {
           const rawJobTitle = listing.querySelector('article.res-vxbpca > div > h2').innerText
           const rawCompanyName = listing.querySelector('article.res-vxbpca > div > div > div.res-1r68twq')?.innerText;
           const rawLocation = listing.querySelector('article.res-vxbpca > div > div > div.res-qchjmw')?.innerText;
           const link = listing.querySelector('article.res-vxbpca > div > h2 > a')?.href;
           const extractUrl = link.split('/')[5]
           const id = extractUrl.split("-")[this.length].replace("job", '')

          //  remove commas
          const jobTitle = rawJobTitle.replaceAll(",", " ")
          const  companyName = rawCompanyName.replaceAll(",", " ")
          const  location = rawLocation.replaceAll(",", " ")

       listings.push({id, jobTitle, companyName, location, link });
       
       });
       return listings;
     });
     allJobListings.push(jobListings)
 }
//  --------------------------------------------------------


        let flatJobListings = allJobListings.flat()

        console.log("there are: ", flatJobListings.length, " job results");
  
        const filteredJobListings = sortTitles(flatJobListings)
       let  linkCount = 1;

// Get descriptions for filtered jobs
  for (const listing of filteredJobListings) {
    let link =  listing.link;

    const newPage = await browser.newPage();
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 5000)); 
      await newPage.goto(link, { waitUntil: 'networkidle0' });
    } catch (error) {
      await newPage.screenshot({path: 'tjErrLinkNav.png'})
      console.log("error going to job description page")
    }
   
    try {
      await newPage.waitForSelector('body', { visible: true });  
    } catch (error) {
      await newPage.screenshot({path: 'tjErrLinkSelector.png'})
      console.log("error waiting for selector on job description page", linkCount)
    }
 
    let jobDescription = await newPage.evaluate(() => {
        return document.querySelector('body')?.innerText
    });
    
    
    console.log("link ", linkCount, " of ", filteredJobListings.length)
    linkCount ++
    let formattedDescription = formatDescription(jobDescription, 'totalJobs');
    
    listing.jobDescription = formattedDescription;
    await newPage.close();
  }

  // await page.close();
  await browser.close();
  // writeCSV(filteredJobListings, "totalJobs")
  // writeMarkDown(filteredJobListings)
  return filteredJobListings
 
}

// scrapeTotalJobs('https://www.totaljobs.com/jobs/work-from-home/react-remote?postedWithin=1')
module.exports = scrapeTotalJobs