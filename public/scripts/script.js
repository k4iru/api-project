//var xhr;

// check if geolocation is supported

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(showPosition);
}

// on success
function showPosition(position) {
  console.log(position.coords.latitude) 
  console.log(position.coords.longitude);
}

let email = document.getElementById("email");
function makeRequest() {
  // using promises instead of xhr
  fetch("/getMe")
    .then(function (res) {
      if (res.status !== 200) {
        console.log("Something went wrong! Status Code: " + res.status);
        return;
      }

      // parse body as json with a promise
      res.json().then(function (data) {
        // if successful do stuff
        console.log(data);

        email.innerText = data.body.email;
      });
    })
    .catch(function (err) {
      console.log("Fetch Error: ", err);
    });

  //   xhr = new XMLHttpRequest();
  //   xhr.open('GET',  url + 'test');
  //   xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
  //   xhr.setRequestHeader('Content-Type', "application/json");
  //   xhr.send();
  //   console.log(xhr.response);
  //   console.log(xhr.response.body);
}
