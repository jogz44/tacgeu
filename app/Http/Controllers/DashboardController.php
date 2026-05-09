<?php

namespace App\Http\Controllers;

use App\Models\Collection;
use App\Models\Contributions;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Payment;
use App\Models\Expenses;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        $tz = 'Asia/Manila';
        $offset = '+08:00';

        if ($user->role === 'Visitor') {
            if ($user->is_first_log) {
                return Inertia::location(route('password.edit'));
            }

            return redirect()->route('notice');
        }

        if ($user->role === 'Member' || $user->role === 'Election Committee' || $user->role === 'Public Information Officer') {

            if ($user->status === 'Resigned') {
                return Inertia::location(route('profile.edit'));
            }
            return redirect()->route('announcement', ['type' => 'Announcements']);
        }

        if ($user->role === 'Human Resource Officer') {
            return redirect()->route('members');
        }

        $viewType = $request->input('viewType', 'daily');
        $selectedDate = $request->input('selectedDate', now()->toDateString());

        $collectionData = [];
        $expenseData = [];
        $contributionData = [];
        $totalCollection = 0;
        $totalExpenses = 0;
        $totalContributions = 0;

        $activeMembers = User::where('membership_status', 'Active')
            ->where('affiliation', 'Member')
            ->count();

        $inactiveMembers = User::where('membership_status', 'Inactive')
            ->where('affiliation', 'Member')
            ->count();

        //Get Recent Contribution
        $recentContributions = Contributions::with([
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
            ->select('id', 'user_id', 'amount', 'created_at')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        //Get Collections
        $recentCollections = Payment::with([
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
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        //get Expenses
        $recentExpenses = Expenses::orderBy('spent_at', 'desc')
            ->take(10)
            ->get();

        if ($viewType === 'daily') {
            try {
                $selectedDate = $selectedDate ?: Carbon::now()->toDateString();
                $selected = Carbon::parse($selectedDate);
                $startOfWeek = $selected->copy()->startOfWeek();
                $endOfWeek = $selected->copy()->endOfWeek();
                $previousStartOfWeek = $startOfWeek->copy()->subWeek();
                $previousEndOfWeek = $endOfWeek->copy()->subWeek();

                $previousActive = User::where('membership_status', 'Active')
                    ->whereBetween('created_at', [$previousStartOfWeek, $previousEndOfWeek])
                    ->count();

                $previousInactive = User::where('membership_status', 'Inactive')
                    ->whereBetween('created_at', [$previousStartOfWeek, $previousEndOfWeek])
                    ->count();

                $trendActiveMembers = $this->calcTrend($activeMembers, $previousActive);
                $trendInactiveMembers = $this->calcTrend($inactiveMembers, $previousInactive);

                // Prepare base days with day name (label)
                $baseDays = collect();
                for ($date = $startOfWeek->copy(); $date <= $endOfWeek; $date->addDay()) {
                    $baseDays->push([
                        'day' => $date->format('Y-m-d'),
                        'label' => $date->format('l'),
                        'amount' => 0,
                    ]);
                }

                // Get actual data
                $rawCollections = Payment::select(DB::raw('DATE(created_at) as day'), DB::raw('SUM(amount) as amount'))
                    ->whereBetween('created_at', [$startOfWeek, $endOfWeek])
                    ->groupBy('day')
                    ->get()
                    ->keyBy('day');

                $rawExpenses = Expenses::select(DB::raw('DATE(spent_at) as day'), DB::raw('SUM(amount) as amount'))
                    ->whereBetween('spent_at', [$startOfWeek, $endOfWeek])
                    ->where('status', 'Approved')
                    ->groupBy('day')
                    ->get()
                    ->keyBy('day');

                $rawContributions = Contributions::select(DB::raw('DATE(created_at) as day'), DB::raw('SUM(amount) as amount'))
                    ->whereBetween('created_at', [$startOfWeek, $endOfWeek])
                    ->groupBy('day')
                    ->get()
                    ->keyBy('day');

                // Map with collection amounts
                $collectionData = $baseDays->map(function ($item) use ($rawCollections) {
                    $date = Carbon::parse($item['day']);
                    return [
                        'day' => $date->format('M d, Y') . "\n(" . $date->format('D') . ")",
                        'amount' => isset($rawCollections[$item['day']]) ? (float) $rawCollections[$item['day']]->amount : 0,
                    ];
                });

                // Map with expense amounts
                $expenseData = $baseDays->map(function ($item) use ($rawExpenses) {
                    $date = Carbon::parse($item['day']);
                    return [
                        'day' => $date->format('M d, Y') . "\n(" . $date->format('D') . ")",
                        'amount' => isset($rawExpenses[$item['day']]) ? (float) $rawExpenses[$item['day']]->amount : 0,
                    ];
                });

                $contributionData = $baseDays->map(function ($item) use ($rawContributions) {
                    $date = Carbon::parse($item['day']);
                    return [
                        'day' => $date->format('M d, Y') . "\n(" . $date->format('D') . ")",
                        'amount' => isset($rawContributions[$item['day']]) ? (float) $rawContributions[$item['day']]->amount : 0,
                    ];
                });

                //Prepare totals
                $rawPrevCollections = Payment::select(DB::raw('DATE(created_at) as day'), DB::raw('SUM(amount) as amount'))
                    ->whereBetween('created_at', [$previousStartOfWeek, $previousEndOfWeek])
                    ->groupBy('day')
                    ->get()
                    ->keyBy('day');

                $rawPrevExpenses = Expenses::select(DB::raw('DATE(spent_at) as day'), DB::raw('SUM(amount) as amount'))
                    ->whereBetween('spent_at', [$previousStartOfWeek, $previousEndOfWeek])
                    ->where('status', 'Approved')
                    ->groupBy('day')
                    ->get()
                    ->keyBy('day');

                $rawPrevContributions = Contributions::select(DB::raw('DATE(created_at) as day'), DB::raw('SUM(amount) as amount'))
                    ->whereBetween('created_at', [$previousStartOfWeek, $previousEndOfWeek])
                    ->groupBy('day')
                    ->get()
                    ->keyBy('day');

                // === Map previous week (use $previousBaseDays if needed) ===
                $prevBaseDays = collect();

                for ($date = $previousStartOfWeek->copy(); $date <= $previousEndOfWeek; $date->addDay()) {
                    $prevBaseDays->push([
                        'day' => $date->format('Y-m-d'),
                        'label' => $date->format('l'),
                        'amount' => 0,
                    ]);
                }

                $prevCollectionData = $prevBaseDays->map(function ($item) use ($rawPrevCollections) {
                    $date = Carbon::parse($item['day']);
                    return [
                        'day' => $date->format('M d, Y') . "\n(" . $date->format('D') . ")",
                        'amount' => isset($rawPrevCollections[$item['day']]) ? (float) $rawPrevCollections[$item['day']]->amount : 0,
                    ];
                });

                $prevExpenseData = $prevBaseDays->map(function ($item) use ($rawPrevExpenses) {
                    $date = Carbon::parse($item['day']);
                    return [
                        'day' => $date->format('M d, Y') . "\n(" . $date->format('D') . ")",
                        'amount' => isset($rawPrevExpenses[$item['day']]) ? (float) $rawPrevExpenses[$item['day']]->amount : 0,
                    ];
                });

                $prevContributionData = $prevBaseDays->map(function ($item) use ($rawPrevContributions) {
                    $date = Carbon::parse($item['day']);
                    return [
                        'day' => $date->format('M d, Y') . "\n(" . $date->format('D') . ")",
                        'amount' => isset($rawPrevContributions[$item['day']]) ? (float) $rawPrevContributions[$item['day']]->amount : 0,
                    ];
                });

                $totalCollection = $collectionData->sum('amount');
                $totalExpenses = $expenseData->sum('amount');
                $totalContributions = $contributionData->sum('amount');

                $prevTotalCollection = $prevCollectionData->sum('amount');
                $prevTotalExpenses = $prevExpenseData->sum('amount');
                $prevTotalContributions = $prevContributionData->sum('amount');

                $trendTotalContributions = $this->calcTrend($totalContributions, $prevTotalContributions);
                $trendTotalCollection = $this->calcTrend($totalCollection, $prevTotalCollection);
                $trendTotalExpenses = $this->calcTrend($totalExpenses, $prevTotalExpenses);

            } catch (Exception $e) {
                // Log error to Laravel's log file
                Log::error('Weekly report error: ' . $e->getMessage(), [
                    'trace' => $e->getTraceAsString()
                ]);

                // Output directly to terminal
                dump('Weekly report error: ' . $e->getMessage());
                dump($e->getTraceAsString());
            }


        } elseif ($viewType === 'monthly') {

            try {
                $selectedDate = $selectedDate ?: Carbon::now()->format('Y-m');
                $selected = Carbon::createFromFormat('Y-m', $selectedDate)->startOfMonth();
                $year = $selected->year;
                $month = $selected->month;

                // Previous month
                $previous = $selected->copy()->subMonth();
                $prevYear = $previous->year;
                $prevMonth = $previous->month;

                $monthNames = [
                    1 => 'Jan',
                    2 => 'Feb',
                    3 => 'Mar',
                    4 => 'Apr',
                    5 => 'May',
                    6 => 'Jun',
                    7 => 'Jul',
                    8 => 'Aug',
                    9 => 'Sep',
                    10 => 'Oct',
                    11 => 'Nov',
                    12 => 'Dec'
                ];

                // Base array (all months 1-12)
                $baseMonths = collect(range(1, 12))->map(function ($month) use ($monthNames) {
                    return [
                        'month' => $monthNames[$month],
                        'amount' => 0,
                    ];
                });

                // Collections
                $rawCollections = Payment::select(DB::raw('MONTH(created_at) as month'), DB::raw('SUM(amount) as amount'))
                    ->whereYear('created_at', $year)
                    ->groupBy('month')
                    ->get()
                    ->keyBy('month');

                $collectionData = $baseMonths->map(function ($item, $index) use ($rawCollections) {
                    $monthNum = $index + 1;
                    return [
                        'month' => $item['month'],
                        'amount' => isset($rawCollections[$monthNum]) ? (float) $rawCollections[$monthNum]->amount : 0,
                    ];
                });

                // Expenses
                $rawExpenses = Expenses::select(DB::raw('MONTH(spent_at) as month'), DB::raw('SUM(amount) as amount'))
                    ->whereYear('spent_at', $year)
                    ->where('status', 'Approved')
                    ->groupBy('month')
                    ->get()
                    ->keyBy('month');

                $expenseData = $baseMonths->map(function ($item, $index) use ($rawExpenses) {
                    $monthNum = $index + 1;
                    return [
                        'month' => $item['month'],
                        'amount' => isset($rawExpenses[$monthNum]) ? (float) $rawExpenses[$monthNum]->amount : 0,
                    ];
                });



                // Contributions
                $rawContributions = Contributions::select(
                    DB::raw('MONTH(created_at) as month'),
                    DB::raw('SUM(amount) as amount')
                )
                    ->whereYear('created_at', $year)
                    ->groupBy(DB::raw('MONTH(created_at)'))
                    ->get()
                    ->keyBy('month');

                $contributionData = $baseMonths->map(function ($item, $index) use ($rawContributions) {
                    $monthNum = $index + 1;
                    return [
                        'month' => $item['month'],
                        'amount' => isset($rawContributions[$monthNum]) ? (float) $rawContributions[$monthNum]->amount : 0,
                    ];
                });

                // Totals for selected month
                $totalCollection = isset($rawCollections[$month]) ? (float) $rawCollections[$month]->amount : 0;
                $totalExpenses = isset($rawExpenses[$month]) ? (float) $rawExpenses[$month]->amount : 0;
                $totalContributions = isset($rawContributions[$month]) ? (float) $rawContributions[$month]->amount : 0;

                // Previous month totals
                $prevTotalCollection = isset($rawCollections[$prevMonth]) ? (float) $rawCollections[$prevMonth]->amount : 0;
                $prevTotalExpenses = isset($rawExpenses[$prevMonth]) ? (float) $rawExpenses[$prevMonth]->amount : 0;
                $prevTotalContributions = isset($rawContributions[$prevMonth]) ? (float) $rawContributions[$prevMonth]->amount : 0;

                // Trends
                $trendTotalCollection = $this->calcTrend($totalCollection, $prevTotalCollection);
                $trendTotalExpenses = $this->calcTrend($totalExpenses, $prevTotalExpenses);
                $trendTotalContributions = $this->calcTrend($totalContributions, $prevTotalContributions);

            } catch (Exception $e) {
                \Log::error('Error in monthly dashboard data: ' . $e->getMessage(), [
                    'trace' => $e->getTraceAsString()
                ]);
            }
        } elseif ($viewType === 'yearly') {
            try {
                $selectedDate = $selectedDate ?: Carbon::now()->year;
                $selectedYear = is_numeric($selectedDate) ? (int) $selectedDate : Carbon::parse($selectedDate)->year;
                $startYear = $selectedYear - 4;
                $endYear = $selectedYear;

                $years = collect(range($startYear, $endYear));

                // Collections
                $rawCollections = Payment::select(DB::raw('YEAR(created_at) as year'), DB::raw('SUM(amount) as amount'))
                    ->whereBetween(DB::raw('YEAR(created_at)'), [$startYear, $endYear])
                    ->groupBy('year')
                    ->get()
                    ->keyBy('year');

                $collectionData = $years->map(function ($year) use ($rawCollections) {
                    return [
                        'year' => (string) $year,
                        'amount' => isset($rawCollections[$year]) ? (float) $rawCollections[$year]->amount : 0,
                    ];
                });

                // Expenses
                $rawExpenses = Expenses::select(DB::raw('YEAR(spent_at) as year'), DB::raw('SUM(amount) as amount'))
                    ->whereBetween(DB::raw('YEAR(spent_at)'), [$startYear, $endYear])
                    ->where('status', 'Approved')
                    ->groupBy('year')
                    ->get()
                    ->keyBy('year');

                $expenseData = $years->map(function ($year) use ($rawExpenses) {
                    return [
                        'year' => (string) $year,
                        'amount' => isset($rawExpenses[$year]) ? (float) $rawExpenses[$year]->amount : 0,
                    ];
                });
                // Contributions
                $rawContributions = Contributions::select(
                    DB::raw('YEAR(created_at) as year'),
                    DB::raw('SUM(amount) as amount')
                )
                    ->whereBetween(DB::raw('YEAR(created_at)'), [$startYear, $endYear])
                    ->groupBy(DB::raw('YEAR(created_at)'))
                    ->get()
                    ->keyBy('year');

                $contributionData = $years->map(function ($year) use ($rawContributions) {
                    return [
                        'year' => (string) $year,
                        'amount' => isset($rawContributions[$year]) ? (float) $rawContributions[$year]->amount : 0,
                    ];
                });

                // Totals for selected year
                $totalCollection = isset($rawCollections[$selectedYear]) ? (float) $rawCollections[$selectedYear]->amount : 0;
                $totalExpenses = isset($rawExpenses[$selectedYear]) ? (float) $rawExpenses[$selectedYear]->amount : 0;
                $totalContributions = isset($rawContributions[$selectedYear]) ? (float) $rawContributions[$selectedYear]->amount : 0;

                // Previous year totals
                $prevYear = $selectedYear - 1;
                $prevTotalCollection = isset($rawCollections[$prevYear]) ? (float) $rawCollections[$prevYear]->amount : 0;
                $prevTotalExpenses = isset($rawExpenses[$prevYear]) ? (float) $rawExpenses[$prevYear]->amount : 0;
                $prevTotalContributions = isset($rawContributions[$prevYear]) ? (float) $rawContributions[$prevYear]->amount : 0;

                // Trends
                $trendTotalCollection = $this->calcTrend($totalCollection, $prevTotalCollection);
                $trendTotalExpenses = $this->calcTrend($totalExpenses, $prevTotalExpenses);
                $trendTotalContributions = $this->calcTrend($totalContributions, $prevTotalContributions);

            } catch (Exception $e) {
                \Log::error('Error in yearly dashboard data: ' . $e->getMessage(), [
                    'trace' => $e->getTraceAsString()
                ]);
            }
        }

        return Inertia::render('dashboard', [
            'activeMembers' => $activeMembers ?? 0,
            'inactiveMembers' => $inactiveMembers ?? 0,
            'totalCollection' => $totalCollection ?? 0,
            'totalExpenses' => $totalExpenses ?? 0,
            'totalContributions' => $totalContributions ?? 0,

            'trendActiveMembers' => $trendActiveMembers ?? '0%',
            'trendInactiveMembers' => $trendInactiveMembers ?? '0%',
            'trendTotalCollection' => $trendTotalCollection ?? '0%',
            'trendTotalExpenses' => $trendTotalExpenses ?? '0%',
            'trendTotalContributions' => $trendTotalContributions ?? '0%',

            'collectionChart' => $collectionData,
            'expenseChart' => $expenseData,
            'contributionChart' => $contributionData,

            'recentContributions' => $recentContributions ?? [],
            'recentPayments' => $recentCollections ?? [],
            'recentExpenses' => $recentExpenses ?? [],

            'viewType' => $viewType,
            'selectedDate' => $selectedDate,
        ]);
    }

    public function calcTrend($current, $previous)
    {
        if ($previous === 0) {
            return $current > 0 ? '+100%' : '0%';
        }
        $diff = (($current - $previous) / $previous) * 100;
        $sign = $diff >= 0 ? '+' : '';
        return $sign . round($diff, 1) . '%';
    }
}
