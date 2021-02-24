from ctypes import *
import random
import math, random, os, cv2, time, sys
import time
import numpy as np
#/home/yokoyamalab/tmp/darknet/
sys.path.insert(1, '/home/hayashida/yolov4/darknet/')
import darknet
import argparse
from threading import Thread, enumerate
from queue import Queue

res=None
detections=None
i=1
network = None
class_names = None
darknet_image = None
# network, class_names, class_colors = darknet.load_network(
#             args.config_file,
#             args.data_file,
#             args.weights,
#             batch_size=1
#         )

def convertBack(x, y, w, h):
    xmin = int(round(x - (w / 2)))
    xmax = int(round(x + (w / 2)))
    ymin = int(round(y - (h / 2)))
    ymax = int(round(y + (h / 2)))
    return xmin, ymin, xmax, ymax


def cvDrawBoxes(detections, img):
    for detection in detections:
        x, y, w, h = detection[2][0],\
            detection[2][1],\
            detection[2][2],\
            detection[2][3]
        xmin, ymin, xmax, ymax = convertBack(float(x), float(y), float(w), float(h))

        #scale to image, this is bad ... i know
        xscale = (xmax / 800) + xmax
        yscale = (ymax / 600) + ymax
        

        pt1 = (int(xmin), int(ymin))
        pt2 = (int(xmax), int(ymax))
        cv2.rectangle(img, pt1, pt2, (0, 255, 0), 1)
        # cv2.putText(img,
        #             detection[0].decode() +
        #             " [" + str(round(detection[1] * 100, 2)) + "]",
        #             (pt1[0], pt1[1] - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5,
        #             [0, 255, 0], 2)
    return img


   
def InitialiseYOLO():

    print('YOLO Init')
    global network, class_names ,darknet_image

    #configPath = "./cfg/yolov4.cfg"      /home/yokoyamalab/tmp/darknet/cfg/person.cfg
    configPath = "/home/hayashida/yolov4/darknet/cfg/yolov4.cfg"
    #weightPath = "./yolov4.weights"     /home/yokoyamalab/tmp/darknet/backup/person/mix2/person_best.weights
    weightPath = "/home/hayashida/yolov4/darknet/yolov4.weights"
    #metaPath = "./cfg/coco.data"        /home/yokoyamalab/tmp/darknet/cfg/person.data
    dataPath = "/home/hayashida/yolov4/darknet/cfg/coco.data"
    network, class_names,class_colors = darknet.load_network(
            configPath,
            dataPath,
            weightPath,
            batch_size=1
        )
    # Darknet doesn't accept numpy images.
    # Create one with image we reuse for each detect
    width = darknet.network_width(network)
    height = darknet.network_height(network)
    darknet_image = darknet.make_image(width, height, 3)
    return network, class_names , class_colors



#As we are calling it during videoTransform just init
network, class_names , class_colors=InitialiseYOLO()



def Inference(img):
    global detections
    #frame_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    frame_resized = cv2.resize(img, (darknet.network_width(network), darknet.network_height(network)),interpolation=cv2.INTER_LINEAR)
    #print(darknet.network_width(network))   #608
    #print(darknet.network_height(network))  #608    
    framebytes = frame_resized.tobytes()
    darknet.copy_image_from_bytes(darknet_image, framebytes)
    detections = darknet.detect_image(network, class_names, darknet_image, thresh=0.5)
    image = darknet.draw_boxes(detections, frame_resized, class_colors)
    #image = darknet.draw_boxes(detections, frame_resized , class_colors)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    # cv2.imshow('Demo', image)
    # cv2.waitKey(3)
    # global i
    # print(i)
    # i=i+1
    print(detections)
    return image
