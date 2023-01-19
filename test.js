const needle = require('needle');


async function main(){
    
    needle.get('https://www.timeapi.io/api/Time/current/zone?timeZone=Australia/Melbourne', function(error, response) {
        if (!error && response.statusCode == 200)
        console.log(response.body);
})
    
}

main();