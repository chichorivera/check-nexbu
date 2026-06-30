<?php

defined('ABSPATH') || exit;

class Nexbu_Check_API {

    public function __construct() {
        add_action('init', [$this, 'register_rewrite']);
        add_action('template_redirect', [$this, 'handle_request']);
        register_activation_hook(NEXBU_CHECK_PATH . 'nexbu-check.php', [$this, 'flush_rules']);
        register_deactivation_hook(NEXBU_CHECK_PATH . 'nexbu-check.php', 'flush_rewrite_rules');
    }

    public function register_rewrite(): void {
        add_rewrite_rule('^nexbu-check/?$', 'index.php?nexbu_check_request=1', 'top');
        add_rewrite_tag('%nexbu_check_request%', '([0-9]+)');
    }

    public function flush_rules(): void {
        $this->register_rewrite();
        flush_rewrite_rules();
    }

    public function handle_request(): void {
        if (!get_query_var('nexbu_check_request')) return;

        // CORS — only allow check.nexbu.com (and localhost for dev)
        $allowed_origins = ['https://check.nexbu.com', 'http://localhost:5173', 'http://localhost:3001'];
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        if (in_array($origin, $allowed_origins, true)) {
            header("Access-Control-Allow-Origin: {$origin}");
        }
        header('Access-Control-Allow-Methods: GET, OPTIONS');
        header('Access-Control-Allow-Headers: Authorization, Content-Type');

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            status_header(204);
            exit;
        }

        header('Content-Type: application/json; charset=utf-8');

        // Authentication
        if (!Nexbu_Check_Auth::has_key()) {
            http_response_code(503);
            echo wp_json_encode(['error' => 'Endpoint no configurado. Genera una API Key en Ajustes → Nexbu Check.']);
            exit;
        }

        $provided_key = Nexbu_Check_Auth::get_key_from_request();
        if (!Nexbu_Check_Auth::validate($provided_key)) {
            http_response_code(401);
            echo wp_json_encode(['error' => 'API Key inválida o no proporcionada.']);
            exit;
        }

        // Scan and respond
        $data = Nexbu_Check_Scanner::scan();

        echo wp_json_encode([
            'success' => true,
            'version' => NEXBU_CHECK_VERSION,
            'data'    => $data,
        ]);
        exit;
    }
}
