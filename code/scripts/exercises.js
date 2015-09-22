Element.prototype.clear = function(){while (this.firstChild) {this.removeChild(this.firstChild);}};
function similarRad(a,b) {
    var
        d = Math.abs(a-b),
        b1 = b+fullRAD,
        b2 = b-fullRAD,
        b3 = b+fullRAD*2,
        b4 = b-fullRAD*2,
        d1 = Math.abs(a-b1),
        d2 = Math.abs(a-b2),
        d3 = Math.abs(a-b3),
        d4 = Math.abs(a-b4);
    if (d<d1) {
        if (d<d2){
            if (d<d3) {
                if (d<d4)
                    return b;
                return b4;
            }
            if (d3<d4)
                return b3;
            return b4;
        }
        if (d2<d3) {
            if (d2<d4)
                return b2;
            return b4;
        }
        if (d3<d4)
            return b3;
        return b4;
    }
    if (d1<d2) {
        if (d1<d3) {
            if (d1<d4)
                return b1;
            return b4;
        }
        if (d3<d4)
            return b3;
        return b4;
    }
    if (d2<d3) {
        if (d2<d4)
            return b2;
        return b4;
    }
    if (d3<d4)
        return b3;
    return b4;
};
(function () {
    var movement;
    var excRate=10,diffVal=3.5;
    
    var addValueToExc = function(arr) {
        var now = (new Date()).getTime();
        arr.t = now;
        excPositions.push(arr);
        var l = excPositions.length,
            l2= l%excMovements;
        if (l>1)
            arr.time = arr.t-excPositions[l-2].t;
        excProgressA.endAngle(2*Math.PI*(l/(excMovements*excRate)));
        excProgress.attr("d",excProgressA);
        if (l>=excMovements*excRate)
            excProgress2A.endAngle(2*Math.PI);
        else
            excProgress2A.endAngle(2*Math.PI*(l2/excMovements));
        excProgress2.attr("d",excProgress2A);
        if (l>=excMovements*excRate) {
            accelAction=0;
            vibrate(1000);
            var x=[],y=[],z=[],ax=[],ay=[],az=[],minx=[],miny=[],minz=[],maxx=[],maxy=[],maxz=[],tx=[];
            movement = [];
            for (var j=0;j<excMovements;j++) {
                var n=0;
                x[j] = [];y[j] = [];z[j] = [];
                ax[j] = [];ay[j] = [];az[j] = [],tx[j] = [];
                minx[j] = 999;miny[j] = 999;minz[j] = 999;
                maxx[j] = -999;maxy[j] = -999;maxz[j] = -999;
                var lax=null,lay,laz;
                for (var i=0;i<excRate;i++) {
                    var p=j+i*excMovements;
                    x[j].push(excPositions[p].x);
                    y[j].push(excPositions[p].y);
                    z[j].push(excPositions[p].z);
                    minx[j] = Math.min(minx[j],excPositions[p].x);
                    miny[j] = Math.min(miny[j],excPositions[p].y);
                    minz[j] = Math.min(minz[j],excPositions[p].z);
                    maxx[j] = Math.max(maxx[j],excPositions[p].x);
                    maxy[j] = Math.max(maxy[j],excPositions[p].y);
                    maxz[j] = Math.max(maxz[j],excPositions[p].z);
                    if (typeof excPositions[p].ax === "number") {
                        n++;
                        if (lax===null) {
                            lax = excPositions[p].ax;
                            lay = excPositions[p].ay;
                            laz = excPositions[p].az;
                        } else {
                            lax = similarRad(lax,excPositions[p].ax);
                            lay = similarRad(lay,excPositions[p].ax);
                            laz = similarRad(laz,excPositions[p].ax);
                        }
                        console.log(lax,lay,laz);
                        ax[j].push(lax);
                        ay[j].push(lay);
                        az[j].push(laz);
                        tx[j].push(excPositions[p].time);
                    }
                }
                movement.push({
                    x : math.median(x[j]),
                    y : math.median(y[j]),
                    z : math.median(z[j]),
                    ax : math.median(ax[j]),
                    ay : math.median(ay[j]),
                    az : math.median(az[j]),
                    mx : minx[j],
                    my : miny[j],
                    mz : minz[j],
                    Mx : maxx[j],
                    My : maxy[j],
                    Mz : maxz[j],
                    t  : math.median(tx[j])
                })
            }
            //Navigate
            app.navigate("#excSave","fade");
        }
    }
    var mmod = [],oldAx,oldAy,oldAz,curDataX=[],curDataY=[],curDataZ=[],lastPos = {x:0,y:0,z:0,t:0},excMovements,excName,
        excProgress = null,excProgressA,excProgress2,excProgress2A;
    window.accelActions[2] = function(now) {
        var dx=null,dy,dz,
            t = (mediumAcc.t-lastPos.t);
        if ((t>=60)&&(t<=90)) {
            mmod.unshift({x:mediumAcc.x,y:mediumAcc.y,z:mediumAcc.z});
            mmod.splice(10,3);
        }                    
        if (excPositions.length>0) {
           var
                x = (mediumAcc.x-lastPos.x)*1000/t,
                y = (mediumAcc.y-lastPos.y)*1000/t,
                z = (mediumAcc.z-lastPos.z)*1000/t;
            if ((t>=60)&&(t<=90)) {
                var
                    ax = Math.atan2(y,z),
                    ay = Math.atan2(x,z),
                    az = Math.atan2(y,x);
                dx = Math.sqrt(y*y+z*z);
                dy = Math.sqrt(x*x+z*z);
                dz = Math.sqrt(y*y+x*x);
                if (now > stopUntil+100) {
                    if (curDataX.length>0) {
                        ax = similarRad(oldAx,ax);
                        ay = similarRad(oldAy,ay);
                        az = similarRad(oldAz,az);
                    }
                    curDataX.push(ax);
                    curDataY.push(ay);
                    curDataZ.push(az);
                    oldAx = ax;
                    oldAy = ay;
                    oldAz = az;   
                }
            } else if (t>60)
                console.log(t);
                
        }
        if ((dx!==null)&&((dx+dy+dz)/3<.7)) {
            if (excPositions.length>0) {
                  var b = excPositions[excPositions.length-1];
                  a = ((Math.abs(excStill.x-b.x)>diffVal)
                     ||(Math.abs(excStill.y-b.y)>diffVal)
                     ||(Math.abs(excStill.z-b.z)>diffVal));
              }
              if (a) {
                  //Calculate median
                  var
                      aax = math.median(curDataX),
                      aay = math.median(curDataY),
                      aaz = math.median(curDataZ),
                      bax = math.mean(curDataX),
                      bay = math.mean(curDataY),
                      baz = math.mean(curDataZ),
                      vax = Math.abs(aax-bax),
                      vay = Math.abs(aay-bay),
                      vaz = Math.abs(aaz-baz);
                  while(curDataX.length > 0) { curDataX.pop(); }
                  while(curDataY.length > 0) { curDataY.pop(); }
                  while(curDataZ.length > 0) { curDataZ.pop(); }
                  var nx=0,ny=0,nz=0;
                  for (var i=0,l=mmod.length;i<l;i++) {
                      nx += mmod[i].x;
                      ny += mmod[i].y;
                      nz += mmod[i].z;
                  }
                  addValueToExc({x:nx/l,y:ny/l,z:nz/l,ax:aax,ay:aay,az:aaz,vx:vax,vy:vay,vz:vaz});
                  if (accelAction>0) { 
                      vibrate(50);
                      stopUntil=now+200;
                      console.log('end');
                      beep();
                  }
              }
        }
        if ((Math.abs(excStill.x-mediumAcc.x)>.3)
          ||(Math.abs(excStill.y-mediumAcc.y)>.3)
          ||(Math.abs(excStill.z-mediumAcc.z)>.3)){
              //Moved
              excStill = {x:mediumAcc.x,y:mediumAcc.y,z:mediumAcc.z};
              excCounter = 0;
          } else {
              excCounter++;
              if (excCounter>60) {
                  //Check last position
                  excCounter = 0;
                  var a=true;
                  if (excPositions.length>0) {
                      var b = excPositions[excPositions.length-1];
                      a = ((Math.abs(excStill.x-b.x)>diffVal)
                         ||(Math.abs(excStill.y-b.y)>diffVal)
                         ||(Math.abs(excStill.z-b.z)>diffVal));
                      var
                          aax = math.median(curDataX),
                          aay = math.median(curDataY),
                          aaz = math.median(curDataZ),
                          bax = math.mean(curDataX),
                          bay = math.mean(curDataY),
                          baz = math.mean(curDataZ),
                          vax = Math.abs(aax-bax),
                          vay = Math.abs(aay-bay),
                          vaz = Math.abs(aaz-baz);
                  }
                  if (a) {
                      while(curDataX.length > 0) { curDataX.pop(); }
                      while(curDataY.length > 0) { curDataY.pop(); }
                      while(curDataZ.length > 0) { curDataZ.pop(); }
                      var nx=0,ny=0,nz=0;
                      for (var i=0,l=mmod.length;i<l;i++) {
                          nx += mmod[i].x;
                          ny += mmod[i].y;
                          nz += mmod[i].z;
                      }
                      if (excPositions.length>0)
                          addValueToExc({x:nx/l,y:ny/l,z:nz/l,ax:aax,ay:aay,az:aaz,vx:vax,vy:vay,vz:vaz});
                      else
                          addValueToExc({x:nx/l,y:ny/l,z:nz/l});
                      if (accelAction>0) {
                          vibrate(300);
                          stopUntil=now+400;
                          console.log('end long');
                          beep();
                      }
                  }
              }
          }
        if (lastPos.t+60<=mediumAcc.t)
            lastPos = {x:mediumAcc.x,y:mediumAcc.y,z:mediumAcc.z,t:mediumAcc.t};
        
    }
    /****** MVVM *****/
    window.APP.exct = {
        showed : function() {
            if (typeof screen.lockOrientation === "function") {
                screen.lockOrientation('portrait-primary');
                plugins.insomnia.allowSleepAgain();
            }
            //Construct list
            var extMov = document.getElementById('excMovements'),
                fragment = document.createDocumentFragment();
            extMov.clear();
            for (var i=0;i<excMovements;i++) {
                var form = document.createElement('div'),
                    h1 = document.createElement('h1'),
                    h2_1 = document.createElement('h2'),
                    h2_2 = document.createElement('h2'),
                    h2_3 = document.createElement('h2'),
                    tarea = document.createElement('textarea'),
                    inp = document.createElement('input'),
                    inp2 = document.createElement('input');
                form.className = "form movement";
                h1.textContent = "Movimento "+(i+1);
                h2_1.textContent = "Descrizione Lunga";
                h2_2.textContent = "Descrizione Breve";
                h2_3.textContent = "Descrizione Incompleto";
                inp.type = "text";
                inp.className = "shortDesc";
                tarea.className = "longDesc";
                inp2.type = "text";
                inp2.className = "incDesc";
                form.appendChild(h1);
                form.appendChild(h2_1);
                form.appendChild(tarea);
                form.appendChild(h2_2);
                form.appendChild(inp);
                form.appendChild(h2_3);
                form.appendChild(inp2);
                fragment.appendChild(form);
            }
            extMov.appendChild(fragment);
        },
        save : function() {
            var eIntro = document.getElementById('exerciseIntro'),stop=false;
            if (eIntro.value.trim().length < 10) {
                setTimeout(function(){
                    $(eIntro).focus();
                    /*setTimeout(function(){
                        if ((cordova.platformId==="android")&&(!navigator.simulator))
                            cordova.plugins.Keyboard.show();
                    },50);*/
                },310);
                return;
            }
            $('#excMovements > .movement').each(function(i,el) {
                //Test
                var e = el.getElementsByClassName('longDesc');
                if (e.length!==1) {stop = true;return false;}
                if (e[0].value.trim().length < 10) {
                    setTimeout(function(){
                        $(e).focus();
                    },310);
                    stop = true;
                    return false;
                }
                movement[i].longDesc = e[0].value.trim();
                e = el.getElementsByClassName('shortDesc');
                if (e.length!==1) {stop = true;return false;}
                if (e[0].value.trim().length < 3) {
                    setTimeout(function(){
                        $(e).focus();
                    },310);
                    stop = true;
                    return false;
                }
                movement[i].shortDesc = e[0].value.trim();
                e = el.getElementsByClassName('incDesc');
                if (e.length!==1) {stop = true;return false;}
                if (e[0].value.trim().length < 3) {
                    setTimeout(function(){
                        $(e).focus();
                    },310);
                    stop = true;
                    return false;
                }
                movement[i].incDesc = e[0].value.trim();
            });
            if (stop) return;
            //Save the exercise to memory
            ExercisesHelper.insert({
                intro : eIntro.value.trim(),
                name : excName,
                moves : movement
            });
            app.navigate("views/exercises.html","fade");
        }
    };
    window.APP.exc = {
        showed : function() {
            if (typeof screen.lockOrientation === "function") {
                screen.lockOrientation('portrait-secondary');
                plugins.insomnia.keepAwake();
            }
            if (excProgress === null) {
                excProgressA = d3.svg.arc().startAngle(0).endAngle(0)
                                 .innerRadius((window.innerWidth/2)*.7).outerRadius((window.innerWidth/2)*.9);
                excProgress2A = d3.svg.arc().startAngle(0).endAngle(0)
                                 .innerRadius((window.innerWidth/2)*.5).outerRadius((window.innerWidth/2)*.7);
                var a = d3.select('#excRecordProgress').append("svg");
                excProgress = a.append("path").attr("d",excProgressA)
                                 .attr("transform","translate("+(window.innerWidth*.5)+","+(window.innerWidth*.5)+")")
                                 .style("fill","#eee");
                excProgress2= a.append("path").attr("d",excProgress2A)
                                 .attr("transform","translate("+(window.innerWidth*.5)+","+(window.innerWidth*.5)+")")
                                 .style("fill","#7c3429");
            }
            accelAction=0;
            speakPause("Assumi la prima posizione e tienila fino alla vibrazione",100,function(){
                accelAction=2;
            });
            excStill = {x:0,y:0,z:0};
            excPositions = [];
            excCounter = 0;
        },
        hide : function() {
            if (accelAction===2) accelAction=0;
        }
    };
    var exercisesListD = true;
    var onExerciseTap = function(action,id) {
        var es = ExercisesHelper.get(id);
        switch(action) {
            case 1 :
                //Elimina
                window.plugins.actionsheet.show({
                    'title' : 'Eliminare davvero l\'esercizio "'+es.name+'"',
                    'buttonLabels': ['No'],
                    'addDestructiveButtonWithLabel' : 'Si'
                }, function(bIndex) {
                    if (bIndex===1) {
                        //Elimina
                        ExercisesHelper.del(id);
                        APP.exercises.showed();
                    }
                });
            break;
            case 2 :
                //Prova Esercizio
                window.APP.startWorkout.exerciseId = id;
                app.navigate("views/beforeWorkout.html","overlay:down");
            break;
        }
    };
    window.APP.startWorkout = {
        exerciseId : 0,
        showed : function() {
            if (typeof screen.lockOrientation === "function") {
                screen.lockOrientation('portrait-primary');
                plugins.insomnia.allowSleepAgain();
            }
            var es = ExercisesHelper.get(window.APP.startWorkout.exerciseId);
            setTimeout(function() {
                app.view().header.find(".km-navbar").data("kendoMobileNavBar").title(es.name);
            },100);
        },
        start : function() {
            //Check values
            var es = document.getElementById('exerciseSeries'),
                ep = document.getElementById('exerciseRipetizioni'),
                esv = parseInt(es.value),
                epv = parseInt(ep.value);
            if (isNaN(esv)||(esv<1)) {
                setTimeout(function() { $(es).focus();},300);
                return ;
            }
            if (isNaN(epv)||(epv<1)) {
                setTimeout(function() { $(ep).focus();},300);
                return ;
            }
            window.APP.workout.exercises.length = 0;
            window.APP.workout.exercises.push({
                i : window.APP.startWorkout.exerciseId,
                s : esv,
                r : epv
            });
            afterCalibrate='workout.html';
            app.navigate("views/beforeCalibrate.html","overlay:down");
        }
    };
    window.APP.exercises = {
        showed : function() {
            if (typeof screen.lockOrientation === "function") {
                screen.lockOrientation('portrait-primary');
                plugins.insomnia.allowSleepAgain();
            }
            //Show Exercises list
            var exercisesList = document.getElementById('exercisesList'),
                eList = ExercisesHelper.getAll(),
                fragment = document.createDocumentFragment();
            exercisesList.clear();
            for (var i=0;i<eList.length;i++) {
                var li = document.createElement('li'),
                    tit = document.createElement('span');
                tit.textContent = eList[i].name;
                tit.className = "title";
                li.appendChild(tit);
                li.dataset.id = i;
                fragment.appendChild(li);
            }
            exercisesList.appendChild(fragment);
            if (exercisesListD) {
                exercisesListD = false;
                exercisesList.addEventListener("touchend",function(e){
                    //
                    var t = e.target,m=4;
                    while ((t.nodeName !== "LI")&&(m>0)) {
                        t = t.parentNode;
                        m--;
                    }
                    if (t.nodeName === "LI") {
                        var id = t.dataset.id;
                        window.plugins.actionsheet.show({
                            'buttonLabels': ['Prova Esercizio', 'Modifica Esercizio'],
                            'addDestructiveButtonWithLabel' : 'Elimina'
                        }, function(bIndex) {
                            onExerciseTap(bIndex,id);
                        });
                    }
                },false);
            }
        },
        hide : function() {
        },
        add : function() {
            app.navigate("#exercisesNew");
        },
        record : function() {
            //Test campi
            var
                exname = document.getElementById('exerciseName'),
                exmov = document.getElementById('exerciseMovements'),
                mov = parseInt(exmov.value);
            if (exname.value.trim().length<3) {
                setTimeout(function(){
                    $(exname).focus();
                    /*setTimeout(function(){
                        if ((cordova.platformId==="android")&&(!navigator.simulator))
                            cordova.plugins.Keyboard.show();
                    },50);*/
                },310);
                return;
            }
            if (isNaN(mov)||(mov<2)) {
                setTimeout(function(){
                    exmov.value="";
                    $(exmov).focus();
                    /*setTimeout(function(){
                        if ((cordova.platformId==="android")&&(!navigator.simulator))
                            cordova.plugins.Keyboard.show();
                    },50);*/
                },310);
                return;
            }
            excName = exname.value.trim();
            excMovements = mov;
            afterCalibrate='exc.html#excRecord';
            app.navigate("views/beforeCalibrate.html","overlay:down");
        }
    }
}());