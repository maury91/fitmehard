function JSONHelper(memory,name,options) {   
	this.name = name;
	this.method = 0;
    this.saveLater = false;
	this.saveTimeout;
	this.updateTimeout;
	this.onInit = this.onUpdate = this.onWrite = function(){};
	this.version = undefined;
	if (options) {
		if (typeof options.onWrite === "function")
			this.onWrite = options.onWrite;
		if (typeof options.onUpdate === "function")
			this.onUpdate = options.onUpdate;
		if (typeof options.onInit === "function")
			this.onInit = options.onInit;
		if (typeof options.version === "number") {
			this.version = options.version;
			this.name += this.version;
		}
        if (typeof options.saveLater === "boolean") 
			this.saveLater = options.saveLater;
	}
	//Use memory
	var that=this;
	memory.getManager(this.name, function(manager) {
		//Ready
		that.manager = manager;
		that.ready();
	});
}
JSONHelper.prototype = {
	
	ready : function() {
		var that = this;
		this.read(function(c){
			that.content = c;
			$.proxy(this.onInit,this)(c);
			this.onUpdate(c);
		});
	},
	
	write : function(value) {
		var that=this,
			data=JSON.stringify(value);
		that.manager.write(data,function(r){
			console.log('Writed success '+that.name,r);
		},function(){
			console.log('Writed fail');
		});    
	},
	
	save : function() {
		var that=this;
		clearTimeout(this.saveTimeout);
		clearTimeout(this.updateTimeout);
		this.updateTimeout = setTimeout(function(){
			that.onUpdate(that.content);
		},this.saveLater?1200:1);
		this.saveTimeout = setTimeout(function(){
			that.write(that.content);
		},this.saveLater?4000:1);
	},
	
	set : function(i,value,save) {
		this.content[i] = value;
		if (save === undefined || save === true)
			this.save();
	},
	
	del : function(i,save) {
		this.content.splice(i,1); 
		if (save === undefined || save === true)
			this.save();
	},
	
	get : function(i) {
		return this.content[i];
	},
	
	getAll : function() {
		return this.content;  
	},
	
	search : function(col,value) {  
		for (i in this.content) {
			if (this.content[i][col] === value)
				return i;
		}
		return -1;
	},
	
	search2 : function(col,value,col2,value2) { 
		for (i in this.content) {
			if ((this.content[i][col] === value)&&(this.content[i][col2] === value2))
				return i;
		}
		return -1;
	},
	
	read : function(func) {
		//Read the data with the manager
		var that=this;
		that.manager.read(function(data){
			if ((data===null)||(data==="")) {
				that.write([]);
				content = [];
			} else {
				try {
					content = JSON.parse(data);
				} catch(e) {
					content = [];
				}
			}
			func.call(that,content);
		},function(err) {
			console.log(err);
			content = [];
			func.call(that,content);
		});
	},
	
	insert : function(value,save) {
		var id = this.content.push(value)-1;
		if (save === undefined || save === true)
			this.save();
		return id;
	},
	
	clear : function(save) {
		this.content = [];
		this.onUpdate(this.content);
		if (save === undefined || save === true)
			this.save();
	}
};