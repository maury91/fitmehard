//V 14.9.12
function FSdecodeError (err) {
    var ret = "";
    switch (err.code) {
        case FileError.NOT_FOUND_ERR:
            ret = "Not Found Error";
            break;
        case FileError.SECURITY_ERR:
            ret = "Security Error";
            break;
        case FileError.ABORT_ERR:
            ret = "Abort Error";
            break;
        case FileError.NOT_READABLE_ERR:
            ret = "Not Readable Error";
            break;
        case FileError.ENCODING_ERR:
            ret = "Encoding Error";
            break;
        case FileError.NO_MODIFICATION_ALLOWED_ERR:
            ret = "Not Modification Allowed Error";
            break;
        case FileError.INVALID_STATE_ERR:
            ret = "Invalid State Error";
            break;
        case FileError.SYNTAX_ERR:
            ret = "Syntax Error";
            break;
        case FileError.INVALID_MODIFICATION_ERR:
            ret = "Invalid Modification Error";
            break;
        case FileError.QUOTA_EXCEEDED_ERR:
            ret = "Quota Exceeded Error";
            break;
        case FileError.TYPE_MISMATCH_ERR:
            ret = "Type Mismatch Error";
            break;
        case FileError.PATH_EXISTS_ERR:
            ret = "Path Exists Error";
            break;
        case "null":
            ret = "Null Error";
            break;
        default:
            ret = "Undefined Error";
    }
    return {
        code : err.code,
        message : ret
    };
}

function MemoryManager(options) {
    this.onInit = function(){};
    //this.nativePath = cordova.file.dataDirectory||"";
    this.nativePath = "";
    if ((typeof cordova.file === "object")&&(typeof cordova.file.dataDirectory === "string"))
        this.nativePath = cordova.file.dataDirectory;
    //console.log(Object.keys(cordova.file));
    this.nativeResolved = false;
    this.basePath = "";
    if (options) {
        if (typeof options.onInit === "function")
            this.onInit = options.onInit;
        if (typeof options.path === "string")
            this.basePath = options.path;
    }
    this.method=0;
    var that = this;
    if (this.nativePath !== "") {
        window.resolveLocalFileSystemURL(this.nativePath, function(fe) {
            console.log('Use Default Dir');
            that.havefs(fe);
        },function(a){
            //Try to use Persistent
        	window.requestFileSystem(LocalFileSystem.PERSISTENT, 1024*1024, (function(fs){
                console.log('Use Persistent');
                that.havefs(fs.root);
            }), that.fail);
        });
    } else {
        //Try to use Persistent
    	window.requestFileSystem(LocalFileSystem.PERSISTENT, 1024*1024, (function(fs){
            console.log('Use Persistent');
            that.havefs(fs.root);
        }), this.fail);
    }    
}

FSManager = function(fe,writer) {
    this.fe=fe;
    this.w =writer;
}

FSManager.prototype = {
    pad : function(n, width, z) {
        n = n + '';
        return (n.length>=width)?n:new Array(width-n.length+1).join(z||'0')+n;
    },
    
    read : function(win,fail) {
        var reader = new FileReader();
        reader.onloadend = function(evt) {
            if ((evt.target.result===null)||(evt.target.result===''))
            	win('');
            else {
                try {
                    //Calculate length
                    var jslength = parseInt(evt.target.result.substring(0,8),16);
                    win((isNaN(jslength))?'':(evt.target.result.substring(8,jslength+8))); 
                } catch(e) {
                    console.log(e);
                    win('');
                }
            }
        };
        try {
        	reader.readAsText(this.fe, "UTF-8");    
        } catch (e) {
            fail(FSdecodeError(e));
        }
    },

    write : function(data,win,fail) {
        var that=this,
        	wready = function() {
                var wr = function(evt) {
                    that.w.seek(0);
                    that.w.write(that.pad((data.length).toString(16),8)+data);
                    that.w.onwriteend = function(r) {
                        that.w.onwriteend = null;
                        win(r);
                    };
                };
                if (that.w.length>0){
                    that.w.seek(that.w.length);
                    that.w.truncate(1);
                    that.w.onwriteend = wr; 
                } else wr();
            };
        if (that.w.readyState !== FileWriter.WRITING) 
        	wready();
        else 
            that.w.onwriteend = wready;
    }
}

LSManager = function(name) {
    this.name = name;
}

LSManager.prototype = {
    read : function(win,fail) {
        win(localStorage.getItem(this.name));
    },
    
    write : function(data,win,fail) {
        localStorage.setItem(this.name,data);
        if (localStorage.getItem(this.name)===data)
        	win();
        else
        	fail();
    }
}

MemoryManager.prototype = {
    
    fail : function() {
        this.method++;
        if (method===1) {
            console.log('Use temporary');
            //Persistent Fail, use Temporary
            window.requestFileSystem(LocalFileSystem.TEMPORARY, 1024*1024, (function(fs){
                that.havefs(fs);
            }), this.fail);
        } else {
            console.log('Use LocalStorage');
            //Temporary Fail, use LocalStorage
            this.havefs(null);
        }
    },
    
    file : function(name,win,fail) {
        var that=this;
    	if (this.fs === null) {
            //Use Localstorage
            win(new LSManager(name));
        } else {
            var obtainedFile = function(fe){
                    //Ok now we have the file, obtain reader and writer
                    fe.file(function(e){
                        fe.createWriter((function(w){
                            win(new FSManager(e,w));
                        }), that.fail);
                    });
                };
            if (this.basePath==='')
                this.fs.getFile(name+'.json', {create: false,exclusive:false},(obtainedFile), function(err){
                    if (err.code === FileError.NOT_FOUND_ERR) {
                        //Create
                        that.fs.getFile(name+'.json', {create: true,exclusive:false},(obtainedFile), function(err){
                            fail(FSdecodeError(err));
                        });
                    } else
                        fail(FSdecodeError(err));
                });
            else {
            	this.fs.getDirectory(this.basePath,{create:true},function(a) {
                    a.getFile(name+'.json', {create: false,exclusive:false},(obtainedFile), function(err){
                        if (err.code === FileError.NOT_FOUND_ERR) {
                            //Create
                            a.getFile(name+'.json', {create: true,exclusive:false},(obtainedFile), function(err){
                                fail(FSdecodeError(err));
                            });
                        } else
                            fail(FSdecodeError(err));
                    });
                },function(a) {
                    console.log(a);
                });
                
            }     
        } 
    },
    
    havefs : function(fs) {
        this.fs = fs;
        //Init
        this.onInit(this);
    },
    
    getManager : function(filename,ready) {
        var that=this;
        this.file(filename,
            function(manager){
                //Now i have manager and i'm read
                ready(manager);
            },function(err){
                //Error
                console.log('Error with filesystem : '+err.message);
                console.log('Use LocalStorage');
                //Use localstorage
                that.fs=null;
                that.file(filename,
                	function(manager){
                        ready(manager);
                    },
                    function(err){
                        console.log('Nothing works');
                    });
            });
    }
}