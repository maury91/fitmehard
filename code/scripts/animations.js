/*********** Polyfill ***************/
(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame =
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 20 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());
var svg2Frames;
(function() {
    var svg1wire=null,svg1Hand,svg1HandPath,svg1HandPathL,svg1HandPathI,svg1HandandWire,svg1HandFinalPoint,
        svg1Fascia,svg1FasciaD,svg1FasciaD2,svg1Arm,
        svg2Arm=null,svg2Line,svg2LineF,
        svg2Frame=0,svg2Time=0;
    window.animations = {
        svg1Elem : null,
        svg2Elem : null,
        animateSvg1 : false,
        animateSvg2 : false,
        svg1Animation : function() {
            if (svg1wire===null) {
                svg1wire = animations.svg1Elem.select('#svg1Wire');
                svg1Hand = animations.svg1Elem.select('#svg1Hand');
                svg1HandPath = animations.svg1Elem.select('#svg1HandAnimation');
                svg1HandandWire = animations.svg1Elem.select('#svg1PhoneWithWire');
                svg1HandPathN = svg1HandPath.node();
                svg1HandPathL = svg1HandPathN.getTotalLength();
                svg1HandPathI = d3.interpolateString("0," + svg1HandPathL, svg1HandPathL + "," + svg1HandPathL);
                svg1HandFinalPoint = svg1HandPathN.getPointAtLength(svg1HandPathL);
                svg1Arm = animations.svg1Elem.select('#svg1Arm');
                svg1Fascia = animations.svg1Elem.select('#svg1Fascia');
                svg1FasciaD = svg1Fascia.attr("d");
                svg1FasciaD2 = animations.svg1Elem.select('#svg1Fascia2').attr("d");
                svg1HandPathF = function() {
                    return function(t) {
                        var p = svg1HandPathN.getPointAtLength(t * svg1HandPathL);
                        svg1Hand.attr("transform", "translate(" + p.x + "," + p.y + ")");//move marker
                        return svg1HandPathI(t);
                    }
                }
            } 
            d3.selectAll([svg1HandandWire.node(),svg1wire.node(),svg1Hand.node()])
                .transition().duration(400)
                .style("opacity",1)
                .attr("transform","translate(0,0)");
            svg1Arm
                .transition().duration(400)
                .attr("transform","translate(0,-50)");
            svg1Fascia
                .transition().duration(400).attr("d",svg1FasciaD);
            svg1wire
                .transition().duration(1500).delay(400)
                    .attr("transform","translate(0,55)");
            //Move hand
            svg1HandPath
                .transition().duration(2500).delay(1900)
                .attrTween("stroke-dasharray", svg1HandPathF);
            svg1HandandWire
                .transition().duration(3000).delay(3900).ease('linear')
                .attr("transform","translate(0,280)");
            svg1Hand
                .transition().duration(3000).delay(3900).ease('linear')
                .attr("transform","translate("+svg1HandFinalPoint.x+","+(svg1HandFinalPoint.y+280)+")")
                .transition().duration(600).delay(6900)
                .style("opacity",0);
            svg1Arm
                .style("opacity",1)
                .transition().duration(3000).delay(7500)
                .attr("transform","translate(0,2400)");
            svg1Fascia
                .transition().duration(2200).delay(8500)
                .attr("d",svg1FasciaD2)            
                .each("end",function(){
                    setTimeout(function(){
                        if (animations.animateSvg1)
                            animations.svg1Animation();
                    },1500);
                });
        },
        /*svg2Animation : function() {
            /*if (animations.animateSvg2)
                requestAnimationFrame(animations.svg2Animation);
            if (svg2Time > 40) {
                //NextImage
                svg2Time=0;
                svg2Frame=(svg2Frame+1)%svg2Frames.length;
            }
            var svgNext=(svg2Frame+1)%svg2Frames.length;
            if (svg2Time === 0) {
                svg2Frames[svgNext].style.display = '';
                svg2Frames[(svg2Frame+svg2Frames.length-1)%svg2Frames.length].style.display = 'none';
            }
            /*svg2Frames[svg2Frame].style.opacity = 1-((20+svg2Time)/120);
            svg2Frames[svgNext].style.opacity = (svg2Time)/120;
            svg2Time++;
            if (animations.animateSvg2)
                setTimeout(animations.svg2Animation,400);
            svg2Frames[svg2Frame].style.display = 'none';
            svg2Frame=(svg2Frame+1)%svg2Frames.length;
            svg2Frames[svg2Frame].style.display = '';
        }*/
        svg2Animation : function() {
            if (svg2Arm===null) {
                svg2Arm = animations.svg2Elem.select('#svg2Arm');
                svg2NodePoints = [];
                for (var i=1;i<7;i++)
                    svg2NodePoints.push(animations.svg2Elem.select('#svg2wirePoint'+i).node());
                function svg2ArmTween(d, i, a) {
                    var iS = d3.interpolateString("rotate(-80, 68, 58) translate(-2,-5) scale(1,1)", "rotate(-20, 68, 58) translate(20,-5) scale(.7,1)");
                    return function(t) {
                        svg2LineData = [];
                        for (var i in svg2NodePoints) {
                            var a = svg2NodePoints[i].getBoundingClientRect();
                            svg2LineData.push({
                                x : a.right,
                                y : a.bottom
                            });
                        }
                        svg2Line.attr("d", svg2LineF(svg2LineData));
                        return iS(t);
                    }
                }
                svg2LineF = d3.svg.line()
                             .x(function(d){return d.x})
                             .y(function(d){return d.y})
                             .interpolate("basis");
                svg2Line = animations.svg2Elem
                             .insert('path',':first-child')
                             .attr("stroke", "white")
                             .attr("stroke-width", 1)
                            .attr("transform","translate(0,-73)")
                             .attr("fill", "none");
            }
            svg2Arm
                .attr("transform","rotate(-80, 68, 58) translate(-2,-5) scale(1,1)")
                .transition().duration(4000).delay(400)
                .attrTween("transform", svg2ArmTween)
                .each("end",function(){
                    if (animations.animateSvg2)
                        animations.svg2Animation();
                });
            svg2LineData = [];
            for (var i in svg2NodePoints) {
                var a = svg2NodePoints[i].getBoundingClientRect();
                svg2LineData.push({
                    x : a.right,
                    y : a.bottom
                });
            }
            svg2Line.attr("d", svg2LineF(svg2LineData));
        }
    }
})();
