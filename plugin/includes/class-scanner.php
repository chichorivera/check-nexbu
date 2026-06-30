<?php

defined('ABSPATH') || exit;

class Nexbu_Check_Scanner {

    public static function scan(): array {
        return [
            'theme'       => self::get_theme_info(),
            'security'    => self::get_security_info(),
            'settings'    => self::get_settings_info(),
            'performance' => self::get_performance_info(),
            'plugins'     => self::get_plugins_info(),
            'database'    => self::get_database_info(),
            'wordpress'   => self::get_wordpress_info(),
        ];
    }

    private static function get_theme_info(): array {
        $theme = wp_get_theme();
        $parent = $theme->parent();

        return [
            'name'     => $theme->get('Name'),
            'version'  => $theme->get('Version'),
            'is_child' => (bool) $parent,
            'parent'   => $parent ? $parent->get('Name') : null,
        ];
    }

    private static function get_security_info(): array {
        $admin_user = get_user_by('login', 'admin');

        return [
            'admin_user_exists' => (bool) $admin_user,
            'debug_mode'        => defined('WP_DEBUG') && WP_DEBUG,
            'debug_log'         => defined('WP_DEBUG_LOG') && WP_DEBUG_LOG,
        ];
    }

    private static function get_settings_info(): array {
        $siteurl = get_option('siteurl', '');

        return [
            'search_discouraged' => !(bool) get_option('blog_public', 1),
            'ssl_in_siteurl'     => str_starts_with($siteurl, 'https://'),
            'blogname'           => get_option('blogname', ''),
        ];
    }

    private static function get_performance_info(): array {
        $active = get_option('active_plugins', []);
        $active_all = array_merge($active, array_keys(get_site_option('active_sitewide_plugins', [])));

        $cache_plugins = [
            'wp-rocket'           => 'WP Rocket',
            'w3-total-cache'      => 'W3 Total Cache',
            'wp-super-cache'      => 'WP Super Cache',
            'litespeed-cache'     => 'LiteSpeed Cache',
            'comet-cache'         => 'Comet Cache',
            'swift-performance'   => 'Swift Performance',
            'sg-cachepress'       => 'SG Optimizer',
            'cache-enabler'       => 'Cache Enabler',
        ];

        $backup_plugins = [
            'updraftplus'             => 'UpdraftPlus',
            'backupbuddy'             => 'BackupBuddy',
            'all-in-one-wp-migration' => 'All-in-One WP Migration',
            'duplicator'              => 'Duplicator',
            'wp-time-capsule'         => 'WP Time Capsule',
            'boldgrid-backup'         => 'BoldGrid Backup',
            'backwpup'                => 'BackWPup',
        ];

        return [
            'cache_plugin'  => self::detect_plugin($active_all, $cache_plugins),
            'backup_plugin' => self::detect_plugin($active_all, $backup_plugins),
        ];
    }

    private static function get_plugins_info(): array {
        if (!function_exists('get_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        $all_plugins     = get_plugins();
        $active_plugins  = get_option('active_plugins', []);
        $update_data     = get_site_transient('update_plugins');
        $updates_available = [];

        if (isset($update_data->response)) {
            foreach (array_keys($update_data->response) as $plugin_file) {
                if (in_array($plugin_file, $active_plugins, true)) {
                    $updates_available[] = $all_plugins[$plugin_file]['Name'] ?? $plugin_file;
                }
            }
        }

        return [
            'active_count'      => count($active_plugins),
            'total_count'       => count($all_plugins),
            'updates_available' => $updates_available,
        ];
    }

    private static function get_database_info(): array {
        global $wpdb;

        $revisions = (int) $wpdb->get_var(
            "SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = 'revision'"
        );

        $trashed = (int) $wpdb->get_var(
            "SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_status = 'trash'"
        );

        return [
            'revisions_count' => $revisions,
            'trashed_count'   => $trashed,
        ];
    }

    private static function get_wordpress_info(): array {
        global $wp_version;

        return [
            'version' => $wp_version,
        ];
    }

    private static function detect_plugin(array $active, array $candidates): ?string {
        foreach ($active as $plugin_file) {
            foreach ($candidates as $slug => $label) {
                if (str_contains($plugin_file, $slug)) {
                    return $label;
                }
            }
        }
        return null;
    }
}
