class Server {

    constructor(name, address, user, pass, port, guid){
        this.Name = name;
        this.Address = address;
        this.User = user;
        this.Pass = pass;
        this.Port = port;
        this.ID = guid
    }
    
    toString(){
        return '{"ID": "'+this.ID+'", "Name": "'+this.Name+'", "Address": "'+this.Address+'", "User": "'+this.User+'", "Pass": "'+this.Pass+'", "Port": "'+this.Port+'"}'
    }

}