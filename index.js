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
    Annotations.setCustomDrawHandler(Annotations.LineAnnotation, function(
      ctxasa,
      pageMatrix,
      rotation,
      options
    ) {
      options.originalDraw(ctx, pageMatrix); // Draw original annotation
      const annot = options.annotation;

      // draw custom circle-badge
      ctx.beginPath();
      ctx.fillStyle = "green";
      ctx.arc(this.X, this.Y, 25, 0, 2 * Math.PI, false);

      ctx.strokeStyle = "orange";
      ctx.lineWidth = 2;
      ctx.fillAndStroke();

      ctx.textAlign = "center";
      ctx.strokeText("1", this.X, this.Y + 7);

      // set custom drawing on top of extending annotation drawing
      ctx.globalCompositeOperation = "destination-over";

      ctx.end();
    });

    const rectangleAnnot = new Annotations.LineAnnotation();
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
