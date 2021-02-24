import argparse, asyncio, json, logging, os, ssl, uuid, cv2
from aiohttp import web
from av import VideoFrame
from videotransform import VideoTransform
import darknet_video 
from aiortc import MediaStreamTrack, RTCPeerConnection, RTCSessionDescription
from aiortc.contrib.media import MediaBlackhole, MediaPlayer, MediaRecorder
import subprocess
#from websocket_server import WebsocketServer
from datetime import datetime


ab=0
ROOT = os.path.dirname(__file__)
cnt=0
logger = logging.getLogger("pc")
pcs = set()
dt_now = datetime.now()


#Route requests
async def index(request):
    content = open(os.path.join(ROOT, "index.html"), "r").read()
    return web.Response(content_type="text/html", text=content)

async def stylesheet(request):
    content = open(os.path.join(ROOT, "style.css"), "r").read()
    return web.Response(content_type="text/css", text=content)

async def javascript(request):
    content = open(os.path.join(ROOT, "client.js"), "r").read()
    return web.Response(content_type="application/javascript", text=content)

#RTC Offer route
async def offer(request):
    params = await request.json()
    offer = RTCSessionDescription(sdp=params["sdp"], type=params["type"])
    
    #message2=[-1]
    pc = RTCPeerConnection()
    pc_id = "PeerConnection(%s)" % uuid.uuid4()
    pcs.add(pc)

    def log_info(msg, *args):
        logger.info(pc_id + " " + msg, *args)

    log_info("Created for %s", request.remote)

    # prepare local media as a blackhole
    recorder = MediaBlackhole()

    # @pc.on("datachannel")
    # def on_datachannel(channel):
    #     @channel.on("message")
    #     def on_message(message):
    #       message2[0]=message
    #       #if cnt != int(message2[0])+1 :
    #       #channel.send(str(count2))
    #       #print("ここです",count2)
    #       message2[0]= darknet_video.i
    #       global ab
    #       if ab!=darknet_video.detections:
    #         res= str(darknet_video.i) + "      \n" +str(darknet_video.detections)
    #         channel.send(res)
    #         ab=darknet_video.detections
            ##tes=darknet_video.detections
                #tes=VideoTransform.d_res
          
                #print(tes)
                #channel.send("aaaaaaaaaaa")

    @pc.on("iceconnectionstatechange")
    async def on_iceconnectionstatechange():
        log_info("ICE connection state is %s", pc.iceConnectionState)
        if pc.iceConnectionState == "failed":
            await pc.close()
            pcs.discard(pc)

    @pc.on("track")
    def on_track(track):
        log_info("Track %s received", track.kind)
        local_video = VideoTransform(
            track, transform=params["video_transform"]
        )
        pc.addTrack(local_video)
        @track.on("ended")
        async def on_ended():
            log_info("Track %s ended", track.kind)
            await recorder.stop()

    # handle offer
    await pc.setRemoteDescription(offer)
    await recorder.start()

    # send answer
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    return web.Response(
        content_type="application/json",
        text=json.dumps(
            {"sdp": pc.localDescription.sdp, "type": pc.localDescription.type}
        ),
    )


async def on_shutdown(app):
    # close peer connections
    coros = [pc.close() for pc in pcs]
    await asyncio.gather(*coros)
    pcs.clear()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="WebRTC Demo, Allan Gallop"
    )
    #SSL Stuff for running outside localhost, must be done due to CORS
    parser.add_argument("--cert-file", help="SSL certificate file (for HTTPS)")
    parser.add_argument("--key-file", help="SSL key file (for HTTPS)")

    #Optional: Set IP host address
    parser.add_argument(
        "--host", default="0.0.0.0", help="Host for HTTP server (default: 0.0.0.0)"
    )

    #Optional: Set PORT
    parser.add_argument(
        "--port", type=int, default=8080, help="Port for HTTP server (default: 8080)"
    )
    args = parser.parse_args()


    if args.cert_file:
        ssl_context = ssl.SSLContext()
        ssl_context.load_cert_chain(args.cert_file, args.key_file)
    else:
        ssl_context = None

    app = web.Application()
    app.on_shutdown.append(on_shutdown)
    
    #Routes
    app.router.add_get("/", index)
    app.router.add_get("/style.css", stylesheet)
    app.router.add_get("/client.js", javascript)
    app.router.add_post("/offer", offer)
###import subprocess
    #subprocess.check_call('server3.js', shell=True)
    
    web.run_app(
        app, access_log=None, host=args.host, port=args.port, ssl_context=ssl_context
    )


#def new_client(client, server):
#    server.send_message_to_all(datetime.now().isoformat() + ": new client joined!")

#server = WebsocketServer(80, host="localhost")
#server.set_fn_new_client(new_client)
#server.run_forever()
