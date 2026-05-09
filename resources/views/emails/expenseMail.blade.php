<!DOCTYPE html>
<html>

<head>
    <title>Tagum City Government Employees' Union (TACGEU) - Union Expenses</title>
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

        .amount {
            color: #fb3131;
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
        <h2>Welcome to Our Tagum City Government Employees' Union (TACGEU) - Members Portal</h2>
        <p>Dear
            @if($expense->status === 'Pending' || $expense->status === 'Canceled')
                {{ $presidentName }}
            @elseif($expense->status === 'Rejected' || $expense->status === 'Approved')
                {{ $expense->user->given_name }} {{ $expense->user->middle_name }} {{ $expense->user->last_name }}
            @else
                Member
            @endif
        </p>
        <div class="credentials">
            <table style="width: 100%; margin-top: 10px;">
                <tbody>
                    <tr>
                        <td style="padding: 8px; font-weight: bold;">Purpose:</td>
                        <td style="padding: 8px;">{{ $expense->name }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; font-weight: bold;">Description:</td>
                        <td style="padding: 8px;">{{ $expense->description }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; font-weight: bold;">Amount:</td>
                        <td style="padding: 8px;">
                            <span class="amount">₱ {{ number_format($expense->amount, 2) }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; font-weight: bold;">Created Date:</td>
                        <td style="padding: 8px;">
                            {{ \Carbon\Carbon::parse($expense->created_at)->format('M d, Y') }}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; font-weight: bold;">Transaction Date:</td>
                        <td style="padding: 8px;">
                            {{ \Carbon\Carbon::parse($expense->spent_at)->format('M d, Y') }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <!-- Status Explanation -->
        <p><strong>Status:</strong>
            @if($expense->status === 'Pending')
                This expense is currently <strong>Pending</strong> approval by the President.
            @elseif($expense->status === 'Canceled')
                This expense has been <strong>Canceled</strong> by the creator.
            @elseif($expense->status === 'Rejected')
                This expense has been <strong>Rejected</strong> by the President.
            @elseif($expense->status === 'Approved')
                This expense has been <strong>Approved</strong> by the President.
            @else
                {{ $expense->status }}
            @endif
        </p>

        <p>Best regards,<br>
            @if($expense->status === 'Pending' || $expense->status === 'Canceled')
                {{ $expense->user->given_name }} {{ $expense->user->middle_name }} {{ $expense->user->last_name }}
            @elseif($expense->status === 'Rejected' || $expense->status === 'Approved')
                {{ $presidentName }}
            @else
                Member
            @endif
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