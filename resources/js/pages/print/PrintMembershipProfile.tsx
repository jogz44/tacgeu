import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import html2pdf from 'html2pdf.js';
import { useRef } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Membership Application Form',
        href: '#',
    },
];

interface Profile {
    given_name: string;
    middle_name: string;
    last_name: string;
    suffix: string;
    position?: string;
    salary_grade?: string;
    office?: string;
    employment_status: string;
    contact_number: string;
    email: string;
}

export default function PrintMembershipProfile({ profile, president, committee }: { profile: Profile; president: Profile; committee: Profile }) {
    const printableAreaRef = useRef<HTMLDivElement>(null);

    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const generatePDF = () => {
        if (printableAreaRef.current) {
            const options = {
                margin: [10, 10, 10, 10],
                filename: 'membership-application.pdf',
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            };

            // Use html2pdf to generate the PDF
            html2pdf().from(printableAreaRef.current).set(options).save();
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Membership Application Form" />
            <div>
                {/* Action Buttons */}
                <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', margin: '20px' }}>
                    <Button className="bg-green-600 text-white hover:bg-green-800" onClick={() => window.print()}>
                        Print
                    </Button>
                </div>
                <style>
                    {`
                       @media print {
                        body * {
                            visibility: hidden;
                        }

                        #printable-area,
                        #printable-area * {
                            visibility: visible;
                        }

                        #printable-area {
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                        }

                        .print-header {
                            margin-top: 0 !important;
                            padding-top: 0 !important;
                            text-align: center;
                        }

                        .page-break {
                            page-break-before: always;
                        }

                        ul, ol {
                            page-break-inside: avoid;
                        }

                        table {
                            page-break-inside: auto;
                        }

                        @page {
                            margin: 15mm 10mm;
                        }
                        .no-print {
                            display: none !important;
                        }
                    }
                        `}
                </style>

                <div id="printable-area">
                    {/* PAGE 1 */}
                    <div>
                        <div
                            className="print-header"
                            style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '30px' }}
                        >
                            <img src={`${window.APP_BASE_URL}assets/icon/app-logo.svg`} alt="TACGEU Logo" style={{ width: '80px', height: 'auto', margin: '0 auto' }} />
                            <h1 style={{ fontSize: '1.2rem', margin: '0' }}>Tagum City Government Employees Union (TACGEU)</h1>
                            <p style={{ fontSize: '0.7rem', margin: '4px 0' }}>
                                Tagum City Hall, J.V. Ayala Avenue, Brgy. Apokon, Tagum City, Davao del Norte
                            </p>
                        </div>

                        {/* content */}
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody className="page-content">
                                <tr>
                                    <td>
                                        <div className="print-content">
                                            {/* Title */}
                                            <h2 style={{ textAlign: 'center', fontSize: '1rem', marginBottom: '10px' }}>
                                                Membership Application Letter
                                            </h2>
                                            <p style={{ marginBottom: '20px' }}>
                                                <strong>Date:</strong> {today}
                                            </p>

                                            {/* Addressed to */}
                                            <section style={{ marginBottom: '20px' }}>
                                                <p>
                                                    <strong style={{ textDecoration: 'underline' }}>
                                                        {[
                                                            president.given_name,
                                                            president.middle_name || null,
                                                            president.last_name,
                                                            president.suffix || null,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(' ')
                                                            .toUpperCase()}
                                                    </strong>
                                                    <br />
                                                    The President
                                                    <br />
                                                    Tagum City Government Employees Union (TACGEU)
                                                    <br />
                                                    Tagum City Hall
                                                    <br />
                                                    J.V. Ayala Avenue, Brgy. Apokon,
                                                    <br />
                                                    Tagum City, Davao del Norte
                                                </p>
                                            </section>

                                            {/* Subject and Body */}
                                            <section style={{ textAlign: 'justify', marginBottom: '20px' }}>
                                                <p>
                                                    <strong>Subject:</strong> Application for Membership
                                                </p>
                                                <br />
                                                <p>Dear Sir/Madam,</p>
                                                <p>
                                                    I,{' '}
                                                    <strong>
                                                        {[profile.given_name, profile.middle_name || null, profile.last_name, profile.suffix || null]
                                                            .filter(Boolean)
                                                            .join(' ')}
                                                    </strong>
                                                    , a rank-and-file employee of the City Government of Tagum, hereby submit my application for
                                                    membership in the Tagum City Government Employees Union (TACGEU). This application is submitted in
                                                    accordance with the provisions of Article IV, Section 2 of the TACGEU By-laws, which requires the
                                                    approval of the Union President upon the recommendation of the Committee on Membership and the
                                                    payment of the required membership fee.
                                                </p>
                                            </section>

                                            {/* Profile Info */}
                                            <section style={{ marginBottom: '20px' }}>
                                                <p>The following details are submitted for your consideration:</p>
                                                <ol style={{ paddingLeft: '20px' }}>
                                                    <li>
                                                        <strong>Name:</strong>{' '}
                                                        {[profile.given_name, profile.middle_name || null, profile.last_name, profile.suffix || null]
                                                            .filter(Boolean)
                                                            .join(' ')}
                                                    </li>
                                                    <li>
                                                        <strong>Position:</strong> {profile.position || 'N/A'}
                                                    </li>
                                                    <li>
                                                        <strong>Salary Grade:</strong> {profile.salary_grade || 'N/A'}
                                                    </li>
                                                    <li>
                                                        <strong>Office/Department:</strong> {profile.office || 'N/A'}
                                                    </li>
                                                    <li>
                                                        <strong>Employment Status:</strong> {profile.employment_status}
                                                    </li>
                                                    <li>
                                                        <strong>Contact Information:</strong>
                                                        <ul style={{ marginLeft: '20px', listStyle: 'disc' }}>
                                                            <li>Mobile Number: {profile.contact_number}</li>
                                                            <li>Email Address: {profile.email}</li>
                                                        </ul>
                                                    </li>
                                                </ol>
                                            </section>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* PAGE BREAK */}
                    <div className="page-break" />

                    {/* PAGE 2 */}
                    <div>
                        <div>
                            <div
                                className="print-header"
                                style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '30px' }}
                            >
                                <img src={`${window.APP_BASE_URL}assets/icon/app-logo.svg`} alt="TACGEU Logo" style={{ width: '80px', height: 'auto', margin: '0 auto' }} />
                                <h1 style={{ fontSize: '1.2rem', margin: '0' }}>Tagum City Government Employees Union (TACGEU)</h1>
                                <p style={{ fontSize: '0.7rem', margin: '4px 0' }}>
                                    Tagum City Hall, J.V. Ayala Avenue, Brgy. Apokon, Tagum City, Davao del Norte
                                </p>
                            </div>

                            {/* content */}
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody className="page-content">
                                    <tr>
                                        <td>
                                            <div className="print-content">
                                                {/* Affirmation */}
                                                <section style={{ marginBottom: '20px' }}>
                                                    <p>I affirm that I meet the qualifications outlined in the By-laws, specifically:</p>
                                                    <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                                                        <li>I am a rank-and-file employee.</li>
                                                        <li>I am not disqualified by law or involved in any subversive activities.</li>
                                                        <li>I have not been convicted of any crime involving moral turpitude.</li>
                                                        <li>I am committed to paying the membership fee of ₱300.00 and the monthly union dues.</li>
                                                    </ul>
                                                </section>

                                                {/* Declarations */}
                                                <section style={{ textAlign: 'justify', marginBottom: '20px' }}>
                                                    <p>
                                                        I further declare that I have read and understood the responsibilities of being a union member
                                                        and agree to abide by the rules and principles set by the union.
                                                    </p>
                                                    <p>
                                                        Should my membership be approved, I pledge to uphold the Union's objectives and actively
                                                        participate in its initiatives and undertakings.
                                                    </p>
                                                    <p>Thank you for considering my application.</p>
                                                </section>

                                                {/* Signature */}
                                                <section style={{ marginTop: '40px' }}>
                                                    <p>Respectfully yours,</p>
                                                    <br />
                                                    <p style={{ textDecoration: 'underline', fontWeight: 'bold' }}>
                                                        {[profile.given_name, profile.middle_name || null, profile.last_name, profile.suffix || null]
                                                            .filter(Boolean)
                                                            .join(' ')}
                                                    </p>
                                                    <p>Signature Over Printed Name</p>
                                                    <p>{today}</p>
                                                </section>

                                                <hr style={{ margin: '40px 0' }} />

                                                {/* Approval Section */}
                                                <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>For TACGEU Use Only</h3>

                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        flexWrap: 'wrap',
                                                        justifyContent: 'space-between',
                                                        marginBottom: '30px',
                                                        gap: '2%',
                                                    }}
                                                >
                                                    {/* Recommendation */}
                                                    <div style={{ flex: '1 1 48%' }}>
                                                        <strong>Recommendation of the Committee on Membership:</strong>
                                                        <br />
                                                        ☐ Recommended ☐ Not Recommended
                                                        <br />
                                                        <br />
                                                        <strong>Remarks:</strong>
                                                        <div style={{ borderBottom: '1px solid #000', height: '20px', marginBottom: '20px' }}></div>
                                                        <table style={{ width: '100%' }}>
                                                            <tbody>
                                                                <tr>
                                                                    <td style={{ width: '30%', verticalAlign: 'bottom' }}>
                                                                        <strong>Name:</strong>
                                                                    </td>
                                                                    <td>
                                                                        <div
                                                                            style={{
                                                                                borderBottom: '1px solid #000',
                                                                                width: '100%',
                                                                                maxWidth: '250px',
                                                                                fontWeight: 'bold',
                                                                            }}
                                                                        >
                                                                            {[
                                                                                `${committee.given_name}`,
                                                                                committee.middle_name,
                                                                                committee.last_name || null,
                                                                                committee.suffix || null,
                                                                            ]
                                                                                .filter(Boolean)
                                                                                .join(' ')
                                                                                .toUpperCase()}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td style={{ verticalAlign: 'bottom' }}>
                                                                        <strong>Signature:</strong>
                                                                    </td>
                                                                    <td>
                                                                        <div
                                                                            style={{
                                                                                borderBottom: '1px solid #000',
                                                                                width: '100%',
                                                                                maxWidth: '250px',
                                                                            }}
                                                                        >
                                                                            &nbsp;
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td style={{ verticalAlign: 'bottom' }}>
                                                                        <strong>Date:</strong>
                                                                    </td>
                                                                    <td>
                                                                        <div
                                                                            style={{
                                                                                borderBottom: '1px solid #000',
                                                                                width: '100%',
                                                                                maxWidth: '250px',
                                                                            }}
                                                                        >
                                                                            &nbsp;
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                    {/* Approval by President */}
                                                    <div style={{ flex: '1 1 48%' }}>
                                                        <strong>Approved by the President:</strong>
                                                        <br />
                                                        <br />
                                                        ☐ Approved ☐ Disapproved
                                                        <br />
                                                        <br />
                                                        <strong>Remarks:</strong>
                                                        <div style={{ borderBottom: '1px solid #000', height: '20px', marginBottom: '20px' }}></div>
                                                        <table style={{ width: '100%' }}>
                                                            <tbody>
                                                                <tr>
                                                                    <td style={{ width: '30%', verticalAlign: 'bottom' }}>
                                                                        <strong>Name:</strong>
                                                                    </td>
                                                                    <td>
                                                                        <div
                                                                            style={{
                                                                                borderBottom: '1px solid #000',
                                                                                width: '100%',
                                                                                maxWidth: '250px',
                                                                                fontWeight: 'bold',
                                                                            }}
                                                                        >
                                                                            {[
                                                                                `${president.given_name}`,
                                                                                president.middle_name,
                                                                                president.last_name || null,
                                                                                president.suffix || null,
                                                                            ]
                                                                                .filter(Boolean)
                                                                                .join(' ')
                                                                                .toUpperCase()}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td style={{ verticalAlign: 'bottom' }}>
                                                                        <strong>Signature:</strong>
                                                                    </td>
                                                                    <td>
                                                                        <div
                                                                            style={{
                                                                                borderBottom: '1px solid #000',
                                                                                width: '100%',
                                                                                maxWidth: '250px',
                                                                            }}
                                                                        >
                                                                            &nbsp;
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td style={{ verticalAlign: 'bottom' }}>
                                                                        <strong>Date:</strong>
                                                                    </td>
                                                                    <td>
                                                                        <div
                                                                            style={{
                                                                                borderBottom: '1px solid #000',
                                                                                width: '100%',
                                                                                maxWidth: '250px',
                                                                            }}
                                                                        >
                                                                            &nbsp;
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
