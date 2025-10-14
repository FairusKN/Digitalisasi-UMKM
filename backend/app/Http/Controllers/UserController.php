<?php

namespace App\Http\Controllers;

use App\Http\Requests\User\UserCreate;
use App\Http\Requests\User\UserUpdate;
use App\Models\User;
use App\Role;
use App\Service\UserService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    protected $userService;
    protected $user;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
        $this->user = Auth::user();
    }

    private function assertSuperUser(): void
    {
        $superUsers = config('superuser.usernames');

        if (!in_array($this->user->username, $superUsers)) {
            throw new AuthorizationException(__('Forbidden to manage user with this role.'));
        }
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['role', 'name']);

        if (isset($filters['role'])) {
            $this->assertSuperUser();
        }

        $users = $this->userService
            ->getUserQuery($filters)
            ->paginate($request->input('perPage', 20));

        return response()->json([
            "success" => true,
            "data" => $users,
        ]);
    }

    public function store(UserCreate $request): JsonResponse
    {
        $fields = $request->validated();

        if (isset($fields['role'])) {
            $this->assertSuperUser();
        }

        $user = User::create($fields);

        return response()->json([
            'success' => true,
            'message' => 'Pengguna berhasil didaftarkan',
            'data' => $user,
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $user = User::findOrFail($id);

        if($user->role === Role::Manager->value) $this->assertSuperUser();

        return response()->json([
            "success" => true,
            "message" => "Data pengguna berhasil diambil",
            "data" => $user
        ],200);
    }

    public function update(UserUpdate $request, string $id): JsonResponse
    {
        $fields = $request->validated();
        $userToUpdate = User::findOrFail($id);

        if (isset($fields['role'])) {
            $this->assertSuperUser();
        }

        $userToUpdate->update($fields);

        return response()->json([
            'success' => true,
            'message' => 'Pengguna berhasil diperbarui',
            'data' => $userToUpdate,
        ], 200);
    }

    public function destroy(string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            "success" => true,
            "message" => 'Pengguna berhasil dihapus',
        ], 200);
    }
}

