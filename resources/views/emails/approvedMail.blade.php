<!DOCTYPE html>
<html>

<head>
    <title>Tagum City Government Employees' Union (TACGEU) - Alert</title>
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
        <h2>Welcome to Our Tagum City Government Employees' Union (TACGEU) - Membership Portal</h2>

        <p>Dear {{ $fullName }},</p>

        <p>We would like to inform you that your membership application has been <strong>reviewed and
                {{ strtolower($status) }}</strong> by our Committee.</p>

        <p>Your application has moved forward in the approval process. Please await further instructions or updates
            regarding the next steps.</p>

        <p>We appreciate your interest in joining the Tagum City Government Employees' Union (TACGEU).</p>

        <p>If you have any questions or need assistance, feel free to contact our support team.</p>

        <p>Best regards,<br>
            <strong>Membership Committee</strong>
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