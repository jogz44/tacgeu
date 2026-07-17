import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface ExportFinancialSummaryPDFProps {
    collections: any[];
    contributions: any[];
    expenses: any[];
    totals: {
        collections: number;
        contributions: number;
        expenses: number;
        net: number;
    };
    preparedBy: string;
    startDate?: string | Date;
    endDate?: string | Date;
    role: string;
}

export default function ExportFinancialSummaryPDF({
    collections,
    contributions,
    expenses,
    totals,
    preparedBy,
    startDate,
    endDate,
    role,
}: ExportFinancialSummaryPDFProps) {
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
            img.onerror = () => reject();
        });
        doc.addImage(img, "PNG", 15, 10, 25, 25);

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
        doc.text("Financial Summary Report", pageWidth / 2, currentY, {
            align: "center",
        });
        currentY += 5;

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

        // === Summary Overview ===
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Summary Overview", 15, currentY);
        currentY += 5;

        autoTable(doc, {
            startY: currentY,
            body: [
                ["Total Collections", `P ${totals.collections.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`],
                ["Total Contributions", `P ${totals.contributions.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`],
                ["Total Expenses", `P ${totals.expenses.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`],
                ["Net Income", `P ${totals.net.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`],
            ],
            styles: { fontSize: 10, cellPadding: 3 },
            theme: "grid",
            headStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0] },
            columnStyles: {
                0: { fontStyle: "bold" },
                1: { halign: "right" },
            },
        });

        currentY = (doc as any).lastAutoTable.finalY + 10;

        // === Collections Table ===
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Collections", 15, currentY);
        currentY += 5;

        // === Collections Summary ===
        const collectionsSummary = Object.values(
            collections.reduce((acc: any, item: any) => {
                const name = item.collection?.name ?? "—";
                const amount = Number(item.amount) || 0;
                if (!acc[name]) acc[name] = { name, total: 0 };
                acc[name].total += amount;
                return acc;
            }, {})
        );

        autoTable(doc, {
            startY: currentY,
            head: [["Collection", "Total Amount"]],
            body: collectionsSummary.map((c: any) => [
                c.name,
                `P ${c.total.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}`,
            ]),
            margin: {
                left: 15,
                right: 15,
                bottom: 25,
            },
            theme: "grid",
            styles: { fontSize: 9 },
            headStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0] },
            foot: [
                [
                    { content: "Subtotal", styles: { halign: "right", fontStyle: "bold" } },
                    {
                        content: `P ${totals.collections.toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                        })}`,
                        styles: { halign: "right", fontStyle: "bold" },
                    },
                ],
            ],
        });

        currentY = (doc as any).lastAutoTable.finalY + 10;

        // === Contributions Table ===
        doc.text("Contributions", 15, currentY);
        currentY += 5;

        // Group contributions by Month + Year
        const contributionsSummary = Object.values(
            contributions.reduce((acc: any, item: any) => {
                const key = `${item.month}-${item.year}`;
                const month = item.month;
                const year = item.year;
                const amount = Number(item.amount) || 0;

                if (!acc[key]) acc[key] = { month, year, total: 0 };
                acc[key].total += amount;
                return acc;
            }, {})
        );

        autoTable(doc, {
            startY: currentY,
            head: [["Month", "Year", "Total Amount"]],
            body: contributionsSummary.map((item: any) => [
                item.month,
                item.year,
                `P ${item.total.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}`,
            ]),
            theme: "grid",
            styles: { fontSize: 9 },
            headStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0] },
            foot: [
                [
                    { content: "Subtotal", colSpan: 2, styles: { halign: "right", fontStyle: "bold" } },
                    {
                        content: `P ${totals.contributions.toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                        })}`,
                        styles: { halign: "right", fontStyle: "bold" },
                    },
                ],
            ],
        });


        currentY = (doc as any).lastAutoTable.finalY + 10;

        // === Expenses Table ===
        doc.text("Expenses", 15, currentY);
        currentY += 5;

        // Group expenses by date
        const expensesSummary = Object.values(
            expenses.reduce((acc: any, item: any) => {
                const date = item.created_at; // Keep original date string
                const amount = Number(item.amount) || 0;

                if (!acc[date]) acc[date] = { date, total: 0 };
                acc[date].total += amount;

                return acc;
            }, {})
        );

        autoTable(doc, {
            startY: currentY,
            head: [["Date", "Total Amount"]],
            body: expensesSummary.map((item: any) => [
                format(new Date(item.date), "MMMM dd, yyyy"),
                `P ${item.total.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}`,
            ]),
            theme: "grid",
            styles: { fontSize: 9 },
            headStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0] },
            foot: [
                [
                    { content: "Subtotal", colSpan: 1, styles: { halign: "right", fontStyle: "bold" } },
                    {
                        content: `P ${totals.expenses.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`,
                        styles: { halign: "right", fontStyle: "bold" },
                    },
                ],
            ],
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


        doc.save("Financial_Summary_Report.pdf");
    };

    return (
        <Button
            onClick={generatePDF}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-600 text-white shadow-md rounded-lg px-4 py-2 cursor-pointer transition-all"
        >
            <FileText className="w-5 h-5" />
            Export Summary Report PDF
        </Button>
    );
}
