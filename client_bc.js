//11:23
var pc = null, dc = null, dcInterval = null;
var preview = document.getElementById('preview');
var dataChannelLog = document.getElementById('data-channel');
var constraints = {
    audio:false,
    video: {width: 1960, height: 980, frameRate: { ideal: 28, max:40} }
};

var cnt=1;
var count=0;
var canvas = document.getElementById("c");
//var canvas1 = document.createElement("canvas");
//var canvas2 = document.createElement("canvas");
//canvas1.setAttribute( "width" , 320 );
//canvas1.setAttribute( "height" , 240 );
//canvas2.setAttribute( "width" , 320 );
//canvas2.setAttribute( "height" , 240 );
var ctx = canvas.getContext("2d");
//var ctx1 = canvas1.getContext("2d");
//var ctx2 = canvas2.getContext("2d");
var tbl;

function writeConsole(msg)
{
    let consoleLog = document.getElementById('console');
    consoleLog.textContent += msg + '\r\n';
    consoleLog.scrollTop = consoleLog.scrollHeight;
}

function createPeerConnection() {
    //Use Googles Turn server
    var config = {
        sdpSemantics: 'unified-plan',
        iceServers:[{urls: ['stun:stun.l.google.com:19302']}]
    };

    pc = new RTCPeerConnection(config);
    // register some listeners to help debugging
    pc.addEventListener('icegatheringstatechange', function() {
        writeConsole(pc.iceGatheringState);
    }, false);
    pc.addEventListener('iceconnectionstatechange', function() {
        writeConsole(pc.iceConnectionState);
    }, false);
    pc.addEventListener('signalingstatechange', function() {
        writeConsole(pc.signalingState);
    }, false);
    // connect video
    pc.addEventListener('track', function(evt) {
        if (evt.track.kind == 'video')
           document.getElementById('video').srcObject = evt.streams[0];
           //document.getElementById('txt').innerHTML = evt.streams[1];
    });
    return pc;
}

function negotiate() {
    return pc.createOffer().then(function(offer) {
        return pc.setLocalDescription(offer);
    }).then(function() {
        // wait for ICE gathering to complete
        return new Promise(function(resolve) {
            if (pc.iceGatheringState === 'complete') {
                resolve();
            } else {
                function checkState() {
                    if (pc.iceGatheringState === 'complete') {
                        pc.removeEventListener('icegatheringstatechange', checkState);
                        resolve();
                    }
                }
                pc.addEventListener('icegatheringstatechange', checkState);
            }
        });
    }).then(function() {
        var offer = pc.localDescription;
        var codec = "VP8/90000";
        offer.sdp = sdpFilterCodec('video', codec, offer.sdp);
        writeConsole(offer.sdp);
        return fetch('/offer', {
            body: JSON.stringify({
                sdp: offer.sdp,
                type: offer.type,
                video_transform: "edges"
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST'
        });
    }).then(function(response) {
        return response.json();
    }).then(function(answer) {
        writeConsole(answer.sdp);
        return pc.setRemoteDescription(answer);
    }).catch(function(e) {
        alert(e);
    });
}

function start() {
    document.getElementById('start').style.display = 'none';
    pc = createPeerConnection();
    var ary;
    var time_start = null;
    function current_stamp() {
        if (time_start === null) {
            time_start = new Date().getTime();
            return 0;
        } else {
            return new Date().getTime() - time_start;
        }
    }
    //dc = pc.createDataChannel('chat');
    //dc.onclose = function() {
        //clearInterval(dcInterval);
        //dataChannelLog.textContent += '- close\n';
    //};
    //dc.onopen = function() {
        //dataChannelLog.textContent += '- open\n';
        //dcInterval = setInterval(function() {
            //var message = 'ping ' + current_stamp();
            ////dataChannelLog.textContent += '> ' + message + '\n';
            //dc.send(message);
        //}, 1000/28);
    //};
    //dc.onmessage = function(evt) {
        if (constraints.video) {
            if(navigator.mediaDevices.getUserMedia){
                navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
                    preview.srcObject = stream;
                    preview.onloadedmetadata = function(e) {
                        preview.play();
                        //setInterval(function(){
                            //ctx.drawImage(preview, 0, 0, 320, 240);
                       // }, 1000/28);
                    };
                    stream.getTracks().forEach(function(track) {
                        pc.addTrack(track, stream);
                        dc = pc.createDataChannel('chat');
                        dc.onclose = function() {
                            clearInterval(dcInterval);
                            dataChannelLog.textContent += '- close\n';
                        };
                        dc.onopen = function() {
                            dataChannelLog.textContent += '- open\n';
                            dcInterval = setInterval(function() {
                                var message = 'ping ' + current_stamp();
                            //dataChannelLog.textContent += '> ' + message + '\n';
                                dc.send(message);
                            },100);
                        };
                        dc.onmessage = function(evt) {
                            dataChannelLog.textContent += cnt + '< ' + evt.data + '\n';
                        //x=evt.data.list
                            cnt=cnt+1;
                            //console.log("detection",cnt);
                            if(evt.data == "None"){
                                console.log("None")
                                }
                            else if(evt.data != "[]"){
		                var canvas2 = document.createElement("canvas");
			    //canvas1.setAttribute( "width" , 320 );
			    //canvas1.setAttribute( "height" , 240 );
			                    //canvas2.setAttribute( "width" , 320 );
			                    //canvas2.setAttribute( "height" , 240 );
			    //var ctx = canvas.getContext("2d");
		 	    //var ctx1 = canvas1.getContext("2d");
			        //var canvas2 = document.getElementById("c");
                                var ctx2 = canvas2.getContext("2d");
                                canvas2.setAttribute( "width" , 1600 );
			        canvas2.setAttribute( "height" , 800 );                                         ctx.clearRect(0,0,1600,800); 
			        ctx.beginPath () ;
                                n0=evt.data
                        //console.log(typeof n0); //String
                        //console.log("evt.data=====>",n0);
                                n1 =n0.replace('[(','') ;
                                n2 =n1.replace(')]','') ;
                                x = n2.split('), (');
                                //console.log(x);
                                //console.log(typeof x);
                                var tbl = JSON.parse(JSON.stringify((new Array(x.length)).fill((new Array(6)).fill(0))));
                                for(i = 0; i < x.length; i++) {
                                    var a=x[i].split(',');
                                    a[2]=a[2].replace('(','');
                                    a[5]=a[5].replace(')','');
                                    tbl[i]=a;
				    tbl[i][0]=tbl[i][0].replace("'","");
				    tbl[i][0]=tbl[i][0].replace("'","");
				   // console.log(tbl[i][0]);
                    		    //tbl[i][1]=Number(tbl[i][1]); 
                    		    tbl[i][2]=Number(tbl[i][2]);  //xcenter(416)
                    		    tbl[i][3]=Number(tbl[i][3]);  //ycenter(416)
                	    	    tbl[i][4]=Number(tbl[i][4]);  //width(416)
                		    tbl[i][5]=Number(tbl[i][5]);  //height(416)
                		    tbl[i][2] = (tbl[i][2] - (tbl[i][4] / 2)) * (1600 / 608) ;  //x(320)
                		    tbl[i][3] = (tbl[i][3] - (tbl[i][5] / 2 )) * (800 / 608);   //y(240)
                		    tbl[i][4] = tbl[i][4] * (1600 / 608);  //width(320)
                                    tbl[i][5] = tbl[i][5] * (800 / 608);   //height(240)
                                    ctx2.beginPath () ;
                                    ctx2.rect( tbl[i][2], tbl[i][3], tbl[i][4], tbl[i][5] ) ;
				    ctx2.font = "30px 'ＭＳ ゴシック'";
            			    ctx2.textAlign = "left";
            			    ctx2.textBaseline = "top";
            			    ctx2.fillStyle = "white" ;
            			    ctx2.fillText(tbl[i][0]+" : " + tbl[i][1], tbl[i][2],tbl[i][3], 1000); 
                        	    ctx2.fillStyle = "rgba(255,255,255,0)" ;
                        	    ctx2.fill() ;
                        	    ctx2.strokeStyle = "green" ;
                        	    ctx2.lineWidth = 2 ;
                        	    ctx2.stroke() ;
                            	    ctx.drawImage(canvas2, 0, 0);
                            	//count=count+1;
                            	//console.log("rect",count);
                                }
			                    //ctx.drawImage(canvas2, 0, 0);
			        count=count+1;
			        //console.log("rect",count);
                            }else{
                                console.log("non detection!");
                            }
                        };
                    });
                    return negotiate();
                }, function(err) {
                    alert('Could not acquire media: ' + err);
                });
            }
        } else {
            negotiate();
        }
    //};
        document.getElementById('stop').style.display = 'block';
}
function stop() {
    document.getElementById('stop').style.display = 'none';
    document.getElementById('start').style.display = 'block';
    preview.pause();
    // close data channel
    if (dc) {
        dc.close();
    }
    // close transceivers
    if (pc.getTransceivers) {
        pc.getTransceivers().forEach(function(transceiver) {
            if (transceiver.stop) {
                transceiver.stop();
            }
        });
    }
    // close local audio / video
    pc.getSenders().forEach(function(sender) {
        sender.track.stop();
    });
    // close peer connection
    setTimeout(function() {
        pc.close();
    }, 500);
}
function sdpFilterCodec(kind, codec, realSdp) {
    var allowed = []
    var rtxRegex = new RegExp('a=fmtp:(\\d+) apt=(\\d+)\r$');
    var codecRegex = new RegExp('a=rtpmap:([0-9]+) ' + escapeRegExp(codec))
    var videoRegex = new RegExp('(m=' + kind + ' .*?)( ([0-9]+))*\\s*$')
    var lines = realSdp.split('\n');
    var isKind = false;
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('m=' + kind + ' ')) {
            isKind = true;
        } else if (lines[i].startsWith('m=')) {
            isKind = false;
        }
        if (isKind) {
            var match = lines[i].match(codecRegex);
            if (match) {
                allowed.push(parseInt(match[1]));
            }
            match = lines[i].match(rtxRegex);
            if (match && allowed.includes(parseInt(match[2]))) {
                allowed.push(parseInt(match[1]));
            }
        }
    }
    var skipRegex = 'a=(fmtp|rtcp-fb|rtpmap):([0-9]+)';
    var sdp = '';
    isKind = false;
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('m=' + kind + ' ')) {
            isKind = true;
        } else if (lines[i].startsWith('m=')) {
            isKind = false;
        }
        if (isKind) {
            var skipMatch = lines[i].match(skipRegex);
            if (skipMatch && !allowed.includes(parseInt(skipMatch[2]))) {
                continue;
            } else if (lines[i].match(videoRegex)) {
                sdp += lines[i].replace(videoRegex, '$1 ' + allowed.join(' ')) + '\n';
            } else {
                sdp += lines[i] + '\n';
            }
        } else {
            sdp += lines[i] + '\n';
        }
    }
    return sdp;
}
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
