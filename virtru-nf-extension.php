<?php

/*
Plugin Name: Virtru Extension for NinjaForm
Version: 1.0
Author: oveprev
*/

if ( !defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

define( 'VIRTRU_NINJA_FORMS_URL', plugins_url( '/', __FILE__ ) );
define( 'VIRTRU_NINJA_FORMS_PATH', plugin_dir_path( __FILE__ ) );

require_once VIRTRU_NINJA_FORMS_PATH.'admin/settings.php';

wp_enqueue_script('jquery');
wp_enqueue_style('nf-virtru-styles', plugins_url( '/assets/styles/styles.css', __FILE__ ), array(), '1.0.2');
wp_enqueue_script('encrypt-script', plugins_url( '/assets/js/bundle.js', __FILE__ ), array(), false, true);
// Need to be changed. We won't to send admin email to front end side.
// Probably we can add custom field and admin will fill it another email for first recipient
wp_localize_script( 'encrypt-script', 'adminEmail', array(
    'data' => get_bloginfo('admin_email')
));
wp_enqueue_script('auth-widget', 'https://sdk.virtru.com/js/latest/auth-widget/index.js', array(), false, true);

/**
 * Adding scripts only for admin manage policy page
 * @param $hook
 */
function admin_scripts($hook) {
    wp_deregister_script('encrypt-script');
    $current_screen = get_current_screen();
    $post_type = $current_screen->post_type;
    if ($hook === 'post.php' && $post_type === 'nf_sub') {
        global $post;
        $id = $post->ID;
        wp_enqueue_script('decrypt-script', plugins_url( '/admin/assets/js/decrypt.js', __FILE__ ), array(), false, true);
        wp_localize_script( 'decrypt-script', 'editData', array(
            'post' => $id
        ));
    }
}

add_action('admin_enqueue_scripts', 'admin_scripts');

function the_slug_exists($post_name) {
    global $wpdb;
    if($wpdb->get_row("SELECT post_name FROM wp_posts WHERE post_name = '" . $post_name . "'", 'ARRAY_A')) {
        return true;
    } else {
        return false;
    }
}

/**
 * Creating public manage policy page
 */
function add_policy_page() {
    $policy_page_title = 'Virtru Policy Management';
    $policy_page_name = 'virtru-policy-management';
    $policy_page_check = get_page_by_title($policy_page_title);
    $policy_page = array(
        'post_title'    => $policy_page_title,
        'post_content'  => '',
        'post_status'   => 'publish',
        'post_author'   => 1,
        'post_type'     => 'page',
        'post_name'     => $policy_page_name,
        'page_template'  => 'nf-virtru-policy-manage'
    );
    if(!isset($policy_page_check->ID) && !the_slug_exists($policy_page_name)){
        wp_insert_post($policy_page);
    }
}
add_policy_page();

/**
 * Replace page template for public manage policy page
 */
add_filter( 'page_template', 'virtru_policy_page_template' );
function virtru_policy_page_template($page_template)
{
    if (is_page( 'virtru-policy-management')) {
        $page_template = plugin_dir_path( __FILE__ ) . 'admin/templates/nf-virtru-policy-manage-wrapper.php';
    }
    return $page_template;
}



