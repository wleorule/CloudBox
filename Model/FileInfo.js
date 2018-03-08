class FileInfo {
    
    constructor(){
        this.Name;
        //this.SHA512;
        this.DateModified; 
        this.Sync = false;
    }

    toString(){
        return '{"Name": "'+this.Name+'", "DateModified": "'+this.DateModified+'", "Sync": '+this.Sync+'}';
    }
}