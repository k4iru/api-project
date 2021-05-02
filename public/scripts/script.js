var xhr;
const url = 'https://api.kylecheung.ca/';
function makeRequest() {
    xhr = new XMLHttpRequest();
    xhr.open('GET',  url + 'test');
    xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
    xhr.send();
}

console.log('test')


function test() {
    console.log('yes');
}