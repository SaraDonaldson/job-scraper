function formatLinkedInDescription(jobDescription){


       let descriptionArray =  jobDescription.split('\n')

       let reformattedArray =[]
       let count = 0;
       let start = 0;
       let breakPoint = 0;

    
         reformat: for(line of descriptionArray){
                if(line.includes("show-more-less-html__markup")){
                    start = count +1;
                } 
                if(line.includes("show-more-less-html__button")){
                    breakPoint = count -1;
                    break
                } 

                   if(start === 0 || count <= start){
                    count ++
                    continue   
                }
                   
                var mapObj = {'<div':"", '</div':'','<span>':" *", '</span>':"", '<span>':"", '</span>':"* ",              
                                '<p>':"", '</p>':"", '<ul>':": ", '</ul>': ". ", '<li>': " # ",  '</li>': "", '<br>': " ",
                                '>': '', '<': '', '<>': '','</': '', "'": "", '"':" "};
                var re = new RegExp(Object.keys(mapObj).join("|"),"gi");
                
               str = line.replace(re, function(matched){
                return mapObj[matched];
                });
                
          
               reformattedArray.push(str.trimStart())
                count ++
          }
             console.log("job description trimmed to ", reformattedArray.length  , " lines, from ", descriptionArray.length)
        let returnString = reformattedArray.join('')
        // console.log(returnString);
          return returnString
    }
    
    module.exports = formatLinkedInDescription;
    
    // formatDescription(sampleDescription, 'totalJobs');`