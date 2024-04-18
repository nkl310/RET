
let ADDRESS;

window.addEventListener("load", async () => {
    
})


const getQueryAddress = async () => {
    let urlString = window.location.href
    let paramString = urlString.split('?')[1];
    let queryString = new URLSearchParams(paramString);
    for (let pair of queryString.entries()) {
       console.log("Key is: " + pair[0]);
       console.log("Value is: " + pair[1]);
       ADDRESS = pair[1]
    }
}