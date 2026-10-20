<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_log_in_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'flora@example.test',
            'password' => 'SecurePass!123',
        ]);

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'SecurePass!123',
        ])->assertRedirect('/');

        $this->assertAuthenticatedAs($user);
    }

    public function test_login_attempts_are_limited_by_email_and_ip(): void
    {
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->post('/login', [
                'email' => 'unknown@example.test',
                'password' => 'incorrect',
            ])->assertRedirect();
        }

        $this->post('/login', [
            'email' => 'unknown@example.test',
            'password' => 'incorrect',
        ])->assertTooManyRequests();
    }
}
