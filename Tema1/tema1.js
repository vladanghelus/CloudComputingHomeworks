var http = require('http');
var fs = require('fs');
var url = require('url');
const { default: axios } = require('axios');
const path = require('path');

http.createServer(onRequest).listen(8080)

var joke
var url_image
var apikey

fs.readFile("configuration.txt", 'utf8', function(err, data){
  apikey = data;
});

function onRequest(request, response){
  var pathName = url.parse(request.url).pathname;
  if(pathName == '/joke')
    makeRequestJoke(response, false);
  else if(pathName == '/dogs')
    showPage(response, false)
  else if(pathName == '/meme')
    generateMeme(response)
  else if(pathName == '/final'){
    makeRequestJoke(response, true);
  }
  else
    showIndex(response);
}

function showIndex(response){
  fs.readFile('index.html',function (err, data){
    response.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
    response.write(data);
    response.end();
});
}

function callbackJoke(response){
  response.writeHead(200);
  response.write(joke);
  response.end();
}

function makeRequestJoke(response, final){ 
  axios
  .get("https://dad-jokes.p.rapidapi.com/random/joke", {
    headers: {
      "X-RapidAPI-Host" : "dad-jokes.p.rapidapi.com",
      "X-RapidAPI-Key" : apikey
    }
  })
  .then(res => {
    statusCode = res.status
    joke = res.data.body[0].setup + '...' + res.data.body[0].punchline
    if(final == false)
      callbackJoke(response);
    else
      showPage(response, true);
  })
  .catch(error => {
    console.error(error)
  })
}

function callbackDog(response){
  response.writeHead(200);
  response.write('<a href=' + url_image+'>' + url_image+ '</a>');
  response.end();
}

function showPage(response, final){
  ready = false
  axios
  .get("https://dog.ceo/api/breeds/image/random")
  .then(res => {
    url_image = res.data.message;
    if(final == false)
      callbackDog(response, res.method, res.status);
    else
      generateMeme(response);
  })
  .catch(error => {
    console.error(error)
  })
}

function generateMeme(response){
  if(url_image === undefined || joke === undefined){
    response.writeHead(400);
    response.write("Trebuie apelate primele 2 api-uri intai");
    response.end();
  }
  else{
   axios
  .get("https://textoverimage.moesif.com/image?image_url="+url_image+"&text="+encodeURIComponent(joke)+"&y_align=bottom&x_align=center")
  .then(res => {
    response.writeHead(200);
    var joke1 = encodeURIComponent(joke)
    response.write("<img src = https://textoverimage.moesif.com/image?image_url="+url_image+"&text="+joke1+"&y_align=bottom&x_align=center&text_size=16></img>");
    response.end();
  })
  .catch(error => {
    console.error(error)
  })
}
}

axios.interceptors.request.use( x => {
  x.meta = x.meta || {}
  x.meta.requestStartedAt = new Date().getTime();
  return x;
})

axios.interceptors.response.use( x => {
      var urlReq
      if(x.config.url.indexOf("textoverimage")!=-1)
        urlReq = 'get_meme';
      else if(x.config.url.indexOf("dog.ceo")!=-1)
        urlReq = 'get_dog_pic';
      else if(x.config.url.indexOf("dad-jokes")!=-1)
        urlReq = "get_joke";
      var method = x.config.method;
      var status = x.status;
      var reqTime = new Date().getTime() - x.config.meta.requestStartedAt;
      fs.appendFile("logs.txt",urlReq + ' ' + method + ' ' + status + ' ' + reqTime + 'ms\n', err => {
        if(err){
          console.error(err)
          return
        }
      })
      return x;
  },
  x => {
    console.log(x)
    var urlReq
    if(x.config.url.indexOf("textoverimage")!=-1)
      urlReq = 'get_meme';
    else if(x.config.url.indexOf("dog.ceo")!=-1)
      urlReq = 'get_dog_pic';
    else if(x.config.url.indexOf("dad-jokes")!=-1)
      urlReq = "get_joke";
    var method = x.config.method;
    var status = x.status;
    var reqTime = new Date().getTime() - x.config.meta.requestStartedAt;
    fs.appendFile("logs.txt",urlReq + ' ' + method + ' ' + status + ' ' + reqTime + 'ms\n', err => {
      if(err){
        console.error(err)
        return
      }
    })
      throw x;
  }
)