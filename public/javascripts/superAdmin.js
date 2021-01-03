// Get the modal
var modal2 = document.getElementById("myModal2");
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");
var btn2 = document.getElementById("myBtn2");
// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];
var span2 = document.getElementsByClassName("close")[1];

// When the user clicks on the button, open the modal
btn.onclick = function() {
    modal.style.display = "block";
}
btn2.onclick = function() {
    modal2.style.display = "block";
}
// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}
span2.onclick = function() {
    modal2.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
window.onclick = function(event) {
    if (event.target == modal) {
        modal2.style.display = "none";
    }
}

var dropdown = document.getElementsByClassName("dropdown-btn");

for (var i = 0; i < dropdown.length; i++) {
    dropdown[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var dropdownContent = this.nextElementSibling;
        if (dropdownContent.style.display === "block") {
            dropdownContent.style.display = "none";
        } else {
            dropdownContent.style.display = "block";
        }
    });
}

function myMap() {
    var mapProp= {
        center:new google.maps.LatLng(43.8,18.0),
        zoom:7,
    };
    var map = new google.maps.Map(document.getElementById("googleMap"),mapProp);
    google.maps.event.addListener(map, 'click', function(event) {
        placeMarker(map, event.latLng);
    });

    function placeMarker(map, location) {
        var marker = new google.maps.Marker({
            position: location,
            map: map
        });
        var infowindow = new google.maps.InfoWindow({
            content: 'Latitude: ' + location.lat() +
                '<br>Longitude: ' + location.lng()

        });
        infowindow.open(map,marker);
        var x = document.getElementById("lat");
        var y = document.getElementById("lng");
        x.value = "" + location.lat();
        y.value = "" + location.lng();
    }
}

function openCity(evt, cityName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
}

document.getElementById("defaultOpen").click();


function deleteRestaurant(id) {
    $.ajax({
        method: "POST",
        url: "/super/delete/"+ id
        })
    let str = "#"+ id;
    console.info(str);
    $(str).hide('slow');
}

function deleteCity(id) {
    $.ajax({
        method: "POST",
        url: "/super/delete/city/"+ id
    })
    let str = "#g"+ id;
    console.info(str);
    $(str).hide('slow');
}

function deleteFood(id) {
    $.ajax({
        method: "POST",
        url: "/super/delete/food/"+ id
    })
    let str = "#h"+ id;
    console.info(str);
    $(str).hide('slow');
}

function addFood() {
    $("#adde").show("slow");
    $("#adde").hide("slow");
}

function addCity() {
    $("#addexc").show("slow");
    $("#addexc").hide("slow");
}
