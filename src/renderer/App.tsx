import React, { CSSProperties, useCallback, useEffect, useState } from "react";
import { MemoryRouter as Router, Switch, Route } from "react-router-dom";
import {
  Card,
  Button,
  overrideThemeVariables,
  ProgressLinear,
  RadioGroup,
  Radio,
  Checkbox,
  TextArea,
  Alert,
} from "ui-neumorphism";

import "./App.global.scss";
import { useDropzone } from "react-dropzone";
import { AttentionSeeker, Fade } from "react-awesome-reveal";
import calculateImage from "../main/calculate";
import ImageCompare from "./image-compare/index";

const path = window.require("path");

const imageModels = [
  "realesrgan-x4plus",
  "realesrgan-x4plus-anime",
];

const videoModels = [
  "realesr-animevideov3-x2",
  "realesr-animevideov3-x3",
  "realesr-animevideov3-x4",
];

const Hello = () => {
  const pathToBinary = localStorage.getItem("binaryPath");
  const defaultImageModel = localStorage.getItem("defaultImageModel");
  const defaultVideoModel = localStorage.getItem("defaultVideoModel");

  const [droppedImage, setDroppedImage] = useState<any>();
  const [outputImage, setOutputImage] = useState<string>();
  const [isIntermediate, setIntermediate] = useState<boolean>(false);
  const [isCalculating, setCalculating] = useState<boolean>(false);
  const [isSettingsVisible, setSettingsVisible] = useState<boolean>(
    !pathToBinary
  );
  const [inputValue, setInputValue] = useState<string>(pathToBinary || "");
  const [progress, setProgress] = useState<number>(0);
  const [imageModel, setImageModel] = useState<string>(
    defaultImageModel || imageModels[1]
  );
  const [videoModel, setVideoModel] = useState<string>(
    defaultVideoModel || videoModels[0]
  )
  const [zoomFurther, setZoomFurther] = useState<boolean>(false);
  const [child, setChild] = useState<any>();

  const [warningType, setWarningType] = useState<number>(0);

  const onDropAccepted = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      setDroppedImage(file.path);
      setOutputImage(undefined);
      setCalculating(false);
      setIntermediate(false);
      setProgress(0);
      console.log(file.path);
    });
  }, []);
  const { acceptedFiles, getRootProps, getInputProps, isDragAccept } =
    useDropzone({
      onDropAccepted,
      maxFiles: 1,
      accept: "image/*"
    });

  useEffect(() => {
    if (imageModel) localStorage.setItem("defaultImageModel", imageModel);
  }, [imageModel]);

  useEffect(() => {
    if (videoModel) localStorage.setItem("defaultVideoModel", videoModel);
  }, [videoModel]);

  useEffect(() => {
    if (inputValue || inputValue === "") localStorage.setItem("binaryPath", inputValue);

    if (inputValue === "undefined" || !inputValue) setWarningType(1);
    else {
      const filePath = `${inputValue}\\models\\${imageModel}.bin`;

      fetch(filePath)
        .then(() => setWarningType(0))
        .catch(() => {
          setWarningType(2);
        });
    }
  }, [inputValue, imageModel]);

  useEffect(() => {
    overrideThemeVariables({
      "--primary": "#5A93FC"
    });
  }, []);

  useEffect(() => {
    if (!outputImage) return;

    const element = document.getElementById("image-compare");

    const viewer = new ImageCompare(element, {
      smoothing: false,
      hoverStart: true
    }).mount();
  }, [outputImage]);

  const onImageModelsChange = (e) => {
    setImageModel(e.value);
  };

  const onVideoModelsChange = (e) => {
    setVideoModel(e.value);
  };

  const onStart = () => {
    if (warningType !== 0) return;

    setOutputImage(undefined);
    setIntermediate(true);
    setCalculating(false);
    setProgress(0);

    const recvOutput = (data) => {
      const percentage = parseFloat(data);
      console.log(percentage);
      if (percentage !== 0) {
        setCalculating(true);
        setIntermediate(false);
      }
      setProgress(percentage);
    };

    const childProc = calculateImage(
      droppedImage,
      imageModel,
      recvOutput,
      recvOutput,
      (output) => {
        setOutputImage(output);
        setCalculating(false);
        setIntermediate(false);
        setProgress(100);
      },
      inputValue
    );
    console.log(childProc);
    setChild(childProc);
  };

  const onCancel = useCallback(() => {
    child.on("exit", () => {
      console.log("successfully killed child");
      setProgress(0);
      setCalculating(false);
      setIntermediate(false);
      setOutputImage(undefined);
    });
    child.killChild();
  }, [child]);

  const onSave = () => { };

  const imageCardStyle = useCallback(
    (): CSSProperties => ({
      maxWidth: zoomFurther ? undefined : "70vw",
      maxHeight: zoomFurther ? undefined : "70vw",
      // height: zoomFurther ? "100%" : undefined,
      // width: zoomFurther ? "100%" : undefined,
      display: "block"
    }),
    [zoomFurther]
  );

  const [isMouseDown, setMouseDown] = useState<boolean>(false);
  const [isShowHelp, setShowHelp] = useState<boolean>(false);

  return (
    <div>
      <h1 style={{ marginTop: 32, marginBottom: 24, color: "#555555" }}>
        Image Super-Resolution GUI
      </h1>

      <div className="flex-row row-center">
        <Card style={imageCardStyle()} elevation={4}>
          <div
            {...(inputValue
              ? getRootProps({
                className: "dropzone"
              })
              : {})}
          >
            {/* {(inputValue && !isCalculating && !isIntermediate) && <input {...getInputProps()} />} */}
            {droppedImage ? (
              (outputImage) ? (
                <div
                  onMouseDown={() => {
                    setMouseDown(true);
                  }}
                  onMouseUp={() => {
                    setMouseDown(false);
                  }}
                  onClick={() => {
                    setMouseDown(false);
                  }}
                  onMouseEnter={() => {
                    setMouseDown(false);
                  }}
                >
                  <img
                    style={{
                      ...imageCardStyle(),
                      zIndex: isMouseDown ? 999 : 0,
                      position: "absolute",
                      opacity: isMouseDown ? 1 : 0
                    }}
                    src={outputImage}
                    alt=""
                  />
                  <AttentionSeeker effect="tada" delay={500}>
                    <div
                      className="image"
                      id="image-compare"
                      style={imageCardStyle()}
                    >
                      <img style={imageCardStyle()} src={outputImage} alt="" />
                      <img style={imageCardStyle()} src={droppedImage} alt="" />
                    </div>
                  </AttentionSeeker>
                </div>
              ) : (
                <div>
                  <Fade>
                    <img
                      className="image"
                      style={{
                        ...imageCardStyle(),
                        transition:
                          isCalculating || isIntermediate ? "ease-in 0.2s" : "",
                        filter: `blur(${isCalculating || isIntermediate
                            ? Math.abs(((100 - progress) * 4) / 25 - 1) // 0 - 16
                            : 0
                          }px)`
                      }}
                      src={droppedImage || ""}
                      alt=""
                    />
                  </Fade>
                </div>
              )
            ) : (
              <div className="flex-row row-center image-card-full">
                <h2 style={{ color: "#C6CFE8", margin: 16 }}>
                  {inputValue
                    ? "Drag 'n' drop a image here"
                    : "Please fill settings first"}
                </h2>
              </div>
            )}
          </div>
        </Card>
      </div>

      <ProgressLinear
        style={{ marginTop: 32 }}
        color="var(--primary)"
        indeterminate={isIntermediate || (isCalculating && progress < 2)}
        value={progress < 3 ? 0 : progress}
      />

      <div className="flex-row row-center">
        {warningType ? (
          <>
            <Alert type="warning">
              {warningType === 1
                ? "Path to Real-ESRGAN can not be empty!"
                : `${imageModel} not found, does it exist?`}
            </Alert>
          </>
        ) : (
          <></>
        )}
      </div>

      <div className="flex-row row-center" style={{ marginTop: 8 }}>
        <div style={{ width: 240 }}>
          <div style={{ width: 240, textAlign: "left", margin: 8 }}>
            <h3 style={{ color: "#555555" }}>Image model:</h3>
          </div>
          <div style={{ width: 240 }}>
            <RadioGroup
              disabled={isIntermediate || isCalculating}
              vertical
              value={imageModel}
              color="var(--primary)"
              onChange={onImageModelsChange}
            >
              {imageModels.map((model) => (
                <Radio key={model} value={model} label={model} />
              ))}
            </RadioGroup>
          </div>

          <div style={{ width: 240, textAlign: "left", margin: 8 }}>
            <h3 style={{ color: "#555555" }}>Video model:</h3>
          </div>
          <div style={{ width: 240 }}>
            <RadioGroup
              disabled={isIntermediate || isCalculating}
              vertical
              value={videoModel}
              color="var(--primary)"
              onChange={onVideoModelsChange}
            >
              {videoModels.map((model) => (
                <Radio key={model} value={model} label={model} disabled />
              ))}
            </RadioGroup>
          </div>
        </div>


        <div style={{ marginLeft: 32, width: 178 }}>
          <div style={{ width: 178 }}>
            <Button
              size="large"
              color={
                isIntermediate || isCalculating ? "#E81023" : "var(--primary)"
              }
              style={{ marginBottom: 16, marginTop: 16 }}
              onClick={isIntermediate || isCalculating ? onCancel : onStart}
              disabled={!droppedImage || !pathToBinary}
            >
              {isIntermediate || isCalculating ? "Cancel" : "Super-resolution!"}
            </Button>
          </div>
          <div style={{ width: 160, marginLeft: -2 }}>
            <Checkbox
              disabled={isIntermediate || isCalculating}
              color="var(--primary)"
              label="Zoom further"
              checked={zoomFurther}
              onClick={() => {
                setZoomFurther(!zoomFurther);
              }}
            />
          </div>
          <div style={{ width: 160 }}>
            <Checkbox
              disabled={isIntermediate || isCalculating}
              color="var(--primary)"
              label="Show settings"
              checked={isSettingsVisible}
              onClick={() => {
                setSettingsVisible(!isSettingsVisible);
              }}
            />
          </div>
        </div>

      </div>

      {/* <Button onClick={() => {setIntermediate(!isIntermediate); console.log(progress)}}>intermediate</Button> */}

      <div className="flex-row row-center">
        {isSettingsVisible && (
          <>
            <TextArea
              append={
                <a
                  color="var(--primary)"
                  onClick={() => {
                    setShowHelp(!isShowHelp);
                  }}
                  style={{ userSelect: "none", cursor: "pointer" }}
                >
                  ?
                </a>
              }
              onChange={(e) => {
                setInputValue(e.value);
              }}
              value={inputValue || ""}
              label="Binary Path"
              hint={isShowHelp ? "" : "Path to Real-ESRGAN directory"}
              name="Binary Path"
              width={384}
              height={46}
            />
          </>
        )}
      </div>
      {isShowHelp &&
        <p style={{ color: "#999999", fontSize: 12, textAlign: "center", marginTop: -18 }}>Real-ESRGAN can be obtained
          from&nbsp;
          <a target="_blank" href="https://github.com/xinntao/Real-ESRGAN/releases">here</a>
        </p>}
      <div style={{ marginBottom: 32 }} />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Hello} />
      </Switch>
    </Router>
  );
}
