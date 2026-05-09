import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportPDFProps {
    data: (string | number | null)[][];
    title: string;
    subTitle: string;
    colHeaders: string[];
    preparedBy: string;
    role: string;
    grandTotal?: string; // Optional total for financial reports 
}

export default function ExportPDF({
    data,
    title,
    subTitle,
    colHeaders,
    preparedBy,
    role,
    grandTotal,
}: ExportPDFProps) {

    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true, // ✅ use 12-hour format with AM/PM
    };

    const generatedDate = today.toLocaleString("en-US", options);

    const generatePDF = async () => {
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "letter",
        });

        // === Logo ===
        const img = new Image();
        img.src = "/assets/images/logo.png";
        await new Promise((resolve, reject) => {
            img.onload = () => resolve(true);
            img.onerror = () => reject();
        });
        doc.addImage(img, "PNG", 15, 10, 25, 25);

        // === Header Block ===
        const pageWidth = doc.internal.pageSize.getWidth();

        // Base position (slightly below logo)
        let currentY = 20;

        // Long Title (wrapped)
        const titleText = [
            "Tagum City Government Employees' Union",
            "(TACGEU)"
        ];

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text(titleText, pageWidth / 2, currentY, { align: "center" });

        // Move down based on wrapped lines
        currentY += titleText.length * 7;

        // Subtitle
        doc.setFontSize(14);
        doc.text(title, pageWidth / 2, currentY, { align: "center" });
        currentY += 7;

        // Date Range
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text(subTitle, pageWidth / 2, currentY, { align: "center" });
        currentY += 10; // give a little spacing before table

        // === Table ===
        autoTable(doc, {
            head: [colHeaders],
            body: [
                ...data,
                // Only add Grand Total row if grandTotal is not null or undefined
                ...(grandTotal != null
                    ? [
                        colHeaders.map((_, idx) =>
                            idx === 0
                                ? "Grand Total" // First column
                                : idx === colHeaders.findIndex(h => h.toLowerCase() === "amount")
                                    ? `P ${Number(grandTotal).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` // Amount column
                                    : "" // empty cells
                        ),
                    ]
                    : []),
            ],
            startY: currentY,
            tableWidth: "auto",
            styles: { fontSize: 10, halign: "left", valign: "middle" },
            headStyles: {
                fillColor: [200, 200, 200],
                textColor: [0, 0, 0],
                fontStyle: "bold" as const,
            },
            margin: {
                left: 15,
                right: 15,
                bottom: 25, // 🔥 reserve space for footer
            },
            theme: "grid",

            // Footer for each page
            didDrawPage: () => {
                const pageHeight = doc.internal.pageSize.getHeight();
                const pageWidth = doc.internal.pageSize.getWidth();

                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);

                // X position for left-aligned footer text
                const leftX = 15;

                // Convert preparedBy to ALL CAPS
                const preparedByUpper = preparedBy.toUpperCase();

                // === Prepared By (Underlined) ===
                const preparedY = pageHeight - 20;
                doc.setFont("helvetica", "bold");
                doc.text("Prepared by:", leftX, preparedY);

                const nameY = preparedY + 5;
                doc.setFont("helvetica", "normal");
                doc.text(preparedByUpper, leftX, nameY);

                // Underline the name
                const nameWidth = doc.getTextWidth(preparedByUpper);
                doc.line(leftX, nameY + 1, leftX + nameWidth, nameY + 1);

                // === Role (directly below underline) ===
                const roleY = nameY + 6;
                doc.text(role, leftX, roleY);

                // === System note under the role (centered) ===
                const systemNoteY = roleY;
                doc.text(
                    `This is a system generated report.    |    ${generatedDate}`,
                    pageWidth / 2,
                    systemNoteY,
                    { align: "left" }
                );
            },

        });

        // Save PDF
        doc.save(`${title}.pdf`);
    };

    return (
        <Button
            onClick={generatePDF}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-600 text-white shadow-md rounded-lg px-4 py-2 cursor-pointer transition-all"
        >
            <FileText className="w-5 h-5" />
            Export PDF
            {/* Export {title} PDF */}
        </Button>
    );
}
