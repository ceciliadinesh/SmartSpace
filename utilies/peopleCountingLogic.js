/* global cv */
import * as tf from '@tensorflow/tfjs';

let model;

const loadModel = async () => {
    if (!model) {
        model = await tf.loadGraphModel('path/to/yolov8/model.json'); // Update with your model path
    }
    return model;
};

export const countPeopleAndDrawBoxes = async (frame) => {
    await loadModel();
    const tensorFrame = tf.browser.fromPixels(frame);
    const resizedFrame = tf.image.resizeBilinear(tensorFrame, [640, 640]);
    const inputTensor = resizedFrame.expandDims(0);
    const results = await model.executeAsync(inputTensor);

    const boxes = results[0].arraySync();
    const scores = results[1].arraySync();
    const classes = results[2].arraySync();

    let count = 0;

    for (let i = 0; i < boxes.length; i++) {
        const [y1, x1, y2, x2] = boxes[i];
        const score = scores[i];
        const classId = classes[i];

        if (classId === 0 && score > 0.5) { // Adjust classId based on your model
            count++;
            cv.rectangle(frame, new cv.Point(x1, y1), new cv.Point(x2, y2), new cv.Vec(0, 255, 0), 2);
            cv.putText(frame, `Person: ${score.toFixed(2)}`, new cv.Point(x1, y1 - 10), cv.FONT_HERSHEY_SIMPLEX, 0.5, new cv.Vec(0, 255, 0), 1);
        }
    }

    return { count, frame };
};

export const countPeopleAndRecognizeFaces = countPeopleAndDrawBoxes;
