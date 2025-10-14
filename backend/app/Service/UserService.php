<?php

namespace App\Service;

use App\Models\User;
use App\Role;
use Illuminate\Support\Facades\Auth;
use InvalidArgumentException;

class UserService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    public function getUserQuery(array $filters = [])
    {
        $query = User::query();
        $currentUser = Auth::user();
        $superUsers = array_filter(config('superuser.usernames', []));
        $isSuperUser = $currentUser && in_array($currentUser->username, $superUsers, true);

        if ($currentUser && !$isSuperUser) {
            $query->where(function ($innerQuery) use ($currentUser) {
                $innerQuery->where('role', '!=', Role::Manager->value)
                    ->orWhere('id', $currentUser->id);
            });
        }

        if(isset($filters["role"])) {
            if(!Role::tryFrom($filters["role"])) {
                throw new InvalidArgumentException("Invalid role value: {$filters['role']}");
            }
            $query->where('role', $filters['role']);
        }

        if (isset($filters["name"])) {
            $query->where("name", "like", '%' . $filters['name'] . '%');
        }

        return $query;
    }
}
