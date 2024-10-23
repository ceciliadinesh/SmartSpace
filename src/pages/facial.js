import React, { useState } from "react";
import { useRef } from "react";
import * as faceapi from "@vladmandic/face-api";

const Facial = () => {
  const VideoRef = useRef(null);
  const canvasRef = useRef(null);

  const imgRef = useRef(null);
  const [descrip,setDescrip]=useState([])

  const [name, setName] = useState("");

  const video = async () => {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.ageGenderNet.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    ]);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    VideoRef.current.srcObject = stream;
    const ctx = canvasRef.current.getContext("2d");

    VideoRef.current.onloadedmetadata = () => {
      VideoRef.current.play();
      
      canvasRef.current.width = VideoRef.current.videoWidth;
      canvasRef.current.height = VideoRef.current.videoHeight;
    };

    const detector = async () => {
      if (
        VideoRef.current &&
        canvasRef.current &&
        VideoRef.current.videoWidth > 0 &&
        VideoRef.current.videoHeight > 0
      ) {
        const d = await faceapi
          .detectAllFaces(
            VideoRef.current,
            new faceapi.TinyFaceDetectorOptions()
          )
          .withFaceLandmarks()
          .withFaceDescriptors();
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          ctx.drawImage(VideoRef.current, 0, 0);
        if (localStorage.getItem("arr")) {
          let tmp=[]
          const x=JSON.parse(localStorage.getItem("arr"))
          x.forEach((e)=>{
           
            tmp.push(new faceapi.LabeledFaceDescriptors(e.label,[new Float32Array(e.descriptors[0])]))
          })
          //console.log(tmp)
          const faceMatcher = new faceapi.FaceMatcher(tmp, 0.6);
          const results = d.map((d) => faceMatcher.findBestMatch(d.descriptor));
          console.log(results);
          
          results.forEach((result, i) => {
            const box = d[i].detection.box;
            const drawBox = new faceapi.draw.DrawBox(box, {
              label: result.toString(),
            });
            drawBox.draw(canvasRef.current);
          });
        }

        
        
        faceapi.draw.drawDetections(ctx, d);
      }
      requestAnimationFrame(detector);
    };

    detector();
  };

  const saveFace = async () => {
    const data = canvasRef.current.toDataURL("image/png");

    imgRef.current.src = data;
    const d = await faceapi
      .detectSingleFace(imgRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();
    
      

    if (d!=null) {
      console.log("Saver:", d);
      //console.log(new faceapi.LabeledFaceDescriptors(name, [d.descriptor]))
      if(!localStorage.getItem("arr")){
        localStorage.setItem("arr",[])
      }
      let x=JSON.parse(localStorage.getItem("arr"))+[new faceapi.LabeledFaceDescriptors(name, [d.descriptor])]
      localStorage.setItem("arr",JSON.stringify(x))
      //console.log(JSON.stringify(x))
        
      
    }
  };
  return (
    <>
      <button onClick={video}>Click</button>
      <video ref={VideoRef} autoPlay hidden></video>
      <canvas ref={canvasRef}></canvas>
      <button onClick={saveFace}>save face</button>
      <input
        type="text"
        onChange={(e) => {
          setName(e.target.value);
        }}
      ></input>
      <img ref={imgRef}></img>
    </>
  );
};

export default Facial;
