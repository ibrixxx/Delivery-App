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
    if (event.target == modal2) {
        modal2.style.display = "none";
    }
}


function confirmDelivery(id) {
    $.ajax({
        method: "POST",
        url: "/delivery/confirm/order/"+id
    })
    let str = "#" + id;
    console.info(str);
    $(str).hide('slow');
}

function abortMission(id) {
    $.ajax({
        method: "POST",
        url: "/delivery/abort/order/"+id
    })
    let str = "#" + id;
    console.info(str);
    $(str).hide('slow');
}



let chatForm = document.getElementById("chat-form");
let chatBox = document.querySelector('.chat-box');
let a = document.getElementById('boxbox');

var socket = io.connect('ws://localhost:3000');

socket.on('message', (p,username) => {
    outputMessage(p, username);
    chatBox.scrollTop = chatBox.scrollHeight;
})

chatForm.addEventListener('submit', e => {
    e.preventDefault();
    const mes = e.target.elements.salji.value;
    console.log(mes);
    socket.emit('chatMessage', mes);
    e.target.elements.salji.value = '';
})

function outputMessage(mes, username) {
    let div = document.createElement('div');
    div.classList.add('media');
    div.classList.add('w-50');
    div.classList.add('mb-3');
    div.classList.add('ml-auto');
    div.classList.add('mine');
    div.innerHTML = `<div class="media-body">
         <div class="bg-primary rounded pymine-2 px-3 mb-2 row">
            <p class="text-small mb-0 text-white">${mes}</p>
            </div>
            <p class="small text-muted">${username} | ${new Date().getDay()}/${new Date().getDate()} @${new Date().getHours()}:${new Date().getMinutes()}</p></div>`;
    let tr = document.createElement('tr');
    let td = document.createElement('td');
    td.appendChild(div);
    tr.appendChild(td);
    let tab = document.getElementById('tabla');
    tab.appendChild(tr);
    chatBox.appendChild(tab);
    a.appendChild(chatBox);
}

document.getElementById("myBtn2").click();