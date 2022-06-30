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
  Annotations.setCustomDrawHandler(Annotations.StickyAnnotation, function(
    contex,
    pageMatrix,
    rotation,
    options
  ) {
    // draw original annotation
    if (windowCnt === 0) {
      windowCnt++;
      options.originalDraw(ctx, pageMatrix); // prepare options
      const annot = options.annotation;
      const circleRadius = 12;
      const customX = annot.X < circleRadius ? annot.X + annot.Width : annot.X;
      const customY = annot.Y < circleRadius ? annot.Y + annot.Height : annot.Y; // draw a circle-badge
      ctx.beginPath();
      ctx.fillStyle = annot.StrokeColor || annot.FillColor || "#fff";
      ctx.strokeStyle = "#000";
      ctx.arc(customX, customY, circleRadius, 0, 2 * Math.PI, false);
      ctx.fillAndStroke();
      ctx.font = "bold 8px Times-Roman";
      ctx.textAlign = "center";
      ctx.fillStyle = "blue";
      ctx.fillText("font", customX, customY + 4.5);

      // set custom drawing on top of extending annotation drawing
      ctx.globalCompositeOperation = "destination-over";
      ctx.end();
    }
  });

  const rectangleAnnot = new Annotations.StickyAnnotation();
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
