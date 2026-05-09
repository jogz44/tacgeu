<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Contributions;
use App\Models\Expenses;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class FinancialReportController extends Controller
{
    public function index(Request $request)
    {
        $start = $request->input('start_date') ?? Carbon::today()->format('Y-m-d');
        $end = $request->input('end_date') ?? Carbon::today()->format('Y-m-d');

        // Collections
        $collections = Payment::with([
            'user' => function ($q) {
                $q->select(
                    'id',
                    DB::raw("CONCAT(
                    given_name,
                    IF(middle_name IS NOT NULL AND middle_name != '', CONCAT(' ', middle_name), ''),
                    ' ', last_name,
                    IF(suffix IS NOT NULL AND suffix != '', CONCAT(' ', suffix), '')
                ) as fullname")
                );
            },
            'collection:id,name'
        ])
            ->when($start && $end, function ($q) use ($start, $end) {
                $q->whereDate('created_at', '>=', $start)
                    ->whereDate('created_at', '<=', $end);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        // Contributions
        $contributions = Contributions::with([
            'user' => function ($q) {
                $q->select(
                    'id',
                    DB::raw("CONCAT(
                    given_name, 
                    IF(middle_name IS NOT NULL AND middle_name != '', CONCAT(' ', middle_name), ''), 
                    ' ', last_name,
                    IF(suffix IS NOT NULL AND suffix != '', CONCAT(' ', suffix), '')
                ) as fullname")
                );
            }
        ])
            ->select(
                'id',
                'user_id',
                'amount',
                DB::raw("DATE_FORMAT(created_at, '%M') as month"), // Month name
                DB::raw('YEAR(created_at) as year'),
                'created_at'
            )
            ->when($start && $end, function ($q) use ($start, $end) {
                $q->whereDate('created_at', '>=', $start)
                    ->whereDate('created_at', '<=', $end);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        // Expenses
        $expenses = Expenses::when($start && $end, function ($q) use ($start, $end) {
            $q->whereDate('spent_at', '>=', $start)
                ->whereDate('spent_at', '<=', $end);
        })->get();

        $collectionsTotal = $collections->sum('amount');
        $contributionsTotal = $contributions->sum('amount');
        $expensesTotal = $expenses->sum('amount');

        $totals = [
            'collections' => $collectionsTotal,
            'contributions' => $contributionsTotal,
            'expenses' => $expensesTotal,
            'net' => $collectionsTotal + $contributionsTotal - $expensesTotal,
        ];

        return Inertia::render('report/FinancialSummary', [
            'details' => [
                'collections' => $collections,
                'contributions' => $contributions,
                'expenses' => $expenses,
            ],
            'totals' => $totals,
            'start_date' => $start,
            'end_date' => $end,
        ]);
    }


    private function groupByExpression($type, $column = 'created_at')
    {
        return match ($type) {
            'yearly' => "YEAR($column) as label",
            'monthly' => "DATE_FORMAT($column, '%Y-%m') as label",
            default => "DATE_FORMAT($column, '%Y-%m-%d') as label",
        };
    }
}
