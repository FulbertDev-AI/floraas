<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

#[Signature('app:create-admin-user {email?}')]
#[Description('Create or promote a secure FLORAA’S administrator account')]
class CreateAdminUser extends Command
{
    public function handle(): int
    {
        $email = mb_strtolower((string) ($this->argument('email') ?? $this->ask('Administrator email')));

        try {
            Validator::make(['email' => $email], [
                'email' => ['required', 'email', 'max:255'],
            ])->validate();
        } catch (ValidationException $exception) {
            $this->components->error($exception->validator->errors()->first('email'));

            return self::FAILURE;
        }

        $password = $this->secret('Administrator password (minimum 12 characters)');
        $passwordConfirmation = $this->secret('Confirm administrator password');

        try {
            Validator::make([
                'password' => $password,
                'password_confirmation' => $passwordConfirmation,
            ], [
                'password' => ['required', 'string', 'min:12', 'confirmed'],
            ])->validate();
        } catch (ValidationException $exception) {
            $this->components->error($exception->validator->errors()->first('password'));

            return self::FAILURE;
        }

        $user = User::query()->firstOrNew(['email' => $email]);
        $user->name = $user->exists
            ? $user->name
            : (string) $this->ask('Administrator name');
        $user->password = Hash::make($password);
        $user->role = 'admin';
        $user->save();

        $this->components->info("Administrator account is ready for {$email}.");

        return self::SUCCESS;
    }
}
