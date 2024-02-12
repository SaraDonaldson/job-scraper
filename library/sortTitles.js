
function sortTitles(jobListings){
    let flagWords =  [
        'senior', 'Senior', 'SENIOR', 'lead', 'ruby', 'cloud', 'php', 'PHP', 
         '.Net', '.NET', '.net', 'C#', 'C#.Net', 'Django', 
        'NET Developer', 'Golang', 'GoLang', 'GOLANG', 
        'ASP.Net', 'Ruby' 
    ]

const removedListings =[];
const remainingListings = [];

    for (const listing of jobListings) {
        let title = listing.jobTitle
        let keepListing = true;
            for (const word of flagWords){
              
                if (title.includes(word)){
                // remove listing from jobListings
                   
                    console.log( 'The job title:', title, 'includes the flag word', word)
                    removedListings.push(listing)
                    keepListing = false
                    continue 
                }   
            } 
            if(keepListing){
            remainingListings.push(listing)
            console.log("the job title: ", title , " does not contain any flag words")
        }
    }
    console.log("remaining listings: ", remainingListings)
    console.log("removed listings: ", removedListings)
    return remainingListings
}

module.exports = sortTitles;