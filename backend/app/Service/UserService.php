<?php

namespace App\Service;

use App\Models\User;
use App\Role;
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
