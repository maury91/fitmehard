(function(){
    var acquised=false,acquised2=false,acquisedC=0,
        calibrated = {
            z : 10.15,
            y : 0.85,
            x : 1.40
        },
        calibrated2 = {
            z : 9.9,
            y : 0.5,
            x : 2.9
        };
    window.accelActions[1] = function() {
        var c = calibrated.x-mediumAcc.x,d = (Math.abs(c)+Math.abs(calibrated.y-mediumAcc.y)+Math.abs(calibrated.z-mediumAcc.z))*c;
        if (Math.abs(d)<.5) {
            if (acquised) {
                acquisedC++;
                if (acquisedC%20===0) {
                    var a = 10+Math.floor(acquisedC/20),
                        b = a*2;
                    centerRoller.style.cssText = 'width:'+b+'px;height:'+b+'px;margin:-'+a+'px';
                }
                if (acquisedC===300) {
                    speak('ok');
                    //Acquised, log difference
                    console.log('calibrazione',c,calibrated.y-mediumAcc.y,calibrated.z-mediumAcc.z);
                    sensitivity = Math.min(Math.max(Math.abs(c),Math.abs(calibrated.y-mediumAcc.y),Math.abs(calibrated.z-mediumAcc.z))*2,.4);
                    console.log('Sensitivity : ',sensitivity);
                    app.navigate("views/"+afterCalibrate,"overlay:left");
                } else if (acquisedC===80) {
                    speak('mantieni');
                    roller.classList.add('ok');
                    acquised2=true; 
                }
            } else {
                acquised=true;
            }
        } else if (acquised) {
            acquised=false;
            roller.classList.remove('ok');
            acquisedC=0;
            centerRoller.style.cssText = 'width:20px;height:20px;margin:-10px';
            if (acquised2) {
                acquised2=false;
                speak('no');
            }
        }
        if (roller!==null)
            roller.style.marginLeft=Math.max(Math.min(d*10,50),-50)+"%";
    };
})();