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

