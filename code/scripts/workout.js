sensitivity=.2;
(function(){
    var stats=[],svg1=null,svg2,svg3,_timeArc,workoutTime,workoutTimeC,_timePath,_timeArc100=false,svgSize,waiting=false,waitTime=false,
        serie,ripetizione,serieT,ripetizioneT,sc=null,st,rc,rt,mov,started,curExercise,es,ess,curMov,speaked,lastMov;
    var updateExerciseInfo = function() {
        if (sc===null) {
            sc = document.getElementById('workoutSerieCurr');
            st = document.getElementById('workoutSerieTot');
            rc = document.getElementById('workoutRipCurr');
            rt = document.getElementById('workoutRipTot');
        }
        st.textContent = serieT;
        rt.textContent = ripetizioneT;
        sc.textContent = serie;
        rc.textContent = ripetizione;
        if (exData.length<1) return;
        var points = math.mean(exData);
        exData.length=0;
        //Create new arc
        if (ripetizione===2) {
            var _arc = d3.svg.arc().startAngle(Math.PI*2*((serie-2)/serieT)).endAngle(Math.PI*2*((serie-1)/serieT)).innerRadius(svgSize*.3).outerRadius(svgSize*.5);
            d3.select(svg1).append('path').attr("d",_arc).style("fill","#eee").attr("transform","translate("+svgSize*.5+","+svgSize*.5+")");
            d3.select(svg2).selectAll("*").remove();
        }
        var _arc2 = d3.svg.arc().startAngle(Math.PI*2*((ripetizione-2)/ripetizioneT)).endAngle(Math.PI*2*((ripetizione-1)/ripetizioneT)).innerRadius(svgSize*.3).outerRadius(svgSize*.5);
        d3.select(svg2).append('path').attr("d",_arc2).attr("fill","hsl("+points*10+",60%,50%)").attr("transform","translate("+svgSize*.5+","+svgSize*.5+")");
    }
    var overSayed=false,incSayed=false,exData=[],movTime,oldAx,oldAy,oldAz,curDataX=[],curDataY=[],curDataZ=[],curDataAX=[],curDataAY=[],curDataAZ=[],lastPos = {x:0,y:0,z:0,t:0};
    var startNextExercise = function() {
        //Say exercise name
        waitTime=false;
        ess= window.APP.workout.exercises[curExercise];
        es = ExercisesHelper.get(ess.i);
        _timeArc.startAngle(0);
        updateExerciseInfo();
        speakPause(es.name,500,function(){
            waiting=false;
            if (serie===1) started=true;
            speaked=false;
            lastMov = es.moves[es.moves.length-1];
            curMov = es.moves[mov];
            movTime=(new Date()).getTime();
        });
    }
    var nextExercise = function() {
        ripetizione=1;
        //List of exercises
        curExercise++;
        waiting=true;
        //clearTimeout(nextMovementTimeout);
        if (curExercise>=window.APP.workout.exercises.length) {
            serie++;
            if (serie>serieT) {
                speak('Completato');
                //Save data
                console.log(stats);
                //Save stats
                app.navigate('views/home.html','fade');
                return;
            }
            curExercise=0;
            waitTimeS=30000;
            waitTime=(new Date()).getTime()+waitTimeS;
            workoutTimeC='';
            _timePath.attr("fill","hsl(100,60%,50%)");
            _timeArc.endAngle(Math.PI*2);
            speak('30 secondi di pausa');
            setTimeout(startNextExercise,30000);
        } else
            startNextExercise();
        updateExerciseInfo();
    };
    var nextMovement = function(cMov,acc,time) {
        /*waiting=true;
        waitTimeS=100;
        nextMovementTimeout = setTimeout(function(){
            waiting=false;
        },110);
        waitTime=(new Date()).getTime()+waitTimeS;*/
        console.log('next Movement '+mov);
        acc.x = similarRad(cMov.ax,acc.x);
        acc.y = similarRad(cMov.ay,acc.y);
        acc.z = similarRad(cMov.az,acc.z);
        _timeArc100=false;
        _timeArc.startAngle(0);
        _timeArc.endAngle(0);
        _timePath.attr("d",_timeArc);
        workoutTime.textContent = '';
        var points=10;
        if (time>cMov.t) 
            points -= (time-cMov.t)*2/cMov.t;
        points -= (Math.abs(acc.x-cMov.ax)+Math.abs(acc.y-cMov.ay)+Math.abs(acc.y-cMov.ay));
        if (points<0) points=0;
        exData.push(points);
        mov++;
        console.log('mov',mov,'totMov',es.moves.length);
        if (mov>=es.moves.length) {
            //Increment ripetizioni
            started=false;
            ripetizione++;
            mov=0;
            console.log('rip',ripetizione,'mov',mov);
            var d=[];
            console.log('stats',stats);
            for (var i in exData)
                d.push(exData[i]);
            console.log('d',d,'curExercise',curExercise,'serie',serie-1);
            stats[curExercise].exs[serie-1].push(d);
            console.log('addedstats',stats);
            //Add to stats
            console.log('rip',ripetizione,'ripT',ripetizioneT);
            if (ripetizione>ripetizioneT)
                return nextExercise();
            updateExerciseInfo();
        }
        speaked=false;
        lastMov = curMov;
        console.log('new movement '+mov);
        curMov = es.moves[mov];
    };
    window.accelActions[3] = function(now) {
        var dx=null,dy,dz,
            t = (mediumAcc.t-lastPos.t);
        if (waiting) {
            if (waitTime!==false) {
                //Update arc
                var ttt= waitTime-now;
                    tt = Math.ceil(ttt/1000),
                    tot= 1-ttt/waitTimeS;
                if (workoutTimeC!==tt) {
                    workoutTime.textContent = workoutTimeC = tt;
                }
                _timeArc.startAngle(Math.PI*2*tot);
                _timePath.attr("d",_timeArc);
            }
            return;
        } else {
            if ((ripetizione>1)||(mov!==0)) {
                //Update time
                var tot = (now-movTime)/curMov.t;
                if (tot>1) {
                    if (!_timeArc100) {
                        _timeArc.endAngle(Math.PI*2);
                        _timePath.attr("d",_timeArc);
                        _timeArc100 = true;
                    }
                    _timePath.attr("fill","hsl("+Math.max(0,100*(1-(tot-1)/5))+",60%,50%)");
                } else {
                    if (_timeArc100) 
                        _timePath.attr("fill","hsl(100,60%,50%)");
                    _timeArc.endAngle(Math.PI*2*tot);
                    _timePath.attr("d",_timeArc);
                }
                    
            }
        }
        if (!speaked) {
            overSayed=false;
            incSayed=false;
            if (started) {
                waiting=true;
                speak(curMov.longDesc);
                setTimeout(function(){
                    speaked=true;
                    movTime=(new Date()).getTime();
                    waiting=false;
                },1200);
            } else {
                if ((ripetizione<3)||(mov!==es.moves.length-1)) {
                    waiting=true;
                    speak(curMov.shortDesc,function(){
                        speaked=true;
                        movTime=(new Date()).getTime();
                        waiting=false;
                    });
                } else {
                    waiting=true;
                    speakPause(ripetizione+" ",500,function(){
                        speak(curMov.shortDesc);
                    });
                    setTimeout(function(){
                        speaked=true;
                        movTime=(new Date()).getTime();
                        waiting=false;
                    },400);
                }
                    
            } 
        } else {
            //Check if isn't moving
            var
                x = (mediumAcc.x-lastPos.x)*1000/t,
                y = (mediumAcc.y-lastPos.y)*1000/t,
                z = (mediumAcc.z-lastPos.z)*1000/t;
            if ((t>=60)&&(t<=90)) {
                curDataX.unshift(mediumAcc.x);
                curDataY.unshift(mediumAcc.y);
                curDataZ.unshift(mediumAcc.z);
                curDataX.splice(2,3);
                curDataY.splice(2,3);
                curDataZ.splice(2,3);
                var
                    ax = Math.atan2(y,z),
                    ay = Math.atan2(x,z),
                    az = Math.atan2(y,x),
                dx = Math.sqrt(y*y+z*z);
                dy = Math.sqrt(x*x+z*z);
                dz = Math.sqrt(y*y+x*x);
                if (curDataAX.length>0) {
                    ax = similarRad(oldAx,ax);
                    ay = similarRad(oldAy,ay);
                    az = similarRad(oldAz,az);
                }
                curDataAX.push(ax);
                curDataAY.push(ay);
                curDataAZ.push(az);
                oldAx = ax;
                oldAy = ay;
                oldAz = az;
            }
            if ((dx!==null)&&((dx+dy+dz)/3<.85)) {
                var fx = math.median(curDataX),
                    fy = math.median(curDataY),
                    fz = math.median(curDataZ),
                    ux = Math.abs(lastMov.x-curMov.x),
                    uy = Math.abs(lastMov.y-curMov.y),
                    uz = Math.abs(lastMov.z-curMov.z),
                    ua = ux+uy+uz,
                    abx=Math.abs(fx-curMov.x)/ua,
                    aby=Math.abs(fy-curMov.y)/ua,
                    abz=Math.abs(fz-curMov.z)/ua;
                console.log(lastMov,curMov);
                console.log(abx+aby+abz);
                /*if ((curMov.mx-sensitivity <= fx)&&(curMov.Mx+sensitivity >= fx)
                    &&(curMov.my-sensitivity <= fy)&&(curMov.My+sensitivity >= fy)
                    &&(curMov.mz-sensitivity <= fz)&&(curMov.Mz+sensitivity >= fz)) {*/
                if (abx+aby+abz<sensitivity) {
                        /*console.log(now-movTime);
                        console.log('a',curMov.ax,curMov.ay,curMov.az,
                        'b',similarRad(curMov.ax,math.median(curDataAX)),similarRad(curMov.ay,math.median(curDataAY)),similarRad(curMov.az,math.median(curDataAZ)),
                        'c',similarRad(curMov.ax,math.mean(curDataAX)),similarRad(curMov.ay,math.mean(curDataAY)),similarRad(curMov.az,math.mean(curDataAZ)));*/
                        //exData.push([(new Date()).getTime()-movTime,])
                        //Next movement
                        if (!waiting)
                            nextMovement(curMov,{
                                x : math.median(curDataAX),
                                y : math.median(curDataAY),
                                z : math.median(curDataAZ),
                            },now-movTime);
                        curDataAX.length=0;curDataAY.length=0;curDataAZ.length=0;
                        curDataX.length=0;curDataY.length=0;curDataZ.length=0;
                } else if (now-movTime > 500) {
                    var   aax = (lastMov.x<curMov.x)?((curMov.x<fx)?1:(fx>lastMov.x?2:0)):((curMov.x>fx)?1:(fx<lastMov.x?2:0)),
                        aay = (lastMov.y<curMov.y)?((curMov.y<fy)?1:(fy>lastMov.y?2:0)):((curMov.y>fy)?1:(fy<lastMov.y?2:0)),
                        aaz = (lastMov.z<curMov.z)?((curMov.z<fz)?1:(fz>lastMov.z?2:0)):((curMov.z>fz)?1:(fz<lastMov.z?2:0));
                    //Check is over
                    if ((aax===aay)||(aay===aaz)) {
                        if (((aax===1)&&(aay===1))||((aaz===1)&&(aay===1))) {
                            //Over
                            //Calculate %
                            if (abx+aby+abz<sensitivity*1.2)  {
                               if (!waiting)
                                    nextMovement(curMov,{
                                        x : math.median(curDataAX),
                                        y : math.median(curDataAY),
                                        z : math.median(curDataAZ),
                                    },now-movTime);
                                curDataAX.length=0;curDataAY.length=0;curDataAZ.length=0;
                                curDataX.length=0;curDataY.length=0;curDataZ.length=0;
                            } else if (!overSayed) {
                                speak(curMov.overDesc,function(){});
                                overSayed=true;
                            }
                        } else if (((aax===2)&&(aay===2))||((aaz===2)&&(aay===2))) {
                            //between
                            if (!incSayed)
                                speak(curMov.incDesc,function(){});
                            incSayed=true;
                        }
                    }
                    //else check is between after a tot of time

                }

            }
        }
        
        if (lastPos.t+60<=mediumAcc.t)
            lastPos = {x:mediumAcc.x,y:mediumAcc.y,z:mediumAcc.z,t:mediumAcc.t};
    };
    window.APP.workout = {
        exercises : [],
        startExercise : function(exercise) {
            serie=1;
            ripetizione=1;
            updateExerciseInfo();
            speakPause(exercise.intro,1500,function(){
                lastMov = es.moves[es.moves.length-1];
                curMov = es.moves[mov];
                speaked = false;
                accelAction=3;
                waiting=false;
            });
            mov=0;
            started=true;
        },
        showed : function() {
            if (typeof screen.lockOrientation === "function") {
                screen.lockOrientation('landscape-secondary');
                plugins.insomnia.keepAwake();
            }
            if (svg1===null) {
                setTimeout(function(){
                    svg1 = document.getElementById('workoutSerieSVG');
                    svg2 = document.getElementById('workoutRipSVG');
                    svg3 = document.getElementById('workoutTimeSVG');
                    workoutTime = document.getElementById('workoutTime');
                    svgSize = Math.min(svg1.clientWidth,svg1.clientWidth);
                    var a = document.getElementById('workoutSerieS'),
                        b = document.getElementById('workoutRipS'),
                        c = document.getElementById('workoutTimeS');
                    a.style.width = b.style.width = c.style.width = svgSize*.5+'px';
                    a.style.marginLeft = b.style.marginLeft = c.style.marginLeft = -svgSize*.25+'px';
                    a.style.top = b.style.top = c.style.top = svgSize*.5+'px';
                    _timeArc = d3.svg.arc().startAngle(0).endAngle(0).innerRadius(svgSize*.3).outerRadius(svgSize*.5); 
                    _timePath = d3.select(svg3).append('path').attr("d",_timeArc).attr("fill","hsl(100,60%,50%)").attr("transform","translate("+svgSize*.5+","+svgSize*.5+")");
                },200);
            }
            curExercise = 0;
            setTimeout(window.APP.workout.doExercise,100);
        },
        hide : function() {
            accelAction=0;
        },
        doExercise : function() {
            ess= window.APP.workout.exercises[curExercise];
            es = ExercisesHelper.get(ess.i);
            app.view().header.find(".km-navbar").data("kendoMobileNavBar").title(es.name+'  '+(curExercise+1)+'/'+window.APP.workout.exercises.length);
            serieT = ess.s;
            ripetizioneT = ess.r;
            stats=[];
            for (var i=0;i<window.APP.workout.exercises.length;i++) {
                var s=[];
                for (var j=0;j<serieT;j++)
                    s.push([]);
                stats.push({
                    id : window.APP.workout.exercises[i].i,
                    exs : s
                });
            }
            window.APP.workout.startExercise(es);
        }
    }
})();