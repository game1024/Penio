// MIT License
//
// Copyright (c) 2026 game1024
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::TrayIconBuilder,
    App, AppHandle, Manager,
};
use tauri_plugin_shell::ShellExt;

/// 创建系统托盘图标
#[allow(dead_code)]
pub fn create_tray(app: &App) -> tauri::Result<()> {
    // 创建托盘菜单
    let menu = create_tray_menu(app)?;

    // 构建托盘图标
    let _tray = TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .tooltip("Penio")
        .menu(&menu)
        .show_menu_on_left_click(true) // 禁止左键显示菜单
        .icon_as_template(true)
        .on_menu_event(|app, event| handle_menu_event(app, event))
        .build(app)?;

    Ok(())
}

/// 创建托盘菜单
#[allow(dead_code)]
fn create_tray_menu(app: &App) -> tauri::Result<Menu<tauri::Wry>> {
    let menu = Menu::new(app)?;

    // 添加菜单项
    menu.append(&MenuItem::with_id(
        app,
        "show",
        "偏好设置",
        true,
        None::<&str>,
    )?)?;

    menu.append(&MenuItem::with_id(
        app,
        "refresh_monitors",
        "重置窗口",
        true,
        None::<&str>,
    )?)?;

    menu.append(&PredefinedMenuItem::separator(app)?)?;

    menu.append(&MenuItem::with_id(
        app,
        "website",
        "官网",
        true,
        None::<&str>,
    )?)?;

    menu.append(&PredefinedMenuItem::separator(app)?)?;

    menu.append(&MenuItem::with_id(
        app,
        "version",
        &format!("版本 {}", env!("CARGO_PKG_VERSION")),
        false,
        None::<&str>,
    )?)?;

    menu.append(&MenuItem::with_id(
        app,
        "restart",
        "重启应用",
        true,
        None::<&str>,
    )?)?;

    menu.append(&MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?)?;

    Ok(menu)
}

/// 处理托盘菜单事件
#[allow(dead_code)]
fn handle_menu_event(app: &AppHandle, event: tauri::menu::MenuEvent) {
    match event.id().as_ref() {
        "show" => {
            if let Some(window) = app.get_webview_window("console") {
                let _ = window.show();
                let _ = window.set_focus();
                let _ = window.unminimize();
            }
        }
        "hide" => {
            if let Some(window) = app.get_webview_window("console") {
                let _ = window.hide();
            }
        }
        "refresh_monitors" => {
            if let Err(e) = crate::refresh_motion_boards(app, true) {
                eprintln!("Failed to refresh motion boards: {}", e);
            }
        }
        "website" => {
            let _ = app.shell().open("https://www.fiofio.cn", None);
        }
        "restart" => {
            app.restart();
        }
        "quit" => {
            app.exit(0);
        }
        _ => {}
    }
}
