const puppeteer = require('puppeteer');
const sortTitles = require('./library/sortTitles');
const autoScroll = require('./library/autoscroll');
const writeCSV = require('./library/writeCSV');
const writeMarkDown = require('./library/writeMarkDown');
const formatDescription = require('./library/formatDescription');




async function scrapeTotalJobs(url) {
//  const browser = await puppeteer.launch();
    const browser = await puppeteer.launch({slowMo: 250}); // Slows down Puppeteer operations by 250ms
    const page = await browser.newPage();

    await page.goto(url);




    // await page.screenshot({path: 'totalJobsLoadScreenshot.png'})

    await page.waitForSelector('#ccmgt_explicit_preferences', { visible: true });
    await page.click('div.options-button'); // Primary selector for the close button
    // await page.screenshot({path: 'totalJobsinterim.png'})
    await page.waitForSelector('#ccmgt_preferences_reject', { visible: true });
    await page.click('#ccmgt_preferences_reject');


    // await page.screenshot({path: 'totalJobsAfterPopupScreenshot.png'})

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
       
           //  remove commas
           const jobTitle = rawJobTitle.replaceAll(",", " ")
           const  companyName = rawCompanyName.replaceAll(",", " ")
           const  location = rawLocation.replaceAll(",", " ")

       listings.push({ jobTitle, companyName, location, link });
      
        });
 
        return listings;
      });
      console.log("reading listings from page: ", i+1, " of ", resultsPages)
        allJobListings.push(paginatedListings)

    // Go to next page
      if(i != lastPage){
       
        await page.waitForSelector('a.res-1xvjmp2', { visible: true });
        let nextLink = `https://www.totaljobs.com/jobs/work-from-home/react-remote?page=${i+2}&postedWithin=1`

        // console.log("link to next page: ", nextLink )
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 5000)); 
        await page.click('a.res-1xvjmp2');
        await page.goto(nextLink, { waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 5000));      
        }
            
        }
      

 } else {

    await autoScroll(page);
    const jobListings = await page.evaluate(() => {
       const listings = [];
      
       document.querySelectorAll('article.res-vxbpca ').forEach((listing) => {
           const rawJobTitle = listing.querySelector('article.res-vxbpca > div > h2').innerText
           const rawCompanyName = listing.querySelector('article.res-vxbpca > div > div > div.res-1r68twq')?.innerText;
           const rawLocation = listing.querySelector('article.res-vxbpca > div > div > div.res-qchjmw')?.innerText;
           const link = listing.querySelector('article.res-vxbpca > div > h2 > a')?.href;
      

          //  remove commas
          const jobTitle = rawJobTitle.replaceAll(",", " ")
          const  companyName = rawCompanyName.replaceAll(",", " ")
          const  location = rawLocation.replaceAll(",", " ")

       listings.push({ jobTitle, companyName, location, link });
       
       });
       return listings;
     });
     allJobListings.push(jobListings)
   
 }


        let flatJobListings = allJobListings.flat()

        console.log("there are: ", flatJobListings.length, " job results");
  
        const filteredJobListings = sortTitles(flatJobListings)
       let  linkCount = 1;

// Get descriptions for filtered jobs
  for (const listing of filteredJobListings) {
    let link =  listing.link;

    const newPage = await browser.newPage();
    
    // Random delay to simulate human-like behavior
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 5000)); 
    await newPage.goto(link, { waitUntil: 'networkidle0' });


    // await page.screenshot({path: 'totalJobsAfterPopupScreenshot.png'})

    await newPage.waitForSelector('body', { visible: true }); 
    let jobDescription = await newPage.evaluate(() => {
        return document.querySelector('body')?.innerText
      
    });
    
    
    console.log("link ", linkCount, " of ", filteredJobListings.length)
    linkCount ++
    let formattedDescription = formatDescription(jobDescription, 'totalJobs');
    
    listing.jobDescription = formattedDescription;
    await newPage.close();
  }

  
  await browser.close();
  // writeCSV(filteredJobListings, "totalJobs")
  writeMarkDown(filteredJobListings)
  // return filteredJobListings
 
}

scrapeTotalJobs('https://www.totaljobs.com/jobs/work-from-home/react-remote?postedWithin=1')
// module.exports = scrapeTotalJobs