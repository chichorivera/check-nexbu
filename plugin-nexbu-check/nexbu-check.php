<?php
/**
 * Plugin Name: Nexbu Check
 * Plugin URI:  https://check.nexbu.com
 * Description: Plugin companion para Nexbu Check. Expone un endpoint autenticado en /nexbu-check/ con datos internos del sitio WordPress para auditoría remota.
 * Version:     1.0.0
 * Author:      Javier Rivera
 * Author URI:  https://jjrc.dev
 * License:     GPL v2 or later
 * Text Domain: nexbu-check
 */

defined('ABSPATH') || exit;

define('NEXBU_CHECK_VERSION', '1.0.0');
define('NEXBU_CHECK_PATH', plugin_dir_path(__FILE__));
define('NEXBU_CHECK_URL',  plugin_dir_url(__FILE__));

require_once NEXBU_CHECK_PATH . 'includes/class-auth.php';
require_once NEXBU_CHECK_PATH . 'includes/class-scanner.php';
require_once NEXBU_CHECK_PATH . 'includes/class-api.php';

new Nexbu_Check_API();
new Nexbu_Check_Admin();

class Nexbu_Check_Admin {
    public function __construct() {
        add_action('admin_menu', [$this, 'add_menu']);
        add_action('admin_init', [$this, 'handle_actions']);
        add_filter('plugin_action_links_nexbu-check/nexbu-check.php', [$this, 'add_action_links']);
    }

    public function add_action_links($links) {
        $url = admin_url('options-general.php?page=nexbu-check');
        array_unshift($links, '<a href="' . esc_url($url) . '">Configurar</a>');
        return $links;
    }

    public function add_menu() {
        add_options_page(
            'Nexbu Check',
            'Nexbu Check',
            'manage_options',
            'nexbu-check',
            [$this, 'render_page']
        );
    }

    public function handle_actions() {
        if (!isset($_POST['nexbu_action']) || !current_user_can('manage_options')) return;
        if (!check_admin_referer('nexbu_check_action')) return;

        if ($_POST['nexbu_action'] === 'generate_key') {
            $key = Nexbu_Check_Auth::generate_key();
            set_transient('nexbu_check_new_key', $key, 60);
            wp_redirect(admin_url('options-general.php?page=nexbu-check&key_generated=1'));
            exit;
        }

        if ($_POST['nexbu_action'] === 'revoke_key') {
            Nexbu_Check_Auth::revoke_key();
            wp_redirect(admin_url('options-general.php?page=nexbu-check&key_revoked=1'));
            exit;
        }
    }

    public function render_page() {
        $has_key = Nexbu_Check_Auth::has_key();
        $new_key = get_transient('nexbu_check_new_key');
        $endpoint_url = home_url('/nexbu-check/');

        if ($new_key) delete_transient('nexbu_check_new_key');
        ?>
        <div class="wrap" style="max-width:680px">
            <div style="display:flex;align-items:center;gap:12px;margin:16px 0 8px">
                <img src="<?php echo esc_url(NEXBU_CHECK_URL . 'assets/logo-nexbu.png'); ?>" alt="Nexbu" style="height:28px;width:auto">
            </div>
            <h1 style="margin-top:0">Nexbu Check</h1>
            <p>Plugin companion para <a href="https://check.nexbu.com" target="_blank">check.nexbu.com</a>. Expone el endpoint <code><?php echo esc_html($endpoint_url); ?></code> con datos internos del sitio para auditoría remota.</p>

            <?php if (isset($_GET['key_generated'])): ?>
                <div class="notice notice-success"><p>API Key generada correctamente.</p></div>
            <?php endif; ?>
            <?php if (isset($_GET['key_revoked'])): ?>
                <div class="notice notice-warning"><p>API Key revocada. El endpoint ya no es accesible.</p></div>
            <?php endif; ?>

            <div style="background:#fff;border:1px solid #c3c4c7;border-radius:4px;padding:20px;margin-top:20px">
                <h2 style="margin-top:0">Estado del endpoint</h2>

                <table class="form-table">
                    <tr>
                        <th>Endpoint</th>
                        <td><code><?php echo esc_html($endpoint_url); ?></code></td>
                    </tr>
                    <tr>
                        <th>Estado</th>
                        <td>
                            <?php if ($has_key): ?>
                                <span style="color:#0f7b6c;font-weight:600">✓ Activo</span>
                            <?php else: ?>
                                <span style="color:#787774">⊘ Sin API Key — endpoint desactivado</span>
                            <?php endif; ?>
                        </td>
                    </tr>
                </table>

                <?php if ($new_key): ?>
                    <div style="background:#edfaf7;border:1px solid #b2e8df;border-radius:4px;padding:16px;margin-top:12px">
                        <p style="margin:0 0 8px;font-weight:600;color:#0f7b6c">API Key generada — cópiala ahora, no se volverá a mostrar:</p>
                        <div style="display:flex;gap:8px;align-items:center">
                            <code style="background:#fff;border:1px solid #e9e9e7;padding:8px 12px;border-radius:4px;font-size:13px;flex:1;word-break:break-all">
                                <?php echo esc_html($new_key); ?>
                            </code>
                            <button
                                onclick="navigator.clipboard.writeText('<?php echo esc_js($new_key); ?>');this.textContent='¡Copiado!';"
                                style="padding:8px 12px;background:#2383e2;color:#fff;border:none;border-radius:4px;cursor:pointer;white-space:nowrap"
                            >
                                Copiar
                            </button>
                        </div>
                    </div>
                <?php endif; ?>

                <div style="margin-top:20px;display:flex;gap:10px">
                    <form method="post">
                        <?php wp_nonce_field('nexbu_check_action'); ?>
                        <input type="hidden" name="nexbu_action" value="generate_key">
                        <button type="submit" class="button button-primary">
                            <?php echo $has_key ? 'Regenerar API Key' : 'Generar API Key'; ?>
                        </button>
                    </form>
                    <?php if ($has_key): ?>
                        <form method="post">
                            <?php wp_nonce_field('nexbu_check_action'); ?>
                            <input type="hidden" name="nexbu_action" value="revoke_key">
                            <button type="submit" class="button button-secondary" onclick="return confirm('¿Revocar la API Key? El endpoint quedará inaccesible.')">
                                Revocar API Key
                            </button>
                        </form>
                    <?php endif; ?>
                </div>
            </div>

            <div style="background:#fff;border:1px solid #c3c4c7;border-radius:4px;padding:20px;margin-top:16px">
                <h2 style="margin-top:0">Instrucciones</h2>
                <ol style="margin:0;padding-left:20px;line-height:1.8">
                    <li>Genera una API Key con el botón de arriba.</li>
                    <li>Cópiala — solo se muestra una vez.</li>
                    <li>Ve a <a href="https://check.nexbu.com" target="_blank">check.nexbu.com</a>.</li>
                    <li>Ingresa la URL de tu sitio y pega la API Key.</li>
                    <li>Obtén una auditoría completa al 100%.</li>
                </ol>
            </div>
        </div>
        <?php
    }
}
