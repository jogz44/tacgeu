<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\User;

class EmailController extends Controller
{
    public function checkEmail(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'exclude_id' => 'nullable|integer',
            ]);

            if ($validator->fails()) {
                return response()->json(['valid' => false, 'message' => 'Invalid email format.']);
            }


            $email = $request->email;
            $excludeId = $request->exclude_id;

            $exists = User::where('email', $email)
                ->when($excludeId, fn($query) => $query->where('id', '!=', $excludeId))
                ->exists();

            return response()->json([
                'valid' => !$exists,
                'message' => $exists ? 'Email already taken.' : 'Email is available.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'valid' => false,
                'message' => 'An error occurred while checking the email.',
            ]);
        }
    }
}
