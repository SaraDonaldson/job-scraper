const puppeteer = require('puppeteer');
const sortTitles = require('./library/sortTitles');
const autoScroll = require('./library/autoscroll');




async function scrapeReedListings(url) {
//  const browser = await puppeteer.launch();
    const browser = await puppeteer.launch({slowMo: 250}); // Slows down Puppeteer operations by 250ms
    const page = await browser.newPage();

    await page.goto(url);




await page.screenshot({path: 'reedLoadScreenshot.png'})


//Close the popup/iframe
 try {
    await page.waitForSelector('#onetrust-accept-btn-handler', { visible: true });
    await page.click('#onetrust-accept-btn-handler'); // Primary selector for the close button
  } catch (error) {
    console.error("Couldn't close the pop-up with the primary selector. Trying alternative selectors...");
          const frame = await page.frames().find(f => f.url().includes('safeframe'));
  if (frame) {
    const closeButton = await frame.waitForSelector('#onetrust-accept-btn-handler', {visible: true});
    await closeButton.click();
  }
  }

    await page.screenshot({path: 'reedAfterPopupScreenshot.png'})


await autoScroll(page);
 const jobListings = await page.evaluate(() => {
    const listings = [];
   
    document.querySelectorAll('div.job-card_jobCard__body__86jgk ').forEach((listing) => {
        const jobTitle = listing.querySelector('div.job-card_jobCard__body__86jgk > a').innerText
        const companyName = listing.querySelector('a.gtmJobListingPostedBy')?.innerText;
        const location = listing.querySelector("header > ul > li:nth-child(2)")?.innerText;
        const link = listing.querySelector('div.job-card_jobCard__body__86jgk > a')?.href;
     
   
    listings.push({ jobTitle, companyName, location, link });
    });
    return listings;
  });

  console.log("Job listings here:", jobListings, "there are: ", jobListings.length, " job results");
  
  const filteredJobListings = sortTitles(jobListings)


  for (const listing of filteredJobListings) {
    let link =  listing.link;
    const newPage = await browser.newPage();
    
    // Optional: Random delay to simulate human-like behavior
   
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 5000)); 
    
    
    await newPage.goto(link, { waitUntil: 'networkidle0' });
    await newPage.waitForSelector('#content > div.job-details > div > article >div', { visible: true });
   
    console.log("link visited:", link)

    // Perform your data extraction in the new tab
    const jobDescription= await newPage.evaluate(() => {
      // Extract data from the new page
     //  Two page formats!
        const regularJobListing = document.querySelector('div.description > span')?.innerText;
        const isBrandedFormat =  document.querySelector('div.branded-job--description')?.innerText
        if (isBrandedFormat){
            return isBrandedFormat
        } else {
            return regularJobListing
        }
        
  
      
    });
    
    listing.jobDescription = jobDescription
    await newPage.close();
  }

    console.log(filteredJobListings)
    



// // Extract detailed Jobs
// for (const listing of filteredJobListings) {
//     await new Promise(resolve => setTimeout(resolve, 6000)); // 2000 milliseconds = 2 seconds
 
//     await page.goto(listing.link, { waitUntil: 'networkidle0' }); // 'networkidle0': consider navigation to be finished when there are no more than 0 network connections for at least 500 ms
    
//     await autoScroll(page);

//     await page.waitForSelector('section.core-section-container.my-3.description > div > div > section', { visible: true });
//     // Now scrape the detailed information from this listing page.
//     const detailedJobDescription = await page.evaluate(() => {
        
//       // Extract details
//       const jobDescription =  document.querySelector('section.core-section-container.my-3.description > div > div > section > div')?.innerHTML
    
        
  
//       return jobDescription;
//     });
  
//     // console.log(detailedJobDescription); // Or push to an array to process later
//     listing. JobDetails = detailedJobDescription
//     console.log(listing)
//   }
//   console.log(jobDescriptions)

  await browser.close();
}


scrapeReedListings('https://www.reed.co.uk/jobs/work-from-home-react-developer-jobs?dateCreatedOffSet=lastthreedays');