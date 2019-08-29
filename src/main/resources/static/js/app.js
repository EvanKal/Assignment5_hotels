/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


let entries = null;
let filteredentries = null;


window.addEventListener('DOMContentLoaded', () => {

    setUpListeners();
    
    //Initial call to the server to get the entries object
    fetch('http://localhost:8080/A5_hotels/hotels/all')
        .then(function (response) {
            return response.json();
        })
        .then(function (myJson) {
            entries = myJson[1].entries;
            filteredentries = entries;
            displayResults(entries);
        })
        .catch(function() {
            document.querySelector("#hotelscontainer").innerHTML = "Something went wrong while fetching the list of hotels :(";
        });
        
});






//Filtering and proxy

let filters = {
    price: null,
    rating: null,
    guestrating: null,
    city: null,
    filters: null
}

let myhandler = {
    set: function (obj, prop, value) {
        obj[prop] = value;

        //Every time a filter value is set/changed the filter function runs
        filterEntriesByFilters(filteredentries);

        // Indicate success
        return true;
    }
}

//Using a proxy to run the filtering function every time a filter value is changed
let filtersproxy = new Proxy(filters, myhandler);

function filterEntriesByFilters(entries) {
    let entriesafterfiltering = filteredentries.filter(function (item) {

        //Using a boolean value to pass through the successsive filters to return in the end
        let bool = true;
        for (var key in filters) {

            if (filters[key] != null) {

                if(key == "filters") {
                    console.log(Object.values(item[key]));
                }

                if (

                    (key == "price" && item[key] > filters[key]) ||
                    (key == "rating" && item[key] != filters[key]) ||
                    (key == "guestrating" && !(item[key] > filters[key].min && item[key] < filters[key].max)) ||
                    (key == "city" && item[key] != filters[key]) ||
                    (key == "filters" && !item[key].map(elem => elem.name).includes(filters[key])
                    )

                ) {
                    bool = false;
                }

            } else {
                console.log("key == null. didin't filter with ", key);
            }


        }
        return bool;
    });

    displayHotels(entriesafterfiltering);
    // filteredentries = entriesafterfiltering;


}





//Set up the listeners for the filters and the search input

function setUpListeners () {
    //Search input listeners
    document.querySelector("#search input").addEventListener("input", function () {
        let value = document.querySelector("#search input").value;
        filteredentries = entries.filter(entry => entry.city.toLowerCase().includes(value.toLowerCase().trim()));
        displayDatalist(filteredentries);
    });

    document.querySelector("#searchcont button").addEventListener("click", function () {
        let value = document.querySelector("#search input").value;

        if (value != "") {

            if (filteredentries.length > 0) {
                displayResults(filteredentries);
            } else {
                document.querySelector("#hotelscontainer").innerHTML = "No results to be displayed :(";
            }
        } else {
            displayResults(entries);
        }
    });

    //Filters listeners
    //Price range
    document.querySelector("#filtersrowtwo .slidercont input[type=range]").addEventListener("input", function (event) {
        let value = document.querySelector("#filtersrowtwo .slidercont input[type=range]").value;
        let slidervalue = document.querySelector("#filtersrowtwo .slidercont span");

        if (value == event.target.attributes.min.value || value == event.target.attributes.max.value) {
            if (value == event.target.attributes.min.value) {
                slidervalue.innerHTML = `min: $${value}`;
            }
            if (value == event.target.attributes.max.value) {
                slidervalue.innerHTML = `max: $${value}`;
            }
        } else {
            slidervalue.innerHTML = `$${value}`;
        }

        filtersproxy.price = value;

    });

    //Star rating
    document.querySelector("#filtersrowtwo #propertytype").addEventListener("input", function (event) {
        let value = document.querySelector("#filtersrowtwo #propertytype").value;

        if (value != "all") {
            filtersproxy.rating = value;
        } else {
            filtersproxy.rating = null;
        }
    });

    //Guest rating
    document.querySelector("#filtersrowtwo #guestrating").addEventListener("input", function (event) {
        let value = document.querySelector("#filtersrowtwo #guestrating").value;

        if (value != "all") {

            if (value == "okay") {
                filtersproxy.guestrating = { min: 0, max: 1.9 };
            }
            if (value == "fair") {
                filtersproxy.guestrating = { min: 2, max: 5.9 };
            }
            if (value == "good") {
                filtersproxy.guestrating = { min: 6, max: 6.9 };
            }
            if (value == "verygood") {
                filtersproxy.guestrating = { min: 7, max: 8.4 };
            }
            if (value == "excellent") {
                filtersproxy.guestrating = { min: 8.5, max: 10 };
            }

        } else {
            filtersproxy.guestrating = null;
        }
    });

    //City
    document.querySelector("#filtersrowtwo #hotellocation").addEventListener("input", function (event) {
        let value = document.querySelector("#filtersrowtwo #hotellocation").value;

        if (value != "all") {
            filtersproxy.city = value;
        } else {
            filtersproxy.city = null;
        }
    });

    //Sort by (filters)
    document.querySelector("#sortby").addEventListener("input", function (event) {
        let value = document.querySelector("#sortby").value;

        if (value != "all") {
            filtersproxy.filters = value;
        } else {
            filtersproxy.filters = null;
        }
    });
}


function displayResults(entries) {
    console.log(entries);
    displayHotels(entries);
    displayDatalist(entries);
    setCurrentDates();
    setSliderRange(entries);
    setPropertyTypeOptions(entries);
    setHotelLocations(entries);
    setRecommendations(entries);
}

//Filters' inputs creation, dynamicaly built out of the hotels in the entries object

function displayDatalist(entries) {
    document.querySelector("#cities").innerHTML = "";

    let options = [];

    entries.forEach(function (entry) {
        if (!options.includes(entry.city)) {
            options.push(entry.city);
            let option = document.createElement("option");
            option.innerHTML = entry.city;
            document.querySelector("#cities").appendChild(option);
        }

    });
}

function setCurrentDates() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = yyyy + "-" + mm + "-" + dd;

    document.querySelector(".checkin input[type=date]").value = today;
    document.querySelector(".checkout input[type=date]").value = today;

    document.querySelector(".checkin input[type=date]").min = today;
    document.querySelector(".checkout input[type=date]").min = today;
}

function setSliderRange(entries) {
    let slider = document.querySelector("#filtersrowtwo .slidercont input[type=range]");
    let slidervalue = document.querySelector("#filtersrowtwo .slidercont span");

    let prices = [];

    entries.forEach(function (entry) {
        prices.push(entry.price);
    });

    let max = Math.max(...prices);
    let min = Math.min(...prices);

    slider.step = 1;
    slider.max = max;
    slider.min = min;
    slider.value = max;
    slidervalue.innerHTML = `max: $${max}`;
}

function setPropertyTypeOptions(entries) {
    let select = document.querySelector("#filtersrowtwo #propertytype");
    select.innerHTML = `<option value="all" selected>All</option>`;

    // let options = [];

    for (let i = 0; i <= 5; i++) {
        let option = document.createElement("option");
        option.value = i;
        option.innerHTML = i;
        select.appendChild(option);
    }

    // entries.forEach(function (entry) {
    //     if (!options.includes(entry.rating)) {
    //         options.push(entry.rating);
    //         let option = document.createElement("option");
    //         option.value = entry.rating;
    //         option.innerHTML = entry.rating;
    //         select.appendChild(option);
    //     }
    // });

}

function setHotelLocations(entries) {
    let select = document.querySelector("#filtersrowtwo #hotellocation");
    select.innerHTML = `<option value="all" selected>All</option>`;

    let options = [];

    entries.forEach(function (entry) {
        if (!options.includes(entry.city)) {
            options.push(entry.city);
            let option = document.createElement("option");
            option.value = entry.city;
            option.innerHTML = entry.city;
            select.appendChild(option);
        }
    });

}

function setRecommendations(entries) {
    let select = document.querySelector("#sortby");
    select.innerHTML = `<option value="all" selected>Our recommendations</option>`;

    let options = [];

    entries.forEach(function (entry) {
        entry.filters.forEach(function (filter) {

            if (!options.includes(filter.name)) {
                options.push(filter.name);
                let option = document.createElement("option");
                option.value = filter.name;
                option.innerHTML = filter.name;
                select.appendChild(option);
            }

        });

    });

}




//Display the hotels from entries or filteredentries object

function displayHotels(entries) {
    document.querySelector("#hotelscontainer").innerHTML = "";
    entries.forEach(function (entry) {
        displayHotel(entry);
    });
}

function displayHotel(entry) {
    let fragment = document.createDocumentFragment();

    let hotel = document.createElement("div");
    hotel.classList.add("hotel");
    let info = document.createElement("div");
    info.classList.add("info");


    //img 

    let imgcont = document.createElement("div");
    imgcont.classList.add("imgcont");
    let img = document.createElement("img");
    img.setAttribute("src", entry.thumbnail);
    imgcont.appendChild(img);

    hotel.appendChild(imgcont);

    //info
    let name = document.createElement("h2");
    name.classList.add("name");
    name.innerHTML = entry.hotelName;
    info.appendChild(name);


    let rating = document.createElement("div");
    rating.classList.add("rating");
    displayStars(entry.rating, rating);
    let type = document.createElement("span");
    type.classList.add("type");
    type.innerHTML = "Hotel";
    info.appendChild(rating);
    info.appendChild(type);


    let location = document.createElement("div");
    location.classList.add("location");
    location.innerHTML = entry.city;
    info.appendChild(location);

    let ratings = document.createElement("div");
    ratings.classList.add("ratings");

    let no = document.createElement("div");
    no.classList.add("no");
    no.innerHTML = entry.ratings.no.toFixed(1);
    let text = document.createElement("div");
    text.classList.add("text");
    text.innerHTML = entry.ratings.text;

    ratings.appendChild(no);
    ratings.appendChild(text);
    info.appendChild(ratings);

    let price = document.createElement("div");
    price.classList.add("price");
    price.innerHTML = `$${entry.price}`;
    info.appendChild(price);

    hotel.appendChild(info);

    let mapcont = document.createElement("div");
    mapcont.classList.add("mapcont");
    let viewmap = document.createElement("button");
    viewmap.classList.add("viewmap");
    viewmap.setAttribute("latlong", entry.__mapData.join());
    viewmap.innerHTML = "View Map";
    mapcont.appendChild(viewmap);

    hotel.appendChild(mapcont);

    fragment.appendChild(hotel);

    document.querySelector("#hotelscontainer").appendChild(fragment);
}

function displayStars(num, cont) {
    for (let i = 0; i < num; i++) {
        let span = document.createElement("span");
        span.innerHTML = `<i class="fa fa-star"></i>`;
        span.classList.add("star");
        cont.appendChild(span);
    }
}




// Modal

document.addEventListener("click", function (event) {
    console.log(event);

    if (event.target.classList.contains("viewmap")) {
        // console.log(event);
        // displayModal(event.target.attributes.mapurl.value);
        
        let latlong = event.target.attributes.latlong.value;
        let maplink = `https://www.google.com/maps/embed/v1/place?key=AIzaSyALb9QTFc5xeALyObmJ-MmCP1km-NWqpKA&q=${latlong}`
        displayModal(maplink);
    }

    if (event.target.id == "close") {
        document.body.removeChild(document.querySelector("#overlay"));
    }
});

document.querySelector("#viewmapbutton").addEventListener("click", function() {
    if(filteredentries.length > 0) {
        displayModal(filteredentries[0].mapurl);
    }
});


function displayModal(mapurl) {
    let overlay = document.createElement("div");
    overlay.setAttribute("id", "overlay");
    let a = document.createElement("a");
    a.setAttribute("id", "close");
    a.innerHTML = `&times;`;
    let content = document.createElement("div");
    content.setAttribute("id", "modalcontent");
    let iframe = document.createElement("iframe");
    iframe.setAttribute("src", mapurl);

    content.appendChild(iframe);
    overlay.appendChild(a);
    overlay.appendChild(content);
    document.body.appendChild(overlay);

}



//Sliding menu

document.querySelector("#menuiconcont").addEventListener("click", function() {
    document.querySelector("#filterscontainer").classList.toggle("slidein");
});
