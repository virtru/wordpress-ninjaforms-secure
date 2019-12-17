<?php
/**
 * Created by PhpStorm.
 * User: oveprev
 * Date: 2019-11-11
 * Time: 16:03
 */

function nf_virtru_plugin() {
    require_once 'templates/nf-virtru-admin-page.php';
}

function nf_virtru_menu() {
    add_menu_page("NF Virtru Plugin", "NF Virtru Plugin", "manage_options", "nf_virtru_plugin", "nf_virtru_plugin", "");
}
add_action("admin_menu", "nf_virtru_menu");