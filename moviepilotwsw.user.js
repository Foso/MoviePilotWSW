// ==UserScript==
// @name           MoviePilotWSW
// Jens Klingenberg jensklingenberg.de
// @version        0.0.1
// @namespace      test@GM_xhr
// @include        *.moviepilot.de/movies/*
// @include        *.moviepilot.de/serie/*
// @run-at         document-body
// @grant GM_xmlhttpRequest 
// ==/UserScript==
var jsonResponse;
var ObjectID;
var ObjectType; // show , movie
var url;
var movieTitle;
var myH2;
var jsonProvider;

var year;
var bMovie = false;
var bShow = false;


var mmap = new Object();

mmap['flatrate'] = document.createElement('p');
mmap['buy'] = document.createElement('p');
mmap['rent'] = document.createElement('p');


/*  Auswahl der Anbieter
    Durch auskommentieren kann man die Anbieter auswählen die nicht angezeigt werden sollen

*/

var provider = new Object();


provider['2'] = 'https://images.justwatch.com/icon/430995/s100/apple-itunes'; //Itunes
provider['3'] = 'https://images.justwatch.com/icon/430996/s100/google-play-movies';
provider['4'] = 'https://images.justwatch.com/icon/430990/s100/skysnap';
provider['5'] = "https://images.justwatch.com/icon/430989/s100/watchever"; //Watchever
provider['6'] = 'https://images.justwatch.com/icon/430988/s100/maxdome'; //Maxdome
provider['8'] = 'https://images.justwatch.com/icon/430997/s100/netflix'; //Netflix
provider['9'] = "https://images.justwatch.com/icon/430994/s100/amazon-prime-instant-video"; //Amazon
provider['10'] = "https://images.justwatch.com/icon/430994/s100/amazon-prime-instant-video"; //Amazon
provider['14'] = 'https://images.justwatch.com/icon/441358/s100/realeyz'; //realeyz
provider['17'] = 'https://images.justwatch.com/icon/446736/s100/xbox'; //xbox
provider['18'] = 'https://images.justwatch.com/icon/446737/s100/playstation'; //Playstation  
provider['20'] = 'https://images.justwatch.com/icon/446739/s100/maxdome-store'; //Maxdome


var exprovider = new Object();


getMovieTitle();


function getMovieTitle() {

    if (document.URL.indexOf('movies') > 0) {
        movieTitle = document.querySelector('.movie--headline').innerHTML;
        year = document.querySelector('.movie--data > span:nth-child(1) > a:nth-child(2)').innerHTML;
        bMovie = true;

    } else if (document.URL.indexOf('serie') > 0) {
        movieTitle = document.querySelector('.title-wrapper > h1:nth-child(2)').innerHTML;
        bShow = true;


    }

    return true;
};


var ret = GM_xmlhttpRequest({
    method: 'GET',
    url: 'https://api.justwatch.com/titles/de_DE/suggest?content_types=show,movie&q=' + movieTitle,
    onload: function(res) {
        jsonResponse = JSON.parse(res.responseText);

        var len = Object.keys(jsonResponse).length;


        for (i = 0; i < len; i++) {

            if (((bMovie) && (jsonResponse[i].release_year.toString() == year)) || (bShow)) {

                ObjectID = jsonResponse[i].object_id.toString();
                ObjectType = jsonResponse[i].object_type.toString();

                i = len;



                var ret2 = GM_xmlhttpRequest({
                    method: 'GET',
                    url: 'https://api.justwatch.com/titles/' + ObjectType + '/' + ObjectID + '/locale/de_DE',

                    onload: function(res) {

                        jsonProvider = JSON.parse(res.responseText);
                        var providerlength = Object.keys(jsonProvider.offers).length;
                        myH2 = document.createElement('p');


                        for (j = 0; j < providerlength; j++) {


                            if (jsonProvider.offers[j].monetization_type in mmap) {




                                if (mmap[jsonProvider.offers[j].monetization_type].innerHTML == "") {

                                    if (jsonProvider.offers[j].monetization_type == "buy") {
                                        mmap['buy'].innerHTML = "Kaufen";

                                    }

                                    if (jsonProvider.offers[j].monetization_type == "flatrate") {
                                        mmap['flatrate'].innerHTML = "Flatrate";

                                    }
                                    if (jsonProvider.offers[j].monetization_type == "rent") {
                                        mmap['rent'].innerHTML = "Leihen";

                                    }

                                }




                                if (jsonProvider.offers[j].provider_id in provider) {

                                    var image = document.createElement('img');
                                    image.setAttribute('src', provider[jsonProvider.offers[j].provider_id]);
                                    image.setAttribute('height', '32');
                                    image.setAttribute('width', '32');
                                    image.setAttribute('title', jsonProvider.title + ' ' + jsonProvider.offers[j].monetization_type + '- ' + jsonProvider.offers[j].retail_price + ' - ' + jsonProvider.offers[j].presentation_type);

                                    var a = document.createElement('a');
                                    a.href = jsonProvider.offers[j].urls.standard_web;
                                    a.appendChild(image);


                                    mmap[jsonProvider.offers[j].monetization_type].appendChild(a);
                                    myH2.appendChild(mmap[jsonProvider.offers[j].monetization_type]);



                                }


                            }


                        }
                        if (bMovie == true)

                        {
                            var Ausgabebereich = document.querySelector('.movie--headline');

                        } else {

                            var Ausgabebereich = document.querySelector('.title-wrapper > h1:nth-child(2)');
                        }

                        //var Ausgabebereich = document.querySelector('.title-wrapper > h1:nth-child(2)');
                        Ausgabebereich.appendChild(myH2);



                    }
                });

            }

        }


    }

});
