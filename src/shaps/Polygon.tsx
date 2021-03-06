import React, { useEffect, useRef, useState } from "react";
import { DW, getCropPosition, paintArc } from "./corCaculate";
import { cropperType, PolyCors } from "../type";
import { useMoveEvent } from "../hooks";

// interface propsType {
//   src?: string;
//   dots: number;
//   canvasWidth: number,
//   canvasHeight: number,
//   onResult: (url: string) => void;
// }
// type PolyCors = {
//   x: number;
//   y: number;
// };

function getInitital(cW: number, cH: number, dots: number): PolyCors[] {
  const radius = Math.min(cW * 0.5, cH * 0.5, 200) / 2;
  const x = cW / 2;
  const y = cH / 2;

  let a = [];
  for (let i = 0; i < dots; i++) {
    let angel;
    if (dots % 2 === 1) {
      angel = (i / dots) * 2 * Math.PI - Math.PI / 2;
    } else {
      angel = ((i + 0.5) / dots) * 2 * Math.PI;
    }
    let cos = Math.cos(angel).toFixed(3);
    let sin = Math.sin(angel).toFixed(3);
    a.push({
      x: x + radius * parseFloat(cos),
      y: y + radius * parseFloat(sin),
    });
  }
  return a;
}

const Polygon: React.FC<cropperType> = (props: cropperType) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    src,
    canvasWidth,
    canvasHeight,
    dots = 4,
    configs: { cropColor, maskColor },
  } = props;
  const [polygon, setPolygon] = useState<PolyCors[]>(
    getInitital(canvasWidth, canvasHeight, dots)
  );
  const pos = useRef<number>(dots);
  const press = useRef<boolean>(false);

  // init canvas and paint the background
  useEffect(() => {
    paint();
  }, []);

  function paint() {
    if (!canvasRef.current) return;
    const canvas: HTMLCanvasElement = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = maskColor;
    ctx.beginPath();
    ctx.lineTo(0, 0);
    for (let i = 0; i < dots; i++) {
      ctx.lineTo(polygon[i].x, polygon[i].y);
    }
    ctx.lineTo(polygon[0].x, polygon[0].y);
    ctx.lineTo(0, 0);
    ctx.lineTo(0, canvasHeight);
    ctx.lineTo(canvasWidth, canvasHeight);
    ctx.lineTo(canvasWidth, 0);

    ctx.fill();

    ctx.strokeStyle = cropColor;
    ctx.fillStyle = cropColor;
    ctx.beginPath();
    ctx.setLineDash([4]);
    for (let i = 0; i < dots; i++) {
      ctx.lineTo(polygon[i].x, polygon[i].y);
    }
    ctx.lineTo(polygon[0].x, polygon[0].y);

    for (let i = 0; i < dots; i++) {
      paintArc(ctx, polygon[i].x, polygon[i].y, DW);
    }
    ctx.stroke();
    ctx.closePath();

    const cropper: HTMLCanvasElement = document.createElement("canvas");
    let x_max: number = 0,
      x_min: number = canvasWidth,
      y_max: number = 0,
      y_min: number = canvasHeight;
    polygon.forEach((item) => {
      x_max = Math.max(x_max, item.x);
      x_min = Math.min(x_min, item.x);
      y_max = Math.max(y_max, item.y);
      y_min = Math.min(y_min, item.y);
    });
    cropper.width = x_max - x_min;
    cropper.height = y_max - y_min;
    const cropper_ctx = cropper.getContext("2d");
    let img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.src = src || "";
    img.onload = function () {
      cropper_ctx?.beginPath();
      polygon.forEach((item) => {
        cropper_ctx?.lineTo(item.x - x_min, item.y - y_min);
      });
      cropper_ctx?.lineTo(polygon[0].x - x_min, polygon[0].y - y_min);
      cropper_ctx?.clip();
      const cropPos: number[] = getCropPosition(
        canvasWidth,
        canvasHeight,
        img.width,
        img.height,
        x_min,
        y_min,
        cropper.width,
        cropper.height
      );
      cropper_ctx?.drawImage(
        img,
        cropPos[0],
        cropPos[1],
        cropPos[2],
        cropPos[3],
        0,
        0,
        cropper.width,
        cropper.height
      );
      props.onResult(cropper?.toDataURL("image/png", 1));
    };
  }

  const setCursor = (p: number) => {
    if (!canvasRef.current) return;
    const canvas: HTMLCanvasElement = canvasRef.current;
    if (p === dots) canvas.style.cursor = "default";
    else canvas.style.cursor = "move";
  };
  function isInArea(n0: number, n1: number, n: number) {
    return n > n0 && n < n1;
  }

  function on_down(polygon: PolyCors[], e: PolyCors): number {
    for (let i = 0; i < dots; i++) {
      if (
        isInArea(polygon[i].x - DW / 2, polygon[i].x + DW / 2, e.x) &&
        isInArea(polygon[i].y - DW / 2, polygon[i].y + DW / 2, e.y)
      ) {
        return i;
      }
    }
    return dots;
  }

  const onMouseDown = (clientX:number,clientY:number) => {
    if (!canvasRef.current) return;
    const canvas: HTMLCanvasElement = canvasRef.current;
    const rect: DOMRectList = canvas.getClientRects();
    let x = clientX - rect[0].x;
    let y = clientY - rect[0].y;
    pos.current = on_down(polygon, { x, y });
    setCursor(pos.current);
  };

  const onMouseMove = (clientX:number,clientY:number) => {
    // console.log(e.clientX,e.clientY)
    if (!canvasRef.current) return;
    const canvas: HTMLCanvasElement = canvasRef.current;
    // let { offsetX: x, offsetY: y } = e.nativeEvent;
    // console.log(x,y)
    const rect: DOMRectList = canvas.getClientRects();
    let x = clientX - rect[0].x;
    let y = clientY - rect[0].y;
    if (!press.current) {
      let p = on_down(polygon, { x, y });
      setCursor(p);
    }
    if (pos.current === dots) return;

    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (x > canvasWidth) x = canvasWidth;
    if (y > canvasHeight) y = canvasHeight;
    polygon[pos.current] = { x, y };
    setPolygon(polygon);
    paint();
  };
  const onMouseUp = (clientX:number,clientY:number) => {
    press.current = false;
    pos.current = dots;
  };
  // console.log(canvasWidth)

  useMoveEvent(onMouseDown, onMouseMove, onMouseUp);

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
    />
  );
};

export default Polygon;
