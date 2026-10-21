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

    public function test_admin_is_redirected_to_the_dashboard_after_logging_in(): void
    {
        $admin = User::factory()->create([
            'email' => 'admin@example.test',
            'password' => 'SecurePass!123',
        ]);
        $admin->forceFill(['role' => 'admin'])->save();

        $this->post('/login', [
            'email' => $admin->email,
            'password' => 'SecurePass!123',
        ])->assertRedirect('/admin');

        $this->assertAuthenticatedAs($admin);

        $this->get('/admin')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Dashboard')
                ->where('auth.user.role', 'admin'));
    }

    public function test_logging_out_invalidates_the_session_and_protects_admin_routes(): void
    {
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();
        $this->actingAs($admin);

        $this->post('/logout')->assertRedirect('/');

        $this->assertGuest();
        $this->get('/admin')->assertRedirect('/login');
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
