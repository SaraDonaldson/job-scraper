const puppeteer = require('puppeteer');
const sortTitles = require('./library/sortTitles');
const autoScroll = require('./library/autoscroll');
const formatDescription = require('./library/formatDescription');
const writeCSV = require('./library/writeCSV');




async function scrapeReedListings(url) {
//  const browser = await puppeteer.launch();
    const browser = await puppeteer.launch({slowMo: 250}); // Slows down Puppeteer operations by 250ms
    const page = await browser.newPage();

    await page.goto(url);




// await page.screenshot({path: 'reedLoadScreenshot.png'})


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
        const linkSplit = link.split('/')[5]
        const id = linkSplit.split('?')[0]
   
    listings.push({ id, jobTitle, companyName, location, link });
    });
    return listings;
  });

  console.log("there are: ", jobListings.length, " job results");
  
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
    try {
      if(jobDescription.length <= 1){
      let formattedDescription = formatDescription(jobDescription, 'reed');
      listing.jobDescription = formattedDescription;
      }
      else{
        listing.jobDescription = "could not access job description"
      }
    } catch (error) {
      console.error(`could not access job description on Reed result at url:  ${link}`)
      if(jobDescription.length <= 1){
       
        listing.jobDescription = jobDescription;
        }
      listing.jobDescription = "could not access job description"
    }
    
   
    await newPage.close();
  }

    console.log(filteredJobListings)
    


  await browser.close();
  // writeCSV(filteredJobListings, "reed")
  return filteredJobListings
}


// scrapeReedListings('https://www.reed.co.uk/jobs/work-from-home-react-developer-jobs?dateCreatedOffSet=lastthreedays');
module.exports = scrapeReedListings