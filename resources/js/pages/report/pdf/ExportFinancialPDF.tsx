import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface ExportFinancialPDFProps {
    data: (string | number | null)[][];
    title: string;
    subTitle: string;
    colHeaders: string[];
    preparedBy: string;
    startDate?: string | Date;
    endDate?: string | Date;
    role: string;
}

export default function ExportFinancialPDF({
    data,
    title,
    subTitle,
    colHeaders,
    preparedBy,
    startDate,
    endDate,
    role,
}: ExportFinancialPDFProps) {
    const today = new Date();
    const generatedDate = today.toLocaleString("en-US", {
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

        // === Logo ===
        const img = new Image();
        img.src = `${window.APP_BASE_URL}assets/images/logo.png`;
        await new Promise((resolve, reject) => {
            img.onload = () => resolve(true);
            img.onerror = () => reject();
        });
        doc.addImage(img, "PNG", 15, 10, 25, 25);

        // === Header ===
        const pageWidth = doc.internal.pageSize.getWidth();
        let currentY = 20;

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
        doc.text(title, pageWidth / 2, currentY, { align: "center" });
        currentY += 7;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text(subTitle, pageWidth / 2, currentY, { align: "center" });
        currentY += 0;

        // Date Range
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(
            `${dateText}`,
            pageWidth / 2,
            currentY,
            { align: "center" }
        );
        currentY += 10

        // === Compute Subtotal ===
        let subtotal = 0;
        data.forEach((row) => {
            const lastCell = row[row.length - 1];
            const num = parseFloat(String(lastCell).replace(/[^\d.-]/g, ""));
            if (!isNaN(num)) subtotal += num;
        });

        // ✅ Construct table body safely (typed as RowInput[])
        const tableBody: RowInput[] = [
            ...data,
            [
                {
                    content: "Subtotal",
                    colSpan: colHeaders.length - 1,
                    styles: {
                        halign: "right",
                        fontStyle: "bold" as const,
                        fillColor: [245, 245, 245],
                    },
                },
                {
                    content: `P ${subtotal.toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}`,
                    styles: {
                        halign: "right",
                        fontStyle: "bold" as const,
                        textColor: [0, 0, 0],
                        fillColor: [245, 245, 245],
                    },
                },
            ],
        ];

        // === Render Table ===
        autoTable(doc, {
            head: [colHeaders],
            body: tableBody,
            startY: currentY,
            styles: { fontSize: 10, halign: "left", valign: "middle" },
            headStyles: {
                halign: "left",
                fillColor: [245, 245, 245], // ❌ No background (white)
                textColor: [0, 0, 0],       // ✅ Black text
                fontStyle: "bold" as const, // optional - keeps header bold
                lineWidth: 0.1,
            },
            margin: {
                left: 15,
                right: 15,
                bottom: 25,
            },
            theme: "grid",

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

        doc.save(`${title}.pdf`);
    };

    return (
        <Button
            onClick={generatePDF}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-600 text-white shadow-md rounded-lg px-4 py-2 cursor-pointer transition-all"
        >
            <FileText className="w-5 h-5" />
            Export {title} PDF
        </Button>
    );
}
