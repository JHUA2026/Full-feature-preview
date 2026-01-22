document.addEventListener("DOMContentLoaded", () => {
  const { jsPDF } = window.jspdf;
  let logoBase64 = "";

  const ids = [
    "productName", "canvaLink", "fontFamily",
    "fontSize", "fontColor", "instructionText"
  ];

  ids.forEach(id => {
    document.getElementById(id).addEventListener("input", updatePreview);
  });

  document.getElementById("logoFile").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      logoBase64 = reader.result;
      document.getElementById("previewLogo").src = logoBase64;
    };
    reader.readAsDataURL(file);
  });

  document.getElementById("generateBtn").addEventListener("click", generatePDF);

  function updatePreview() {
    const title = val("productName");
    const link = val("canvaLink");
    const text = val("instructionText");
    const font = val("fontFamily");
    const size = val("fontSize");
    const color = val("fontColor");

    document.getElementById("previewTitle").textContent =
      title || "Product Name";

    const linkEl = document.getElementById("previewLink");
    linkEl.textContent = "Open your Canva template";
    linkEl.href = link || "#";

    const textEl = document.getElementById("previewText");
    textEl.textContent = text || "Your instructions will appear here…";
    textEl.style.fontFamily = font;
    textEl.style.fontSize = size + "px";
    textEl.style.color = color;
  }

  function generatePDF() {
    const productName = val("productName");
    const canvaLink = val("canvaLink");
    const instruction = val("instructionText");

    if (!productName || !canvaLink || !instruction) {
      alert("Please fill in all required fields.");
      return;
    }

    const doc = new jsPDF({
      unit: "mm",
      format: val("paperSize")
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let y = 30;
    let page = 1;

    function header() {
      if (logoBase64) {
        doc.addImage(logoBase64, "PNG", pageWidth - 45, 10, 30, 15);
      }
    }

    function footer() {
      doc.setFontSize(9);
      doc.text(`Page ${page}`, pageWidth / 2, pageHeight - 10, { align: "center" });
    }

    function newPage() {
      footer();
      doc.addPage();
      page++;
      y = 30;
      header();
    }

    header();
    doc.setFont(val("fontFamily"), "bold");
    doc.setFontSize(18);
    doc.text(productName, margin, y);
    y += 10;

    doc.setFontSize(12);
    doc.textWithLink("Open your Canva template", margin, y, { url: canvaLink });
    y += 15;

    doc.setFont(val("fontFamily"), "normal");
    doc.setFontSize(parseInt(val("fontSize")));
    doc.setTextColor(val("fontColor"));

    doc.splitTextToSize(instruction, pageWidth - margin * 2)
      .forEach(line => {
        if (y > pageHeight - 30) newPage();
        doc.text(line, margin, y);
        y += parseInt(val("fontSize")) + 1.5;
      });

    footer();
    doc.save("canva-instructions.pdf");
  }

  function val(id) {
    return document.getElementById(id).value.trim();
  }

  updatePreview();
});
