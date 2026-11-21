<?php

namespace App\Modules\Identity\Http\Controllers;

use App\Modules\Identity\Http\Requests\LoginRequest;
use App\Modules\Identity\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

/** Session (cookie) based login for the SPA via Sanctum. */
class AuthController
{
    public function login(LoginRequest $request): UserResource
    {
        if (! Auth::guard('web')->attempt($request->validated())) {
            throw ValidationException::withMessages(['email' => 'These credentials do not match our records.']);
        }

        $request->session()->regenerate(); // prevent session fixation

        return new UserResource($request->user());
    }

    public function me(Request $request): UserResource
    {
        return new UserResource($request->user());
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(status: 204);
    }
}
