const electron = require('electron')
const remote = electron.remote
const BrowserWindow = electron.remote.BrowserWindow
const path = require('path')
var fs = require('fs');
var _guid = require('guid');
var backslash = require('backslash');


const btnAdd = document.getElementById("btnAdd");



btnAdd.addEventListener('click', function(event) {

    var name = document.getElementById("ftpName").value;
    var host = document.getElementById("ftpHost").value;
    var user = document.getElementById("ftpUser").value;
    var pass = document.getElementById("ftpPass").value;
    var port = document.getElementById("ftpPort").value;
    var guid = _guid.raw();


    // Save data to file
    var server = new Server(name, host, user, pass, port, guid);
    
    localStorage.Server = server;
    OpenLoading();

    var window = remote.getCurrentWindow();
    window.close();
});

function OpenLoading(){
    var winPath = path.join('file://', __dirname, "../", "/AddNewConnection/loading.html");

    addNewWindow = new BrowserWindow({frame: false,alwaysOnTop: true, width: 250, height: 150});
    addNewWindow.on('closed', () => {
        addNewWindow = null;
    });
    addNewWindow.loadURL(winPath);
    addNewWindow.show();
}
