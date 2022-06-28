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
  // var ctx = new canvas2pdf.PdfContext(blobStream());

  const { Annotations, annotationManager, documentViewer } = instance.Core;
  let windowCnt = 0;

  documentViewer.addEventListener("documentLoaded", () => {
    // from https://www.pdftron.com/api/web/Core.Annotations.html#.setCustomDrawHandler
    Annotations.setCustomDrawHandler(Annotations.RectangleAnnotation, function(
      ctx,
      pageMatrix,
      rotation,
      options
    ) {
      if (windowCnt === 0) {
        windowCnt++;
        options.originalDraw(ctx, pageMatrix); // Draw original annotation
        const annot = options.annotation;

        // Draw annotation ID overtop the rectangle
        var gradient = ctx.createLinearGradient(0, 0, 170, 0);
        gradient.addColorStop("0", "magenta");
        gradient.addColorStop("0.5", "blue");
        gradient.addColorStop("1.0", "green");

        ctx.fillStyle = gradient;
        // // Fill with gradient
        // ctx.fillStyle = "black";
        const fontSize = 10;
        ctx.fillText(annot.Id, annot.X, annot.Y + fontSize); // Draw at annotation location

        // ctx.end();
      }
    });

    const rectangleAnnot = new Annotations.RectangleAnnotation();
    rectangleAnnot.PageNumber = 1;
    // values are in page coordinates with (0, 0) in the top left
    rectangleAnnot.X = 100;
    rectangleAnnot.Y = 150;
    rectangleAnnot.Width = 200;
    rectangleAnnot.Height = 100;
    rectangleAnnot.Author = annotationManager.getCurrentUser();
    rectangleAnnot.FillColor = new Annotations.Color(255, 0, 0);

    annotationManager.addAnnotation(rectangleAnnot);
    // need to draw the annotation otherwise it won't show up until the page is refreshed
    annotationManager.redrawAnnotation(rectangleAnnot);

    // ctx.stream.on("finish", function() {
    //   var blob = ctx.stream.toBlob("application/pdf");
    //   saveAs(blob, "example.pdf", true);
    // });
  });
});
