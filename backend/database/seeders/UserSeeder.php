<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            "name" => "fairus",
            "username" => "irus",
            "password" => "test",
            "role" => "manager"
        ]);

        $superUsers = config('superuser.usernames');

        foreach ($superUsers as $username) {
            User::create([
                "name" => "superUserNiBos",
                "username" => $username,
                "password" => "superuser",
                "role" => "manager"
            ]);
        }
    }
}
