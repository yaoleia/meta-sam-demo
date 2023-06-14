import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Image, Layer, Path, Stage, Text } from "react-konva";
import {
  canvasScaleInitializer,
  canvasScaleResizer,
} from "./helpers/CanvasHelper";
import colors from "./helpers/colors";
import SvgMask from "./SvgMask";
import { handleImageScale, convertToSVGPath } from "./helpers/ImageHelper";
import './index.scss'

Konva.pixelRatio = 1;

interface CanvasProps {
  imageSrc?: string;
  polygons?: Array<any>;
  konvaRef?: React.RefObject<Konva.Stage> | null;
  style?: React.CSSProperties;
  className?: string;
}

const Canvas = ({
  imageSrc = "",
  polygons = [],
  konvaRef,
  style,
  className = "",
}: CanvasProps) => {
  const [image, setImage] = useState(null as any);
  const [hoverIndex, setHoverIndex] = useState(null as any);

  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<any>(null);

  const scale = useMemo(() => image && handleImageScale(image), [image]);

  const svgs = useMemo(() => {
    const s = polygons?.map((p) => convertToSVGPath(p));
    return [s];
  }, [polygons]);

  const { canvasDimensions, w, h } = useMemo(() => {
    const w = scale?.width || 0;
    const h = scale?.height || 0;
    const canvasDimensions = {
      width: Math.floor(w),
      height: Math.floor(h),
    };
    return {
      canvasDimensions,
      w,
      h,
    };
  }, [scale, image]);

  const resizer = useMemo(() => {
    return canvasScaleInitializer({
      width: canvasDimensions.width,
      height: canvasDimensions.height,
      containerRef,
      shouldFitToWidth: true,
    });
  }, []);

  const [scalingStyle, setScalingStyle] = useState(resizer.scalingStyle);
  const [scaledDimensionsStyle, setScaledDimensionsStyle] = useState(
    resizer.scaledDimensionsStyle
  );

  const resizeObserver = useMemo(() => {
    return new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === containerRef.current) {
          let width;
          let height;
          if (entry.contentBoxSize) {
            // Firefox implements `contentBoxSize` as a single content rect, rather than an array
            const contentBoxSize = Array.isArray(entry.contentBoxSize)
              ? entry.contentBoxSize[0]
              : entry.contentBoxSize;
            width = contentBoxSize.inlineSize;
            height = contentBoxSize.blockSize;
          } else {
            width = entry.contentRect.width;
            height = entry.contentRect.height;
          }
          const resized = canvasScaleResizer({
            width: canvasDimensions.width,
            height: canvasDimensions.height,
            containerWidth: width,
            containerHeight: height,
            shouldFitToWidth: true,
          });
          setScaledDimensionsStyle(resized.scaledDimensionsStyle);
          setScalingStyle(resized.scalingStyle);
        }
      }
    });
  }, [canvasDimensions]);

  const imageClone = useMemo(() => {
    if (!image) return;
    const img = new window.Image();
    img.src = image.src;
    img.width = w;
    img.height = h;
    return img;
  }, [image, w, h]);

  useEffect(() => {
    const img = document.createElement("img");
    img.src = imageSrc;
    img.onload = () => {
      setImage(img);
    };
  }, [imageSrc]);

  useEffect(() => {
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [resizeObserver]);

  if (!image) return null;

  return (
    <div
      className={`konva_canvas_wrap ${className}`}
      ref={containerRef}
      style={style}
    >
      {!isNaN(scaledDimensionsStyle.width) && (
        <div className={`relative`} style={scaledDimensionsStyle}>
          <div className="absolute w-full h-full bg-black pointer-events-none"></div>
          <img
            src={image.src}
            className={`absolute w-full h-full pointer-events-none opacity-50`}
            style={{ margin: 0 }}
          ></img>
          {scale &&
            svgs?.map((svg, index) => (
              <SvgMask
                key={index}
                image={image}
                color={colors[index + 2]}
                xScale={scale.width * scale.uploadScale}
                yScale={scale.height * scale.uploadScale}
                svgStr={svg.join(" ")}
              />
            ))}
          <Stage
            className="konva"
            width={canvasDimensions.width}
            height={canvasDimensions.height}
            onContextMenu={(e: KonvaEventObject<PointerEvent>) =>
              e.evt.preventDefault()
            }
            ref={konvaRef}
            style={scalingStyle}
          >
            <Layer name="image">
              <Image
                x={0}
                y={0}
                image={imageClone}
                width={canvasDimensions.width}
                height={canvasDimensions.height}
                opacity={0}
                preventDefault={false}
              />
            </Layer>
            <Layer name="tooltip">
              <Text
                ref={tooltipRef}
                text=""
                textFill="#000"
                fill="#fff"
                shadowBlur={5}
                shadowColor="#000"
                fontSize={22}
                padding={5}
                alpha={1}
                visible={false}
              />
            </Layer>
            <Layer name="svgMask">
              {scale &&
                svgs?.map((svg, index) => (
                  <Path
                    key={index}
                    data={svg.join(" ")}
                    fill={colors[index + 2]}
                    scaleX={1 / scale.uploadScale}
                    scaleY={1 / scale.uploadScale}
                    lineCap="round"
                    lineJoin="round"
                    onMouseEnter={() => {
                      setHoverIndex(index);
                    }}
                    onMouseMove={() => {
                      const mousePos = konvaRef?.current?.getPointerPosition();
                      if (!mousePos) return;
                      const tooltip = tooltipRef.current;
                      tooltip.position({
                        x: mousePos.x + 5,
                        y: mousePos.y + 5,
                      });
                      tooltip.text("Red Circle");
                      tooltip.show();
                    }}
                    onMouseLeave={() => {
                      setHoverIndex(null);
                      tooltipRef.current?.hide();
                    }}
                    opacity={hoverIndex === index ? 0.3 : 0}
                    preventDefault={false}
                  />
                ))}
            </Layer>
          </Stage>
        </div>
      )}
    </div>
  );
};

export default Canvas;
