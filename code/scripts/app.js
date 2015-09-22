var ttsAvaible,calibData=[],volumeActive=true,vibrateActive=true,
    svg1scaled=false,svg2scaled=false,
    cx=0,cy=0,afterCalibrate=null,
    isJump = Math.PI,fullRAD = Math.PI*2,media=9,media1=media+1,modmedia=2,modmedia1=modmedia+1;
var
    accelAction=0,
    mediumAcc = {x:0,y:0,z:0,t:0},stopUntil=0;
window.accelActions = [];
//For calibrate.js
var roller=null,centerRoller=null;
//For exercises.js
var excStill = {x:0,y:0,z:0},
    excCounter = 0,
    excPositions = [];
function speak(a,after) {
    if (volumeActive&&ttsAvaible) {
        TTS.speak(a,function(){
            if (typeof after==="function")
                after(true);
        },function(a){console.log('no ok',a);});
    } else if (typeof after==="function")
        after(false);
}
function speakPause(a,b,after) {
    if (volumeActive&&ttsAvaible) {
        TTS.speak(a,function(){},function(){console.log('no ok');});
        TTS.silence(b,function(){
            if (typeof after==="function")
                after(true);
        },function(){console.log('no ok');});
    } else if (typeof after==="function")
        after(false);
}
function vibrate(a) {
    if (vibrateActive)
        navigator.notification.vibrate(a);
}

function beep() {
    navigator.notification.beep(1);
}
                            
function toggleVolumeUpdate() {
    setTimeout(function() {
        volumeActive?
            $('.toggleVolume').addClass('km-custom-volume-medium').removeClass('km-custom-volume-mute'):
            $('.toggleVolume').addClass('km-custom-volume-mute').removeClass('km-custom-volume-medium');
    },100);
}
function toggleVolume() {
    volumeActive = !volumeActive;
    volumeActive?
        $('.toggleVolume').addClass('km-custom-volume-medium').removeClass('km-custom-volume-mute'):
        $('.toggleVolume').addClass('km-custom-volume-mute').removeClass('km-custom-volume-medium');
    if (volumeActive)
        navigator.notification.beep(1);
    localStorage.setItem('volume',volumeActive);
}
function goHome() {
    window.plugins.actionsheet.show({
        'title' : 'Tornare alla home?',
        'buttonLabels': ['No'],
        'addDestructiveButtonWithLabel' : 'Si'
    }, function(bIndex) {
        if (bIndex===1) {
            app.navigate("views/home.html","fade");
        }
    });
}
(function () {
    
    // store a reference to the application object that will be created
    // later on so that we can use it if need be
    
        
    // create an object to store the models for each view
    window.APP = {
      home : {
          show : function() {
              toggleVolumeUpdate();
              if (typeof screen.lockOrientation === "function") {
                  screen.lockOrientation('portrait-primary');
                  plugins.insomnia.allowSleepAgain();
              }
          }
      },
      drawer : {
          beforeShow : function() {
              document.getElementById('showDrawe').classList.add('close');
              setTimeout(function() {
                  vibrateActive?
                    $('.toggleVibrate').addClass('km-custom-vibrate').removeClass('km-custom-no-vibrate'):
                    $('.toggleVibrate').addClass('km-custom-no-vibrate').removeClass('km-custom-vibrate');
              },100);
              
          },
          hide : function() {
              document.getElementById('showDrawe').classList.remove('close');
          },
          toggleVibrate : function() {
              vibrateActive = !vibrateActive;
              vibrateActive?
                $('.toggleVibrate').addClass('km-custom-vibrate').removeClass('km-custom-no-vibrate'):
                $('.toggleVibrate').addClass('km-custom-no-vibrate').removeClass('km-custom-vibrate');
              if (vibrateActive)
                  vibrate(500);
              localStorage.setItem('vibrate',vibrateActive);
          },
          goToExc : function() {
              app.navigate("views/exercises.html#exercisesMenu","overlay:left");
          }
       },
      models: {
        beforeCalibrate : {
            showed : function() {
                if (typeof screen.lockOrientation === "function") {
                    screen.lockOrientation('portrait-primary');
                    plugins.insomnia.keepAwake();
                }
                if (!svg1scaled)
                    setTimeout(function() {
                        svg1scaled=true;
                        animations.svg1Elem = d3.select('#svg1');
                        var a = animations.svg1Elem.node(),
                            ai= a.parentNode,
                            c = ai.clientWidth*.9/a.clientWidth,
                            d = ai.clientHeight*.9/a.clientHeight;
                            /*b = a.getBBox(),
                            c = a.clientWidth*.8/b.width,
                            d = a.clientHeight*.9/b.height;*/
                        c = (c<d)?c:d;
                        var
                            /*e = (a.clientWidth-b.width*c)/c/2,
                            f = (a.clientHeight-b.height*c)/c/2*/
                            e = (ai.clientWidth-a.clientWidth*c)/c/2,
                            f = (ai.clientHeight-a.clientHeight*c)/c/2;
                        a.childNodes[1].setAttribute("transform","scale("+c+","+c+") translate("+e+","+f+")");
                        $(a).attr({width:'100%',height:'100%'});
                    },150);
                toggleVolumeUpdate();
                speak("Inserisci il cellulare nella fascia. e indòssala nel braccio, nella direzione indicata nel disegno");
                animations.animateSvg1=true;
                setTimeout(animations.svg1Animation,200);
            },
            hided : function() {
                animations.animateSvg1=false;
            },
            next : function() {
                app.navigate("views/beforeCalibrate2.html","overlay:down");
            }
        },
        beforeCalibrate2 : {
            showed : function() {
                if (typeof screen.lockOrientation === "function") {
                    screen.lockOrientation('portrait-secondary');
                    plugins.insomnia.keepAwake();
                }
                if (!svg2scaled)
                    setTimeout(function() {
                        svg2scaled=true;
                        /*svg2Frames=[];
                        var fragment = document.createDocumentFragment(),video1= document.getElementById("video1");
                        for (var i=19;i<=28;i++) {
                            var frame = document.createElement('div');
                            frame.style.backgroundImage = 'url("video1/Frame'+i+'.jpg")';
                            frame.style.display = 'none';
                            frame.className = 'videoFrame';
                            svg2Frames.push(frame);
                            fragment.appendChild(frame);
                        }
                        for (var i=27;i>19;i--) {
                            var frame = document.createElement('div');
                            frame.style.backgroundImage = 'url("video1/Frame'+i+'.jpg")';
                            frame.style.display = 'none';
                            frame.className = 'videoFrame';
                            svg2Frames.push(frame);
                            fragment.appendChild(frame);
                        }
                        svg2Frames[0].style.display = '';
                        video1.appendChild(fragment);*/
                        animations.svg2Elem = d3.select('#svg2');
                        var a = animations.svg2Elem.node(),
                            b = a.getBBox(),
                            c = a.clientWidth*.8/b.width,
                            d = a.clientHeight*.9/b.height;
                        c = (c<d)?c:d;
                        var
                            e = (a.clientWidth-b.width*c)/c/2,
                            f = (a.clientHeight-b.height*c)/c/2;
                        a.childNodes[1].setAttribute("transform","scale("+c+","+c+") translate("+e+","+f+")");
                    },150);
                toggleVolumeUpdate();
                speak("Metti il petto in fuori, schiena dritta e il braccio in avanti e orizzontale con la mano rivolta verso il basso");
                
                //speak("Metti il petto in fuori, schiena dritta e il braccio orizzontale toccàndoti la spalla opposta");
                animations.animateSvg2=true;
                setTimeout(animations.svg2Animation,200);
            },
            hided : function() {
                animations.animateSvg2=false;
            },
            next : function() {
                app.navigate("views/calibrate.html","overlay:down");
            }
        },
        calibrate : {
            showed : function() {
                if (typeof screen.lockOrientation === "function") {
                    screen.lockOrientation('portrait-secondary');
                    plugins.insomnia.keepAwake();
                }
                roller = document.getElementById('roller');
                centerRoller = document.getElementById('centerRoller');
                accelAction=0;
                speak("Ruota la fascia attorno al braccio, in modo da centrare il pallino. e mantieni la posizione. Ricorda di non muovere il corpo ma solo la fascia",function(){
                    accelAction=1;
                });
            },
            hide : function() {
                if (accelAction===1) accelAction=0;
            }
        },
        home: {
            start : function(){
                afterCalibrate='workout.html';
                window.APP.workout.exercises.length = 0;
                var exs = ExercisesHelper.getAll().length;
                for (var i=0;i<exs;i++)
                    window.APP.workout.exercises.push({
                    i : i,
                    s : 2,
                    r : 8
                });
                app.navigate("views/beforeCalibrate.html");
            }
        }
      }
    };
    // this function is called by Cordova when the application is loaded by the device
    document.addEventListener('deviceready', function () {
        if(navigator.simulator && window.location.hash)
            window.location.hash = "";
        //Restore information
        var a = localStorage.getItem('vibrate');
        if (typeof a === "string") vibrateActive = (a === "true");
        a = localStorage.getItem('volume');
        if (typeof a === "string") volumeActive = (a === "true");
        navigator.accelerometer.watchAcceleration(function(a) {
            var now = (new Date()).getTime();
            if (now < stopUntil) return console.log('stop');
            if (mediumAcc.t < a.timestamp){
                mediumAcc.x = (mediumAcc.x*media+a.x)/media1;
                mediumAcc.y = (mediumAcc.y*media+a.y)/media1;
                mediumAcc.z = (mediumAcc.z*media+a.z)/media1;
                mediumAcc.t = a.timestamp;
            }
            if (accelAction>0) 
                window.accelActions[accelAction](now);
        },function() {
            
        },{ frequency: 1000/60 });
        // hide the splash screen as soon as the app is ready. otherwise
        // Cordova will wait 5 very long seconds to do it for you.
        navigator.splashscreen.hide();
        ttsAvaible = typeof TTS !== "undefined";
        speak('Benvenuto su, fit mi arm');
        window.app = new kendo.mobile.Application(document.body, {
        
            // comment out the following line to get a UI which matches the look
            // and feel of the operating system
            skin: 'material',

            // the application needs to know which view to load first
            initial: 'views/home.html'
          });

    }, false);


}());