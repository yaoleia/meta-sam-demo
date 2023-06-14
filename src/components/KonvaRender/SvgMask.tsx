import React, { useEffect, useState, useRef, useMemo } from "react";
import shortid from "shortid";

interface SvgMaskProps {
  image?: any;
  xScale: number;
  yScale: number;
  svgStr: string;
  className?: string | undefined;
  color?: string | undefined;
}

const SvgMask = ({
  image,
  xScale,
  yScale,
  svgStr,
  className = "",
  color = "#1d85bb",
}: SvgMaskProps) => {
  const wrapId = useMemo(() => `svg_mask_${shortid.generate()}`, []);

  const [boundingBox, setBoundingBox] = useState<DOMRect | undefined>(
    undefined
  );
  const pathRef = useRef<SVGPathElement>(null);

  const getBoundingBox = () => {
    if (!pathRef?.current) return;
    setBoundingBox(pathRef.current.getBBox());
  };

  useEffect(() => {
    getBoundingBox();
  }, [svgStr]);

  const bbX = boundingBox?.x;
  const bbY = boundingBox?.y;
  const bbWidth = boundingBox?.width;
  const bbHeight = boundingBox?.height;
  const bbMiddleY = bbY && bbHeight && bbY + bbHeight / 2;
  const bbWidthRatio = bbWidth && bbWidth / xScale;

  return (
    <svg
      className={`absolute w-full h-full pointer-events-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${xScale} ${yScale}`}
    >
      {bbX && bbWidth && (
        <>
          <radialGradient
            id={"gradient" + wrapId}
            cx={0}
            cy={0}
            r={bbWidth}
            gradientUnits="userSpaceOnUse"
            gradientTransform={`translate(${bbX - bbWidth / 4},${bbMiddleY})`}
          >
            <stop offset={0} stopColor="white" stopOpacity="0"></stop>
            <stop offset={0.25} stopColor="white" stopOpacity={0.7}></stop>
            <stop offset={0.5} stopColor="white" stopOpacity="0"></stop>
            <stop offset={0.75} stopColor="white" stopOpacity={0.7}></stop>
            <stop offset={1} stopColor="white" stopOpacity="0"></stop>
            <animateTransform
              attributeName="gradientTransform"
              attributeType="XML"
              type="scale"
              from={0}
              to={12}
              dur={`1s`}
              begin={".3s"}
              fill={"freeze"}
              additive="sum"
            ></animateTransform>
          </radialGradient>
        </>
      )}
      <clipPath id={"clip-path" + wrapId}>
        <path d={svgStr} />
      </clipPath>
      <filter
        id={"glow" + wrapId}
        x="-50%"
        y="-50%"
        width={"200%"}
        height={"200%"}
      >
        <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor={color} />
        <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={color} />
        <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor={color} />
      </filter>
      <image
        width="100%"
        height="100%"
        xlinkHref={image?.src}
        clipPath={`url(#clip-path${wrapId})`}
      />
      {bbWidthRatio && (
        <path
          id={"mask-gradient" + wrapId}
          className={`mask-gradient ${
            bbWidthRatio > 0.5 && window.innerWidth < 768 ? "hidden" : ""
          }`}
          d={svgStr}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0"
          fillOpacity="1"
          fill={`url(#gradient${wrapId})`}
        />
      )}
      <path
        id={"mask-path" + wrapId}
        className="mask-path"
        d={svgStr}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity=".8"
        fillOpacity="0"
        fill={color}
        stroke={color}
        strokeWidth="3"
        ref={pathRef}
        filter={`url(#glow${wrapId})`}
      />
    </svg>
  );
};

export default SvgMask;
