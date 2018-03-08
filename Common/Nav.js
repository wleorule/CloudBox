const btnClose = document.getElementById("btnClose");
const btnMin = document.getElementById("btnMin");

btnClose.addEventListener('click', function(event){

    console.log(1);
    var window = remote.getCurrentWindow();
    window.close();
  
});

btnMin.addEventListener('click', function(event){

    console.log(1);
    var window = remote.getCurrentWindow();
    
    window.minimize();
});