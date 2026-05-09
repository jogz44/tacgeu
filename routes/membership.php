<?php

use App\Http\Controllers\Auth\EmailController;
use App\Http\Controllers\CandidateController;
use App\Http\Controllers\ElectionReportController;
use App\Http\Controllers\PositionController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ContributionController;
use Inertia\Inertia;
use App\Http\Controllers\ExpensesController;
use App\Http\Controllers\ElectionController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\CollectionController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\VoteController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PollController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\EmployeePositionController;
use App\Http\Controllers\ResignedController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\FinancialReportController;

Route::middleware('guest')->group(function () {
    Route::get('membership', [UserController::class, 'create'])->name('membership');
    Route::get('membership/member', [UserController::class, 'member'])->name('membership.member');
    Route::get('membership/officer', [UserController::class, 'officer'])->name('membership.officer');
    Route::post('membership', [UserController::class, 'store'])->name('membership.store');
});

Route::get('/position', [EmployeePositionController::class, 'list']);
Route::get('/department', [DepartmentController::class, 'list']);
Route::get('/check-email', [EmailController::class, 'checkEmail'])->name('email.check');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/notice', function () {
        $user = Auth::user();

        if ($user->role === 'Visitor' && $user->is_first_log) {
            return Inertia::location(route('password.edit'));
        }

        return app(UserController::class)->notice();
    })->name('notice')->middleware('role:Visitor');

    Route::middleware('role:Visitor')->group(function () {
        Route::get('/membershipform/print/{id}', [UserController::class, 'print'])->name('membership_form');
    });

    Route::middleware('role:President,Election Committee')->group(function () {
        Route::get('roles', [UserController::class, 'roles'])->name('roles');
        Route::get('roles/user', action: [RoleController::class, 'index'])->name('roles.index');
        Route::post('roles/register', action: [RoleController::class, 'store'])->name('roles.register');
        Route::put('/users/{id}/role', [UserController::class, 'changeRole'])->name('users.changeRole');
        Route::put('/users/{id}/status', [UserController::class, 'changeStatus'])->name('users.changeStatus');
        Route::delete('/users/{id}/delete', [UserController::class, 'deleteUser'])->name('users.delete');
    });

    Route::middleware('role:President,Treasurer')->group(function () {
        Route::get('expenses', [ExpensesController::class, 'index'])->name('expenses');
        Route::post('/expenses', [ExpensesController::class, 'store'])->name('expenses.store');
        Route::post('/expense/status', [ExpensesController::class, 'updateStatus'])->name('expenses.updateStatus');
        Route::delete('/expenses/{expense}', [ExpensesController::class, 'destroy'])->name('expenses.destroy');

        Route::get('payments', [PaymentController::class, 'index'])->name('payments');
        Route::post('/payments', [PaymentController::class, 'store'])->name('payments.store');
        Route::put('/payments/{payment}', [PaymentController::class, 'update'])->name('payments.update');
        Route::delete('/payments/{id}', [PaymentController::class, 'destroy'])->name('payments.destroy');

        Route::get('collections', [CollectionController::class, 'index'])->name('collections');
        Route::post('/collections', [CollectionController::class, 'store'])->name('collections.store');
        Route::post('/collections/update', [CollectionController::class, 'update'])->name('collections.update');
        Route::delete('/collections/{id}', [CollectionController::class, 'destroy'])->name('collections.destroy');

        Route::post('monthly/contribution', [ContributionController::class, 'store'])->name('contribution.store');
        Route::put('monthly/contribution/{id}', [ContributionController::class, 'update'])->name('contribution.update');
        Route::delete('monthly/contribution/{id}', [ContributionController::class, 'destroy'])
            ->name('contribution.destroy');
        Route::post('/monthly/contribution/import', [ContributionController::class, 'import'])->name('contribution.import');
        Route::get('/members/{userId}/contributions', [ContributionController::class, 'membersContribution'])
            ->name('members.contributions');

        Route::get('/financial-summary', [FinancialReportController::class, 'index'])->name('financial.summary');
    });

    Route::middleware('role:President,Human Resource Officer,Membership Committee,Election Committee,Treasurer')->group(function () {
        Route::get('members', [UserController::class, 'members'])->name('members');
        Route::get('applicants', [UserController::class, 'applicants'])->name('applicants');
        Route::put('/applicant/{id}', [UserController::class, 'approvedApplicants'])->name('applicant.update');
        Route::put('/applicant/reject/{id}', [UserController::class, 'rejectApplicants'])->name('applicant.reject');
        Route::get('app-settings', [SettingsController::class, 'index'])->name('settings.index');
        Route::post('app-settings/update/{id}', [SettingsController::class, 'update'])->name('settings.update');
        Route::get('app-settings/department', [DepartmentController::class, 'index'])->name('settings.department.index');
        Route::post('app-settings/department', [DepartmentController::class, 'store'])->name('settings.department.store');
        Route::put('app-settings/department/{id}', [DepartmentController::class, 'update'])->name('settings.department.update');
        Route::delete('app-settings/department/{id}', [DepartmentController::class, 'destroy'])->name('settings.department.destroy');
        Route::get('app-settings/position', [EmployeePositionController::class, 'index'])->name('settings.position.index');
        Route::post('app-settings/position', [EmployeePositionController::class, 'store'])->name('settings.position.store');
        Route::put('app-settings/position/{id}', [EmployeePositionController::class, 'update'])->name('settings.position.update');
        Route::delete('app-settings/position/{id}', [EmployeePositionController::class, 'destroy'])->name('settings.position.destroy');
    });

    Route::middleware('role:Membership Committee')->group(function () {
        Route::get('resigned', [ResignedController::class, 'index'])->name('members.resigned');
        Route::post('/members/{id}/approved', [ResignedController::class, 'store'])->name('members.approved');
        Route::post('/members/{id}/rejected', [ResignedController::class, 'reject'])->name('members.rejected');
    });

    Route::middleware('role:President,Human Resource Officer,Treasurer,Membership Committee')->group(function () {
        Route::get('members/data/{id}', [UserController::class, 'membersData'])->name('membersData');
        Route::get('members/update/{id}', [UserController::class, 'membersUpdate'])->name('membersUpdate');
    });

    Route::middleware('role:Election Committee')->group(function () {
        Route::get('elections', [ElectionController::class, 'index'])->name('elections');
        Route::post('/elections', [ElectionController::class, 'store'])->name('elections.store');
        Route::put('/elections/{id}', [ElectionController::class, 'update'])->name('elections.update');
        Route::delete('/elections/{id}', [ElectionController::class, 'destroy'])->name('elections.destroy');
        Route::put('/elections/{election}/status', [ElectionController::class, 'updateStatus'])
            ->name('elections.updateStatus');

        Route::get('positions', [PositionController::class, 'index'])->name('positions');
        Route::post('/positions', [PositionController::class, 'store'])->name('positions.store');
        Route::put('/positions/{id}', [PositionController::class, 'update'])->name('positions.update');
        Route::delete('/positions/{id}', [PositionController::class, 'destroy'])->name('positions.destroy');

        Route::delete('/elections/{election}/candidates/{id}', [CandidateController::class, 'destroy'])
            ->name('candidates.destroy');
        Route::put('/candidates/updateStatus', [CandidateController::class, 'updateStatus'])->name('candidates.updateStatus');

        Route::get('/election-summary', [ElectionReportController::class, 'index'])->name('election.summary');
    });

    Route::middleware('role:President,Human Resource Officer,Treasurer,Membership Committee,Election Committee,Public Information Officer,Member,Visitor')->group(function () {
        Route::get('announcement', [AnnouncementController::class, 'index'])->name('announcement');
        Route::post('/announcements', [AnnouncementController::class, 'store'])->name('announcements.store');
        Route::put('/announcements/{announcement}', [AnnouncementController::class, 'update'])->name('announcements.update');
        Route::delete('/announcements/{id}', [AnnouncementController::class, 'destroy'])->name('announcements.destroy');
        Route::get('/announcement/update-counts', [AnnouncementController::class, 'getUpdateCounts']);

        Route::get('/notification', [NotificationController::class, 'notifications']);
        Route::post('/notification/mark-read', [NotificationController::class, 'markAllRead'])
            ->name('notification.markRead');

        Route::get('/union-members/all', [UserController::class, 'allMembers'])->middleware(['auth']);

        Route::get('monthly/contribution', [ContributionController::class, 'index'])->name('contributions');
        Route::get('member/contributions', [ContributionController::class, 'contribution'])->name('contributions.member');

        Route::get('candidates', [CandidateController::class, 'index'])->name('candidates');
        Route::get('candidates/member', [CandidateController::class, 'members'])->name('candidates.members');
        Route::get('candidates/approvedCandidates', [CandidateController::class, 'approvedCandidates'])->name('approvedCandidates');
        Route::get('/candidates/list', [CandidateController::class, 'fetch'])->name('candidates.fetch');
        Route::post('/candidates', [CandidateController::class, 'store'])->name('candidates.store');

        Route::get('vote', [VoteController::class, 'index'])->name('vote');
        Route::post('/vote', [VoteController::class, 'store'])->name('vote.store');
        Route::get('polls', [PollController::class, 'index'])->name('polls');
    });
});
