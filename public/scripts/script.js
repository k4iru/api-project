var xhr;
const url = "https://api.kylecheung.ca/";
const local = "https://localhost:8888/"

function makeRequest() {

    // using promises instead of xhr
  fetch(`${url}getMe`)
    .then(function (res) {
      if (res.status !== 200) {
        console.log("Something went wrong! Status Code: " + res.status);
        return;
      }

      // parse body as json witha promise
      res.json().then(function (data) {
        // if successful do stuff
        console.log(data);
      });
    })
    .catch(function (err) {
      console.log("Fetch Error: ", err);
    });

  // xhr = new XMLHttpRequest();
  // xhr.open('GET',  url + 'test');
  // xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
  // xhr.setRequestHeader('Content-Type', "application/json");
  // xhr.send();
  // console.log(xhr.response);
  // console.log(xhr.response.body);
}
