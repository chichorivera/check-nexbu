<?php

defined('ABSPATH') || exit;

class Nexbu_Check_Auth {

    const OPTION_KEY = 'nexbu_check_api_key_hash';

    public static function generate_key(): string {
        $key = wp_generate_password(40, false, false);
        update_option(self::OPTION_KEY, wp_hash($key), false);
        return $key;
    }

    public static function revoke_key(): void {
        delete_option(self::OPTION_KEY);
    }

    public static function has_key(): bool {
        return !empty(get_option(self::OPTION_KEY, ''));
    }

    public static function validate(string $provided_key): bool {
        if (!$provided_key) return false;
        $stored_hash = get_option(self::OPTION_KEY, '');
        if (!$stored_hash) return false;
        return hash_equals($stored_hash, wp_hash($provided_key));
    }

    public static function get_key_from_request(): string {
        $auth_header = $_SERVER['HTTP_AUTHORIZATION']
            ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
            ?? '';

        if (str_starts_with($auth_header, 'Bearer ')) {
            return trim(substr($auth_header, 7));
        }

        return '';
    }
}
