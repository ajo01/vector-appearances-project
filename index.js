/* eslint-disable */
const Webviewer = window.WebViewer;
const hashFile =
  "/" + (window.location.hash || "webviewer-demo.pdf").replace("#", "");

Webviewer(
  {
    initialDoc: hashFile,
    path: "/lib",
  },
  document.getElementById("viewer")
).then((instance) => {
  var ctx = new canvas2pdf.PdfContext(blobStream());

  const { Annotations, annotationManager, documentViewer } = instance.Core;
  let windowCnt = 0;

  documentViewer.addEventListener("documentLoaded", () => {
    Annotations.setCustomDrawHandler(
      Annotations.EllipseAnnotation,
      (ctxas, pageMatrix, rotation, options) => {
        const { annotation, originalDraw } = options;

        if (windowCnt === 0) {
          windowCnt++;
          options.originalDraw(ctx, pageMatrix);
          ctx.beginPath();
          annotation.setStyles(ctx, pageMatrix);

          const x = annotation.X + annotation.fringe.x1;
          const y = annotation.Y + annotation.fringe.y1;
          let width =
            annotation.getWidth() - annotation.fringe.x1 - annotation.fringe.x2;
          let height =
            annotation.getHeight() -
            annotation.fringe.y1 -
            annotation.fringe.y2;

          width = Math.max(width, 1);
          height = Math.max(height, 1);

          const whRatio = width / height;
          if (isNaN(whRatio) || whRatio === Infinity) {
            return;
          }
          ctx.save();
          // move annotation to (width / 2, 0), the center top point to start drawing the circle
          ctx.translate(x + ((1 - whRatio) * width) / 2, y);
          // scale the cirle to become an ellipse
          ctx.scale(whRatio, 1);

          ctx.beginPath();
          // center-x, center-y, radius, start-angle, end-angle, ccw
          ctx.arc(
            width * 0.5,
            height * 0.5,
            Math.max(height * 0.5, 0),
            0,
            Math.PI * 2,
            false
          );
          ctx.closePath();
          ctx.restore();
          ctx.clip();

          ctx.stroke();

          // uncomment the next line if you want the hatch line color to be the "FillColor" of the annotation
          // ctx.strokeStyle = ctx.fillStyle;

          const hatchSize = 10;
          const hatchLineWidth = 1;
          ctx.lineWidth = hatchLineWidth;

          // horizontal lines
          for (
            let i = annotation.Y;
            i < annotation.Y + annotation.Height;
            i += hatchSize
          ) {
            ctx.beginPath();
            ctx.moveTo(annotation.X, i);
            ctx.lineTo(annotation.X + annotation.Width, i);
            ctx.stroke();
          }

          // vertical lines
          for (
            let i = annotation.X;
            i < annotation.X + annotation.Width;
            i += hatchSize
          ) {
            ctx.beginPath();
            ctx.moveTo(i, annotation.Y);
            ctx.lineTo(i, annotation.Y + annotation.Height);
            ctx.stroke();
          }
          ctx.end();
        }
      }
    );

    const rectangleAnnot = new Annotations.EllipseAnnotation();
    rectangleAnnot.PageNumber = 1;
    // values are in page coordinates with (0, 0) in the top left
    rectangleAnnot.X = 100;
    rectangleAnnot.Y = 150;
    rectangleAnnot.Width = 200;
    rectangleAnnot.Height = 50;
    rectangleAnnot.Author = annotationManager.getCurrentUser();

    annotationManager.addAnnotation(rectangleAnnot);
    // need to draw the annotation otherwise it won't show up until the page is refreshed
    annotationManager.redrawAnnotation(rectangleAnnot);

    ctx.stream.on("finish", function() {
      var blob = ctx.stream.toBlob("application/pdf");
      saveAs(blob, "example.pdf", true);
    });
  });
});
