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


// Get the element with id="defaultOpen" and click on it
document.getElementById("defaultOpen").click();


function deleteDel(id) {
    $.ajax({
        method: "POST",
        url: "/users/delete/delivery/"+ id
    })
    let str = "#d"+ id;
    console.info(str);
    $(str).hide('slow');
}

function deleteArt(id) {
    $.ajax({
        method: "POST",
        url: "/users/delete/article/"+ id
    })
    let str = "#d"+ id;
    console.info(str);
    $(str).hide('slow');
}
