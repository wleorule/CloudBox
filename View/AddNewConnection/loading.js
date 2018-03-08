const electron = require('electron')
const remote = electron.remote
var Client = require('ftp');
const path = require('path')
var fs = require('fs');
var LINQ = require('node-linq').LINQ;
let crypto;
try {
  crypto = require('crypto');
} catch (err) {
  console.log('crypto support is disabled!');
}

// Props 
var spanFrom = document.getElementById("from");
var ftpServer = JSON.parse(localStorage.Server);
var tasksCount = 5; var tasksCompleted = 0;
var error = 0;
const BoxieCloudFolder = 'C:\\Users\\leora\\Documents\\BoxieCloud';
let offlineFiles = [];
let onlineFiles = [];

// Functions
function checkIfCanConnect(){
  
    var c = new Client();
    c.on('ready', function() {
      c.list(function(err, list) {
        if(err){
            spanFrom.innerHTML = "<font color='red'>ERROR (Can't connect to FTP server)</font> <a href='javascript:void(0)' onClick='closeWindow()'>Close</a>";
            error++;            
        }
        else{
            tasksCompleted++;
            spanFrom.innerHTML = tasksCompleted + ' / ' + tasksCount;
        }        
        c.end();
      });
      
    });
    
    c.connect({
        host: ftpServer.Address,
        port: ftpServer.Port,
        user: ftpServer.User,
        password: ftpServer.Pass
    });

    
}

function checkIfFilesExist(){
    var p = path.join(__dirname, "../../", "/Data/", ftpServer.ID + ".json");
    console.log(p);
    if (fs.existsSync(p)) {
        tasksCompleted++;
        spanFrom.innerHTML = tasksCompleted + " / " + tasksCount
    }
    else{
        /*fs.writeFile(p, "", (err) => {
            if (err) { 
                spanFrom.innerHTML = "<font color='red'>ERROR (Can't create files)</font> <a href='javascript:void(0)' onClick='closeWindow()'>Close</a>";
                error++;
            }
        
            
        }); */
        tasksCompleted++;
        spanFrom.innerHTML = tasksCompleted + " / " + tasksCount
    }
}

/* For later
function getSHA512(filePath){
    var hash = crypto.createHash('sha512'), 
    stream = fs.readFileSync(filePath);
    return checksum(stream, 'sha512');    
}

function checksum (str, algorithm, encoding) {
    return crypto
        .createHash(algorithm || 'md5')
        .update(str, 'utf8')
        .digest(encoding || 'hex')
} */

function getOfflineFiles(){

    

    fs.readdirSync(BoxieCloudFolder + '\\' + ftpServer.Name).forEach(file => {
        
        var p = BoxieCloudFolder + '\\' + ftpServer.Name + "\\" + file; // Path 
        var stats = fs.statSync(p);

        var d = new FileInfo();
        d.Name = file;
        d.DateModified = stats.mtime;
        //var sha = null;
        //sha = getSHA512(p);
        //d.SHA512 = sha;
        offlineFiles.push(d);
        //fs.appendFileSync( path.join(__dirname, '../../', '/Data/'+ftpServer.ID+'.json'), d + ',\n');
    });

    tasksCompleted++;
    spanFrom.innerHTML = tasksCompleted + " / " + tasksCount
}

function getOnlineFiles(){

    var c = new Client();
    c.on('ready', function() {
      c.list(function(err, list) {
        if (err) throw err;
        list.forEach(element => {
            var d = new FileInfo();
            d.Name = element.name;
            d.DateModified = element.date;
            onlineFiles.push(d);
        });
        checkDifference();
        c.end();
      });
      
    });
    
    c.connect({
        host: ftpServer.Address,
        port: ftpServer.Port,
        user: ftpServer.User,
        password: ftpServer.Pass
    });
    
    tasksCompleted++;
    spanFrom.innerHTML = tasksCompleted + " / " + tasksCount
}

function closeWindow(){
    var window = remote.getCurrentWindow();
    window.close();
}

function checkDifference(){

    let filesToDownload = []
    let filesToUpload = []
    let filesToAppendRemote = []

    //

    offlineFiles.forEach(e => {
        
        let d = new LINQ(onlineFiles).Where(
            function (l) { return l.Name == e.Name; }
        ).ToArray();

   
        if(d.length == 0){
            filesToUpload.push(e);
        }
        else{            
            d[0].Sync = true;
            if(d[0].DateModified != e.DateModified) {
                var dateServer = new Date(d[0].DateModified);
                var dateLocal = new Date(e.DateModified);

                if(dateServer > dateLocal){
                    filesToDownload.push(d[0]);
                }
                else{
                    filesToAppendRemote.push(e);
                }
            }
        }

    });

    let notSync = new LINQ(onlineFiles).Where(function(l) { return l.Sync == false; }).ToArray();

    if(notSync.length != 0){
        notSync.forEach(element => {
            filesToDownload.push(element);
        });   
    }

    console.log(filesToUpload);
    console.log(filesToAppendRemote);
    console.log(filesToDownload);

    UploadFiles(filesToUpload);
    AppendFilesOnServer(filesToAppendRemote);
    DownloadFiles(filesToDownload);

    
    var server = new Server(ftpServer.Name, ftpServer.Address, ftpServer.User, ftpServer.Pass, ftpServer.Port, ftpServer.ID);
    fs.appendFileSync( path.join(__dirname, '../../', '/Data/server.json'), server + ',');
    closeWindow();
}
function UploadFiles(files) {

    files.forEach(e => {
        var c = new Client();
        c.on('ready', function() {
            c.put(BoxieCloudFolder + '/' + ftpServer.Name + '/' + e.Name, e.Name, function(err) {
            if (err) throw err;
            c.end();
            });
        });
        
        c.connect({
            host: ftpServer.Address,
            port: ftpServer.Port,
            user: ftpServer.User,
            password: ftpServer.Pass
        });
    });   

}

function AppendFilesOnServer(files) {

    files.forEach(e => {
        var c = new Client();
        c.on('ready', function() {
            c.append(BoxieCloudFolder + '/' + ftpServer.Name  + '/' + e.Name, e.Name, function(err) {
            if (err) throw err;
            c.end();
            });
        });
        
        c.connect({
            host: ftpServer.Address,
            port: ftpServer.Port,
            user: ftpServer.User,
            password: ftpServer.Pass
        });
    });   

}

function DownloadFiles(files){
    files.forEach(e => {
        var c = new Client();
        c.on('ready', function() {
            c.get(e.Name, function(err, stream) {
            if (err) throw err;
            stream.once('close', function() { c.end(); });
            stream.pipe(fs.createWriteStream(BoxieCloudFolder + '/' + ftpServer.Name + "/" + e.Name));
            });
        });
    
        c.connect({
            host: ftpServer.Address,
            port: ftpServer.Port,
            user: ftpServer.User,
            password: ftpServer.Pass
        });
    });
}
// RUN 
checkIfCanConnect();

if(error == 0){
    checkIfFilesExist();
}

if(error == 0){
    getOfflineFiles();
}

if(error == 0){
    getOnlineFiles();
}

