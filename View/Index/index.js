const electron = require('electron')
const remote = electron.remote
const BrowserWindow = electron.remote.BrowserWindow
const path = require('path')
const fs = require('fs')
var Client = require('ftp');
var LINQ = require('node-linq').LINQ;


const btnAddNew = document.getElementById("btnAddNew");
let serverArray = null;
let serverInfo = [];
var currentServer = null;
const BoxieCloudFolder = 'C:\\Users\\leora\\Documents\\BoxieCloud';
let offlineFDown = [];
let onlineFDown = [];

let addNewWindow;

// Funkcije *******************************************************************************
var tempBroj = 0;
function getOnlineCount(srv){
    var c = new Client();
    c.connect({
        host: srv.Address,
        port: srv.Port,
        user: srv.User,
        password: srv.Pass
    });

    
    c.list(function(err, list) {
        if(err){
        }        
        tempBroj = list.length;
        c.end();
      });
}

function getOfflineCount(path){
    var brojac = 0;
    fs.readdirSync(path).forEach(file => {
     brojac++;
    });
    return brojac;
}

function refreshServerList() {
    
    var dataString = "[" + fs.readFileSync(path.join(__dirname, '../../', 'Data/server.json')).toString() + '{"ID": "", "Name": "", "Address": "", "User": "", "Pass": "", "Port": ""}]';
    serverArray = JSON.parse(dataString);

    const serverList = document.getElementById('serverList');
    serverList.innerHTML = "";

    var zadnji = serverArray.length - 1;
    for(i in serverArray) {
        if(i != zadnji)
        {
            getOnlineCount(serverArray[i]);
            var fOnlineNum = tempBroj;
            console.log(fOnlineNum);
            var info = { ID: serverArray[i].ID, filesOnline: fOnlineNum, filesOffline: getOfflineCount(BoxieCloudFolder + '\\' + serverArray[i].Name), }; 
            serverInfo.push(info);
            serverList.innerHTML += '<li onClick="connectToServer(\''+serverArray[i].ID+'\')" id="'+serverArray[i].ID+'">' + serverArray[i].Name + '</li>';
        }
    }


}

refreshServerList();


function UploadFile(srv, fileName){ 

    var c = new Client();
    c.on('ready', function() {
        c.put(BoxieCloudFolder + "/" + srv.Name + '/' + fileName, fileName, function(err) {
        if (err) throw err;
        c.end();
        });
    });
    
    c.connect({
        host: srv.Address,
        port: srv.Port,
        user: srv.User,
        password: srv.Pass
    });
}

function DownloadFile(srv, fileName){
    var c = new Client();
    c.on('ready', function() {
        c.get(fileName, function(err, stream) {
        if (err) throw err;
        stream.once('close', function() { c.end(); });
        stream.pipe(fs.createWriteStream(BoxieCloudFolder + "/" + srv.Name + "/" + fileName));
        });
    });
   
    c.connect({
        host: srv.Address,
        port: srv.Port,
        user: srv.User,
        password: srv.Pass
    });
}

function connectToFTP(server){

    checkNewFiles();

    
}



function connectToServer(serverID){

    var odabraniServer = null;
    for(i in serverArray){
        if(serverArray[i].ID == serverID){
            odabraniServer = serverArray[i];
        }
    }
    var odabraniID = document.getElementById(odabraniServer.ID);
    odabraniID.className += "active";

    currentServer = odabraniServer;
    //Povezi na FTP server
    connectToFTP(odabraniServer);
}

// End of Funkcije ************************************************************************

// EVENTOVI *******************************************************************************

btnAddNew.addEventListener('click', function(event) {    
    var winPath = path.join('file://', __dirname, "../", "/AddNewConnection/index.html");

    addNewWindow = new BrowserWindow({frame: false,alwaysOnTop: true, width: 400, height: 380, icon: path.join(__dirname, '../../', '/Assets/IMG/Icon.ico')});
    addNewWindow.on('closed', () => {
        addNewWindow = null;
    });
    addNewWindow.loadURL(winPath);
    addNewWindow.show();
});



// End of EVENTOVI **************************************************************************

setTimeout(refreshServerList(), 1500);
setTimeout(checkNewFiles(), 1500);

function UploadFiles(srv){

    let offlineF = [];
let onlineF = [];

    var pth = path.join(BoxieCloudFolder, '\\', srv.Name);
    console.log(pth);
    fs.readdirSync(pth).forEach(file => {
        offlineF.push(file);
    });

    var c = new Client();
    c.connect({
        host: srv.Address,
        port: srv.Port,
        user: srv.User,
        password: srv.Pass
    });

    c.list(function(err, list) {
        if (err) throw err;
        list.forEach(element => {
            onlineF.push(element.name);
        });
        c.end();
    });

    offlineF.forEach(element => {
        let d = new LINQ(onlineF).Where(function(l) { return l == element; }).ToArray();

        if(d.length == 0){
            console.log("Upload: " + element);
            UploadFile(srv, element);
        }
    });
}



function DownloadFiles(srv){

    

    var pth = path.join(BoxieCloudFolder,  '\\' , srv.Name)
    fs.readdirSync(pth).forEach(file => {
        offlineFDown.push(file.Name);
    });

    var c = new Client();
    c.connect({
        host: srv.Address,
        port: srv.Port,
        user: srv.User,
        password: srv.Pass
    });

    c.list(function(err, list) {
        if (err) throw err;
        list.forEach(element => {
            onlineFDown.push(element.name);
            
        });
        c.end();
    });

  
    for(i in onlineFDown){
        console.log(onlineFDown[i]);
        var hit = false;
        for(j in offlineFDown) {
            if(onlineFDown[i] == offlineFDown[j]) {
                hit = true;
            }
        }
            
        if(hit == false){
            DownloadFile(srv, onlineFDown[i]);
        }
    };
}

function checkNewFiles(){

    var mx = serverArray.length;
    for(i in serverArray)
     {
        /*var info; 
        serverInfo.forEach(y => {
            if(y.ID == x.ID){
                info = y;
            }
        });
        
        getOnlineCount(x);
        var online = tempBroj;
        var offline = getOfflineCount(BoxieCloudFolder + '\\' + x.Name);

        console.log(x);
        
        if(info != undefined){
            if(online != info.filesOnline){*/
                
            /*}

            if(offline != info.filesOffline){*/
                
           /* }
        }*/
        if(i < (mx-1)){
            DownloadFiles(serverArray[i]);
            UploadFiles(serverArray[i]);
        }
        
    }
}