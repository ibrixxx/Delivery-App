/* Set the width of the side navigation to 250px and the left margin of the page content to 250px and add a black background color to body */
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
    document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0, and the background color of body to white */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
    document.body.style.backgroundColor = "white";
}
// Get the modal
var modal = document.getElementById("myModal");
var modal2 = document.getElementById("myModal2");
var modal3 = document.getElementById("myModal3");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");
var btn2 = document.getElementById("myBtn2");
var btn3 = document.getElementById("myBtn3");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[1];
var span2 = document.getElementsByClassName("close")[2];
var span3 = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function() {
    modal.style.display = "block";
}

btn2.onclick = function() {
    modal2.style.display = "block";
}

btn3.onclick = function() {
    modal3.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}
span2.onclick = function() {
    modal2.style.display = "none";
}
span3.onclick = function() {
    modal3.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

window.onclick = function(event) {
    if (event.target == modal2) {
        modal2.style.display = "none";
    }
}

window.onclick = function(event) {
    if (event.target == modal3) {
        modal3.style.display = "none";
    }
}

var dropdown = document.getElementsByClassName("dropdown-btn");
var i;

for (i = 0; i < dropdown.length; i++) {
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

function assignOrder(id) {
    let op = $("#inlineFormCustomSelectPref").val();
    $.ajax({
        method: "POST",
        url: "/restaurant/assign/order/"+ id +'/'+ op
    })
    let str = "#" + id;
    console.info(str);
    $(str).hide('slow');
    let a = document.getElementById('brod').innerText;
    a--;
    if(a == 0)
        document.getElementById('brod').style.display = 'none';
    document.getElementById('brod').innerText = a;
}

let map;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 	43.856430, lng: 18.413029 },
        zoom: 6,
    });
    populateMap();
}

function addMarker(ime,prezime,pl, lt, ln, dos) {
    let marker;
    if(!dos)
        marker = new google.maps.Marker({
            position: {lat: lt, lng: ln},
            map,
            icon: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",
        });
    else
        marker = new google.maps.Marker({
            position: {lat: lt, lng: ln},
            map,
            icon: null,
        });

    let info = new google.maps.InfoWindow({
        content: `<h5>assaigned to: ${ime} ${prezime}</h5> <p>paid: ${pl} | delivered: ${dos}</p>`
    });

    marker.addListener('click', function () {
        info.open(map, marker);
    });
}

function populateMap() {
    let pom = document.getElementById('markeri').innerHTML;
    let a = JSON.parse(pom);
    for(let i = 0; i<a.length; i++) {
        addMarker(a[i].ime, a[i].prezime, a[i].placeno, a[i].latituda, a[i].longituda, a[i].dostavljeno);
    }
}
