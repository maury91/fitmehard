document.addEventListener('deviceready', function () {
    var version=1.0;
    new MemoryManager({
        path : 'fitmehard',
        onInit : function(memory) {
            console.log('Have Memory');
            ExercisesHelper = new JSONHelper(memory,'exercises',{
                version : version,
                onUpdate : function(a){
                    
                }
            });
        }  
    });
}, false); 