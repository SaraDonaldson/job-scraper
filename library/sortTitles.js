
function sortTitles(jobListings){
    let flagWords =  [
        'senior', 'Senior', 'SENIOR', 'lead', 'Lead', 'ruby', 'cloud', 'php', 'PHP', 
         '.Net', '.NET', '.net', 'C#', 'C#.Net', 'Django', 
        'NET Developer', 'Golang', 'GoLang', 'GOLANG', 
        'ASP.Net', 'Ruby', 'Java Developer', 'manager', 'Manager', 'python', 'Python'
    ]

const removedListings =[];
const remainingListings = [];

   jobs: for (const listing of jobListings) {
        let title = listing.jobTitle
        let keepListing = true;
           flags: for (const word of flagWords){
              
               if (title.includes(word)){
                // remove listing from jobListings
                   
                    console.log( 'The job title:', title, 'includes the flag word', word)
                    removedListings.push(listing)
                    keepListing = false
                    continue jobs 
                }   
            }   
            if(keepListing){
            remainingListings.push(listing)
        }
    }


    
    // console.log("remaining listings: ", remainingListings)
    console.log(removedListings.length ," jobs were removed for containing flag words. ", remainingListings.length , " jobs remain")

    return remainingListings
}

module.exports = sortTitles;