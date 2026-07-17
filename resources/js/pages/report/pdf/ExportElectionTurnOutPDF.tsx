import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportElectionTurnOutPDFProps {
  summary: any;
  startDate?: string | Date;
  endDate?: string | Date;
}

export default function ExportElectionTurnOutPDF({ summary }: ExportElectionTurnOutPDFProps) {
  const generatePDF = async () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "letter",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = 20;

    // === Logo ===
    const img = new Image();
    img.src = `${window.APP_BASE_URL}assets/images/logo.png`;
    await new Promise((resolve) => {
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
    });
    try {
      doc.addImage(img, "PNG", 15, 10, 25, 25);
    } catch (e) { }

    // === Header ===
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(
      ["Tagum City Government Employees' Union", "(TACGEU)"],
      pageWidth / 2,
      currentY,
      { align: "center" }
    );
    currentY += 14;

    doc.setFontSize(14);
    doc.text("Election Candidate Turnout Report", pageWidth / 2, currentY, { align: "center" });
    currentY += 6;

    if (summary?.election?.title) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Election: ${summary.election.title}`, pageWidth / 2, currentY, { align: "center" });
      currentY += 8;
    }

    if (summary?.election?.remarks) {
      // Position slightly below the last table (closer)
      let remarksY = (doc as any).lastAutoTable
        ? (doc as any).lastAutoTable.finalY + 4  // reduced spacing
        : currentY + 4;

      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80); // subtle gray

      const remarksText = `Remarks: ${summary.election.remarks}`;

      // Wrap text to fit page width
      const splitRemarks = doc.splitTextToSize(
        remarksText,
        doc.internal.pageSize.getWidth() - 30 // 15mm margin each side
      );

      // Draw the text
      doc.text(splitRemarks, 15, remarksY);

      // Reset color
      doc.setTextColor(0, 0, 0);

      // Update currentY for next content (footer)
      currentY = remarksY + splitRemarks.length * 5;
    }

    // === Footer variables ===
    const preparedBy = (summary?.preparedBy || "System Administrator").toUpperCase();
    const role = summary.role || "System Administrator";
    const generatedDate = new Date().toLocaleString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // Create an empty table only to activate didDrawPage for footer
    autoTable(doc, {
      startY: currentY,
      body: [],
      theme: "plain",
      margin: { bottom: 30 },

      didDrawPage: () => {
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();

        const leftX = 15;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        const preparedY = pageHeight - 22;
        doc.text("Prepared by:", leftX, preparedY);

        // Name under it
        doc.setFont("helvetica", "normal");
        const nameY = preparedY + 5;
        doc.text(preparedBy, leftX, nameY);

        const nameWidth = doc.getTextWidth(preparedBy);
        doc.line(leftX, nameY + 1, leftX + nameWidth, nameY + 1);

        // Role under underline
        const roleY = nameY + 6;
        doc.text(role, leftX, roleY);

        // System note (centered)
        doc.text(
          `This is a system generated report.  |  ${generatedDate}`,
          pageWidth / 2,
          roleY,
          { align: "left" }
        );
      },
    });

    // === Group candidates by position ===
    const grouped = summary.candidates.reduce((acc: any, cand: any) => {
      const pos = cand.position || "Unknown Position";
      if (!acc[pos]) acc[pos] = [];
      acc[pos].push(cand);
      return acc;
    }, {});

    // === Generate tables ===
    Object.entries(grouped).forEach(([position, candidates]: any, index) => {
      if (index > 0) currentY = (doc as any).lastAutoTable.finalY + 8;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(position, 15, currentY);
      currentY += 3;

      autoTable(doc, {
        startY: currentY,
        head: [["Candidate", "Votes", "Percentage", "Performance"]],
        body: candidates
          .sort((a: any, b: any) => b.votes - a.votes)
          .map((c: any) => [
            c.candidate,
            c.votes.toLocaleString(),
            `${c.percentage.toFixed(2)}%`,
            c.result,
          ]),
        margin: {
          left: 15,
          right: 15,
          bottom: 25,
        },
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
      });
    });

    // === Save ===
    doc.save("Election_Candidate_Turnout_Report.pdf");
  };

  return (
    <Button
      onClick={generatePDF}
      className="flex items-center gap-2 bg-gray-800 hover:bg-gray-600 text-white shadow-md rounded-lg px-4 py-2"
    >
      <FileText className="w-5 h-5" />
      Export Candidate Turnout PDF
    </Button>
  );
}
