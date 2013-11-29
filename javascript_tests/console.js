


function writeMessage(message) {
    if (typeof window === 'undefined') { 
        print(message);
    } else { 
        console.log(message);
    }
}

writeMessage("foobar console.js");
writeMessage("console.log()");
