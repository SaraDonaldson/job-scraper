
function formatDescription(jobDescription, source){


tJRemoveHead = ['"Search', 'Sign in','Menu','Permanent','Competitive','Apply', '< Previous job Next job >', 
               'More jobs like this one', 'Are you recruiting? Advertise now',
               'Toggle navigation', '30 miles', '20 miles', '10 miles', '5 miles', '0 miles',
               'Save', 'Create alert', 'Show my commute time ', 'Permanent','Today','Create alert	','Create alert',
               'Activate one-click apply',' What is one-click apply?','Activate one-click apply. What is one-click apply?',
               'Contract', 'Recently', '< Back to search results', 
]
breakTriggers = ['Apply', 'Similar to your searches', 'ADDED today ', 'Today', 'Totaljobs', "Let's connect", 'Privacy policy', 'Apps',
                  'These jobs were popular with other job seekers', 'Activate one-click apply. What is one-click apply?',
                  'Create alert', 'Create alert	', 'Similar to your searches', 'Email address: ', 'Previous', 'Next']
   
   let descriptionArray = jobDescription.split('\n')
   
   let reformattedArray =[]
   let count = 0;
   let breakAfterPoint = descriptionArray.length / 3;

     reformat: for(line of descriptionArray){
            removedSpaces = line.trimStart()
            if(removedSpaces === '' || removedSpaces === ' '){
               count ++
               continue
            }

            if(source === 'totalJobs'){
                  if(count < breakAfterPoint){
                     tJTrimStart: for(skip of tJRemoveHead){
                        if(line === skip){
                        // console.log("line removed from start at index", count)
                        count ++
                        continue reformat
                        }
                     } 
                  }
                  if(count >= breakAfterPoint){
                     tJTrimEnd: for( trigger of breakTriggers){
                           if(line === trigger){
                              // console.log("break trigger: ", trigger ," on line ", count, " of ", descriptionArray.length)
                              break reformat
                           }
                  }
               }
         }
            let removeCommas = line.replaceAll(',', ' ')
            let removeSemiColons = removeCommas.replaceAll(";", ":")
            let removeQuotes = removeSemiColons.replaceAll('"', "")
            let removeSingleQuotes = removeQuotes.replaceAll("'", "").trimStart()
            reformattedArray.push(removeSingleQuotes)
           
            count ++
      }
         console.log("job description trimmed to ", reformattedArray.length  , " lines, from ", descriptionArray.length)
      let returnString = reformattedArray.join('.//')
      // console.log(returnString)
      return returnString
}

module.exports = formatDescription;

// formatDescription(sampleDescription, 'totalJobs');`