<!DOCTYPE html>
<html>

<head>
    <title>Payment Information</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f9f9f9;
            padding: 20px;
        }

        .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 6px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            margin: auto;
        }

        h2 {
            color: #004085;
        }

        .credentials {
            background-color: #f1f1f1;
            padding: 15px;
            border-radius: 4px;
        }

        .footer {
            margin-top: 30px;
            font-size: 0.9em;
            color: #777;
            text-align: center;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }

        .footer img {
            max-height: 50px;
            margin-bottom: 10px;
        }
    </style>
</head>

<body>
    <div class="container">
        <h2>Payment Confirmation – TACGEU Monthly Contribution</h2>

        <p>Dear {{ $fullName }},</p>

        <p>Thank you for your continued support. We are pleased to inform you that your monthly contribution has been
            successfully received.</p>

        <p>Here are your payment information:</p>

        <div class="credentials">
            <table style="width: 100%; margin-top: 10px;">
                <tr>
                    <td style="padding: 8px; font-weight: bold;">Month:</td>
                    <td style="padding: 8px;">
                        {{ \DateTime::createFromFormat('!m', $details['month'])->format('F') }}
                    </td>
                </tr>
                <tr>
                    <td style="padding: 8px; font-weight: bold;">Year:</td>
                    <td style="padding: 8px;">{{ $details['year'] }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; font-weight: bold;">Amount:</td>
                    <td style="padding: 8px; color: red;">
                        ₱ {{ number_format($details['amount'], 2, '.', ',') }}
                    </td>
                </tr>
            </table>
        </div>
        <p>If you have any questions or need further assistance, feel free to reach out to our support team.</p>
        <p>Best regards,<br>
            <strong>Treasurer</strong>
        </p>

        <div class="footer">
            <img src="{{ asset('assets/icon/app-logo.svg') }}" alt="TACGEU Logo">
            <!-- Replace with your actual logo URL -->
            <p><strong>Tagum City Government Employees' Union (TACGEU)</strong></p>
            <p>This is an automated message. Please do not reply directly to this email.</p>
        </div>
    </div>
</body>

</html>