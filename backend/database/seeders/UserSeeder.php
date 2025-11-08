<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // テストユーザーが存在しない場合のみ作成
        if (User::where('email', 'test@example.com')->doesntExist()) {
            User::create([
                'name' => 'テストユーザー',
                'email' => 'test@example.com',
                'password' => Hash::make('password123'),
            ]);
        }

        // 管理者ユーザーが存在しない場合のみ作成
        if (User::where('email', 'admin@example.com')->doesntExist()) {
            User::create([
                'name' => '管理者',
                'email' => 'admin@example.com',
                'password' => Hash::make('admin123'),
            ]);
        }
    }
}

