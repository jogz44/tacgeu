import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface ExportElectionReportPDFProps {
  summary: any;
  startDate?: string | Date;
  endDate?: string | Date;
}

export default function ExportElectionReportPDF({
  summary,
  startDate,
  endDate,
}: ExportElectionReportPDFProps) {
  const today = new Date();
  const generatedDate = today.toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const formattedStart = startDate ? format(new Date(startDate), "MMMM dd, yyyy") : "—";
  const formattedEnd = endDate ? format(new Date(endDate), "MMMM dd, yyyy") : "—";

  let dateText = formattedStart;
  if (formattedStart !== formattedEnd) {
    dateText += ` - ${formattedEnd}`;
  }

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
    await new Promise((resolve, reject) => {
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
    });
    try {
      doc.addImage(img, "PNG", 15, 10, 25, 25);
    } catch (e) {
      // Ignore if logo not found
    }

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
    doc.text("Electoral Performance Report", pageWidth / 2, currentY, { align: "center" });
    currentY += 10;

    // === Election Info ===
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`Election: ${summary?.election?.title || "—"}`, 15, currentY);
    currentY += 6;

    // === Election Remarks ===
    if (summary?.election?.remarks) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80); // slightly gray
      const remarksText = `Remarks: ${summary.election.remarks}`;

      // Wrap text if too long
      const splitRemarks = doc.splitTextToSize(remarksText, doc.internal.pageSize.getWidth() - 30); // 15mm margin each side
      doc.text(splitRemarks, 15, currentY);
      currentY += splitRemarks.length * 5; // adjust line spacing
    }

    doc.setTextColor(0, 0, 0); // reset color for following content
    currentY += 4; // small spacing before summary table

    // === Summary Overview ===
    doc.setFontSize(11);
    doc.text("Summary Overview", 15, currentY);
    currentY += 5;

    autoTable(doc, {
      startY: currentY,
      body: [
        ["Total Registered Voters", (summary?.total_voters || 0).toLocaleString()],
        ["Total Votes Cast", (summary?.total_votes || 0).toLocaleString()],
        ["Turnout Rate", `${(summary?.turnout_rate || 0).toFixed(2)}%`],
        ["Total Candidates", (summary?.total_candidates || 0).toLocaleString()],
      ],
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: "bold" }, 1: { halign: "right" } },
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;

    // === Candidates by Position ===
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Candidate Results (Grouped by Position)", 15, currentY);
    currentY += 6;

    // Group candidates by position
    const grouped = (summary?.candidates || []).reduce((acc: any, c: any) => {
      const pos = c.position || "Unknown Position";
      if (!acc[pos]) acc[pos] = [];
      acc[pos].push(c);
      return acc;
    }, {});

    // Generate each position section
    for (const [position, candidates] of Object.entries(grouped)) {
      const sortedCandidates = (candidates as any[]).sort((a, b) => b.votes - a.votes);

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`${position}`, 15, currentY);
      currentY += 5;

      autoTable(doc, {
        startY: currentY,
        head: [["Candidate", "Total Votes", "Percentage", "Performance"]],
        body: sortedCandidates.map((c: any) => [
          c.candidate,
          c.votes.toLocaleString(),
          `${c.percentage.toFixed(2)}%`,
          c.result,
        ]),
        theme: "grid",
        styles: { fontSize: 9 },
        headStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0] },
      });

      currentY = (doc as any).lastAutoTable.finalY + 8;
    }

    // === Footer on all pages ===
    const preparedBy = (summary.preparedBy || "System Administrator").toUpperCase();
    const role = summary.role || "System Administrator";

    autoTable(doc, {
      startY: currentY,
      body: [],
      theme: "plain",
      margin: {
        left: 15,
        right: 15,
        bottom: 40,
      },
      didDrawPage: () => {
        // After generating all tables, draw footer on all pages
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);

          const pageHeight = doc.internal.pageSize.getHeight();
          const pageWidth = doc.internal.pageSize.getWidth();
          const leftX = 15;
          const footerY = pageHeight - 22;

          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.text("Prepared by:", leftX, footerY);

          doc.setFont("helvetica", "normal");
          const nameY = footerY + 5;
          doc.text(preparedBy, leftX, nameY);
          doc.line(leftX, nameY + 1, leftX + doc.getTextWidth(preparedBy), nameY + 1);

          const roleY = nameY + 6;
          doc.text(role, leftX, roleY);

          doc.text(`This is a system generated report.  |  ${generatedDate}`, pageWidth / 2, roleY, {
            align: "left",
          });
        }

      },
    });

    // === Save PDF ===
    doc.save(
      `Electoral_Performance_Report_${summary?.election?.title?.replace(/\s+/g, "_") || "Report"}.pdf`
    );
  };

  return (
    <Button
      onClick={generatePDF}
      className="flex items-center gap-2 bg-gray-800 hover:bg-gray-600 text-white shadow-md rounded-lg px-4 py-2"
    >
      <FileText className="w-5 h-5" />
      Export Electoral Report PDF
    </Button>
  );
}
