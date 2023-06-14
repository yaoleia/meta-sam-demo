const handleImageScale = (data: HTMLImageElement) => {
  const IMAGE_SIZE = 500;
  const UPLOAD_IMAGE_SIZE = data.naturalWidth ?? 1024;
  let w = data.naturalWidth;
  let h = data.naturalHeight;
  let scale;
  let uploadScale;
  if (h < w) {
    scale = IMAGE_SIZE / h;
    if (h * scale > 1333) {
      scale = 1333 / h;
    }
    uploadScale = UPLOAD_IMAGE_SIZE / w;
  } else {
    scale = IMAGE_SIZE / w;
    if (w * scale > 1333) {
      scale = 1333 / w;
    }
    uploadScale = UPLOAD_IMAGE_SIZE / h;
  }
  return { height: h, width: w, scale, uploadScale };
};

function convertToSVGPath(points = []) {
  if (points.length < 2) {
    return "";
  }

  let path = "M" + points[0][0] + "," + points[0][1];

  for (let i = 1; i < points.length; i++) {
    path += " L" + points[i][0] + "," + points[i][1];
  }

  return path;
}

export { handleImageScale, convertToSVGPath };
