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

use rdev::{Button, EventType, listen};
use std::sync::atomic::{AtomicI64, Ordering};
use std::thread;
use tauri::{AppHandle, Emitter, Manager, WindowEvent};
use tokio::time::{interval, Duration};

mod tray;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

#[tauri::command]
fn get_machine_id() -> Result<String, String> {
    machine_uid::get().map_err(|e| e.to_string())
}

#[tauri::command]
fn trigger_drawing_mode(app: AppHandle) {
    println!("切换绘图模式");
    focus_window_under_mouse(&app);
}

#[tauri::command]
async fn refresh_monitors(app: AppHandle, emit_event: bool) -> Result<(), String> {
    refresh_motion_boards(&app, emit_event).map_err(|e| {
        let error_msg = e.to_string();
        eprintln!("刷新显示器失败: {}", error_msg);
        error_msg
    })
}

#[cfg(target_os = "macos")]
use rdev::set_is_main_thread;

// 全局原子变量存储鼠标坐标（f64 的位表示）
static MOUSE_X: AtomicI64 = AtomicI64::new(0);
static MOUSE_Y: AtomicI64 = AtomicI64::new(0);

fn start_mouse_listener(app_handle: AppHandle) {
    #[cfg(target_os = "macos")]
    set_is_main_thread(false);

    thread::spawn(move || {
        if let Err(error) = listen(move |event| {
            match event.event_type {
                EventType::MouseMove { x, y } => {
                    // 将 f64 转为位表示存入原子
                    MOUSE_X.store(x.to_bits() as i64, Ordering::Relaxed);
                    MOUSE_Y.store(y.to_bits() as i64, Ordering::Relaxed);
                }
                EventType::ButtonPress(Button::Left) => {
                    // 从原子读取位表示并转回 f64
                    let x = f64::from_bits(MOUSE_X.load(Ordering::Relaxed) as u64);
                    let y = f64::from_bits(MOUSE_Y.load(Ordering::Relaxed) as u64);
                    let _ = app_handle.emit(
                        "mouse-click",
                        serde_json::json!({
                            "x": x,
                            "y": y
                        }),
                    );
                    let _ = app_handle.emit(
                        "key-press",
                        serde_json::json!({
                            "key": "LClick"
                        }),
                    );
                }
                EventType::ButtonRelease(Button::Left) => {
                    let _ = app_handle.emit(
                        "key-release",
                        serde_json::json!({
                            "key": "LClick"
                        }),
                    );
                }
                EventType::ButtonPress(Button::Right) => {
                    let _ = app_handle.emit(
                        "key-press",
                        serde_json::json!({
                            "key": "RClick"
                        }),
                    );
                }
                EventType::ButtonRelease(Button::Right) => {
                    let _ = app_handle.emit(
                        "key-release",
                        serde_json::json!({
                            "key": "RClick"
                        }),
                    );
                }
                EventType::ButtonPress(Button::Middle) => {
                    let _ = app_handle.emit(
                        "key-press",
                        serde_json::json!({
                            "key": "MClick"
                        }),
                    );
                }
                EventType::ButtonRelease(Button::Middle) => {
                    let _ = app_handle.emit(
                        "key-release",
                        serde_json::json!({
                            "key": "MClick"
                        }),
                    );
                }
                EventType::KeyPress(key) => {
                    // 发送键盘按下事件到前端
                    let key_name = format!("{:?}", key);
                    let _ = app_handle.emit(
                        "key-press",
                        serde_json::json!({
                            "key": key_name
                        }),
                    );
                    print!("Key Pressed: {:?}\n", key_name);
                }
                EventType::KeyRelease(key) => {
                    // 发送键盘释放事件到前端
                    let key_name = format!("{:?}", key);
                    let _ = app_handle.emit(
                        "key-release",
                        serde_json::json!({
                            "key": key_name
                        }),
                    );
                }
                _ => {}
            }
        }) {
            println!("Error: {:?}", error)
        }
    });
}

fn create_motion_board(
    app: &AppHandle,
    index: usize,
    monitor: &tauri::Monitor,
) -> Result<(), Box<dyn std::error::Error>> {
    let position = monitor.position();
    let size = monitor.size();

    println!(
        "Creating window for monitor {}: position={:?}, size={:?}",
        index, position, size
    );

    // 为每个屏幕创建一个窗口
    // 先设置窗口和边框不可见，避免在全屏的时候出现窗口缩放的动画
    let window_label = format!("motion-board-{}", index);
    let window = tauri::WebviewWindowBuilder::new(
        app,
        &window_label,
        tauri::WebviewUrl::App("/motion-board.html".into()),
    )
    .title(&format!("Motion Board {}", index))
    .inner_size(800.0, 600.0)
    .decorations(true)
    .always_on_top(true)
    .transparent(true)
    .shadow(false)
    .skip_taskbar(true) // 改为 true，避免绑定到单个虚拟桌面
    .visible(false)
    .visible_on_all_workspaces(true)
    .resizable(false)
    .devtools(false)
    .build()?;

    // 必须创建完窗口后再移动
    window
        .set_position(tauri::PhysicalPosition::new(position.x, position.y))
        .unwrap();

    // MacOS 需要手动设置窗口大小以适应屏幕, 参数为逻辑像素尺寸
    // Tips: 使用set_fullscreen会同时创建虚拟桌面
    let _scale = monitor.scale_factor();
    #[cfg(target_os = "macos")]
    {
        window.set_decorations(false).unwrap();
        window
            .set_size(tauri::PhysicalSize::new(
                size.width as f64,
                size.height as f64,
            ))
            .unwrap();

        // 设置 NSWindow 属性：关闭阴影不透明度，使用透明背景色
        use cocoa::appkit::{NSColor, NSWindow};
        use cocoa::base::{id, nil};

        if let Ok(ns_window) = window.ns_window() {
            unsafe {
                let ns_window = ns_window as id;
                let clear_color: id = NSColor::clearColor(nil);
                ns_window.setBackgroundColor_(clear_color);
                ns_window.setOpaque_(cocoa::base::NO);
                ns_window.setHasShadow_(cocoa::base::NO);
            }
        }
    }

    // Windows/Linux 直接使用全屏模式
    // Tips: 必须set_decorations=true, 否则顶部依然会有边框
    #[cfg(target_os = "windows")]
    {
        window.set_decorations(true).unwrap();
        window.set_fullscreen(true).unwrap();

        // Windows: 使用 HWND_TOPMOST 让窗口覆盖任务栏，但不影响其他应用
        // 并添加 WS_EX_NOACTIVATE 防止窗口激活影响下层视频播放

        // use windows::Win32::Foundation::HWND;
        // use windows::Win32::UI::WindowsAndMessaging::{
        //     SetWindowPos, HWND_TOPMOST, SWP_NOACTIVATE, SWP_NOMOVE, SWP_NOSIZE,
        // };

        // if let Ok(hwnd) = window.hwnd() {
        //     let hwnd = HWND(hwnd.0 as *mut std::ffi::c_void);
        //     unsafe {
        //         // 设置窗口为 TOPMOST
        //         let _ = SetWindowPos(
        //             hwnd,
        //             HWND_TOPMOST,
        //             0,
        //             0,
        //             0,
        //             0,
        //             SWP_NOMOVE | SWP_NOSIZE |  SWP_NOACTIVATE,
        //         );
        //     }
        // }
    }

    #[cfg(target_os = "linux")]
    {
        window.set_decorations(false).unwrap();
        window
            .set_size(tauri::PhysicalSize::new(
                size.width as f64,
                size.height as f64,
            ))
            .unwrap();
    }

    // 所有设置完成后显示窗口
    window.show().unwrap();
    println!("Window {} created successfully", window_label);

    Ok(())
}

fn create_motion_boards(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    // 获取所有可用的显示器
    let monitors = app.available_monitors()?;

    for (index, monitor) in monitors.iter().enumerate() {
        create_motion_board(app, index, monitor)?;
    }

    Ok(())
}

pub fn refresh_motion_boards(app: &AppHandle, emit_event: bool) -> Result<(), Box<dyn std::error::Error>> {
    println!("Refreshing motion boards...");

    if emit_event {
        let app_handle = app.app_handle().clone();
        app_handle.emit("refresh-monitors", ())?;
    }
    
    // 获取当前所有显示器
    let monitors = app.available_monitors()?;
    let monitor_count = monitors.len();

    // 获取所有现有的 motion-board 窗口
    let existing_windows: Vec<String> = app
        .webview_windows()
        .keys()
        .filter(|label| label.starts_with("motion-board-"))
        .cloned()
        .collect();

    println!(
        "Found {} monitors and {} existing windows",
        monitor_count,
        existing_windows.len()
    );

    // 删除多余的窗口
    for label in &existing_windows {
        if let Some(index_str) = label.strip_prefix("motion-board-") {
            if let Ok(index) = index_str.parse::<usize>() {
                if index >= monitor_count {
                    println!("Closing extra window: {}", label);
                    if let Some(window) = app.get_webview_window(label) {
                        let _ = window.close();
                    }
                }
            }
        }
    }

    // 创建缺失的窗口
    for (index, monitor) in monitors.iter().enumerate() {
        let window_label = format!("motion-board-{}", index);
        if !existing_windows.contains(&window_label) {
            println!("Creating missing window: {}", window_label);
            create_motion_board(app, index, monitor)?;
        } else {
            println!("Window {} already exists", window_label);
            // macOS: 复位现有窗口的位置和大小
            #[cfg(target_os = "macos")]
            if let Some(window) = app.get_webview_window(&window_label) {
                let pos = monitor.position();
                let size = monitor.size();
                let scale = monitor.scale_factor();

                println!("Resetting window {} position and size", window_label);
                let _ = window.set_position(tauri::PhysicalPosition::new(
                    pos.x,
                    pos.y + (22.0 * scale) as i32,
                ));
                let _ = window.set_size(tauri::PhysicalSize::new(
                    size.width as f64,
                    size.height as f64,
                ));
            }
        }
    }

    println!("Motion boards refresh completed");
    Ok(())
}

fn focus_window_under_mouse(app: &tauri::AppHandle) {
    #[cfg(target_os = "windows")]
    {
        // 从全局原子读取鼠标坐标（f64）
        let mouse_x = f64::from_bits(MOUSE_X.load(Ordering::Relaxed) as u64) as i32;
        let mouse_y = f64::from_bits(MOUSE_Y.load(Ordering::Relaxed) as u64) as i32;
        println!("Mouse position: ({}, {})", mouse_x, mouse_y);

        // 获取所有显示器信息
        // 判断鼠标是否在当前显示器范围内
        // 将鼠标所在显示器的窗口设置聚焦
        if let Ok(monitors) = app.available_monitors() {
            for (index, monitor) in monitors.iter().enumerate() {
                let pos = monitor.position();
                let size = monitor.size();

                if mouse_x >= pos.x
                    && mouse_x < pos.x + size.width as i32
                    && mouse_y >= pos.y
                    && mouse_y < pos.y + size.height as i32
                {
                    println!("Mouse is on monitor {}", index);
                    let window_label = format!("motion-board-{}", index);
                    if let Some(window) = app.get_webview_window(&window_label) {
                        println!("Toggling window: {}", window_label);
                        window
                            .emit_to(&window_label, "toggle-cursor-events", ())
                            .ok();
                        window.set_focus().ok();
                    }
                    break;
                }
            }
        }
    }

    #[cfg(target_os = "macos")]
    {
        // 从全局原子读取鼠标坐标（f64）
        let mouse_x = f64::from_bits(MOUSE_X.load(Ordering::Relaxed) as u64) as i32;
        let mouse_y = f64::from_bits(MOUSE_Y.load(Ordering::Relaxed) as u64) as i32;
        println!("Mouse position: ({}, {})", mouse_x, mouse_y);

        // 获取所有显示器信息
        // 判断鼠标是否在当前显示器范围内
        // 将鼠标所在显示器的窗口设置聚焦
        if let Ok(monitors) = app.available_monitors() {
            for (index, monitor) in monitors.iter().enumerate() {
                let pos = monitor.position();
                let size = monitor.size();
                let scale = monitor.scale_factor();

                if mouse_x >= (pos.x as f64 / scale) as i32
                    && mouse_x < (pos.x as f64 / scale + size.width as f64 / scale) as i32
                    && mouse_y >= (pos.y as f64 / scale) as i32
                    && mouse_y < (pos.y as f64 / scale + size.height as f64 / scale) as i32
                {
                    println!("Mouse is on monitor {}", index);
                    let window_label = format!("motion-board-{}", index);
                    if let Some(window) = app.get_webview_window(&window_label) {
                        window
                            .set_position(tauri::PhysicalPosition::new(
                                pos.x,
                                pos.y + (22.0 * scale) as i32,
                            ))
                            .unwrap();
                        window
                            .set_size(tauri::PhysicalSize::new(
                                size.width as f64,
                                size.height as f64,
                            ))
                            .unwrap();
                        println!("Toggling window: {}", window_label);
                        window
                            .emit_to(&window_label, "toggle-cursor-events", ())
                            .ok();
                        window.set_focus().ok();
                    }
                    break;
                }
            }
        }
    }

    #[cfg(target_os = "linux")]
    {
        // 从全局原子读取鼠标坐标（f64）
        let mouse_x = f64::from_bits(MOUSE_X.load(Ordering::Relaxed) as u64) as i32;
        let mouse_y = f64::from_bits(MOUSE_Y.load(Ordering::Relaxed) as u64) as i32;
        println!("Mouse position: ({}, {})", mouse_x, mouse_y);

        // 获取所有显示器信息
        // 判断鼠标是否在当前显示器范围内
        // 将鼠标所在显示器的窗口设置聚焦
        if let Ok(monitors) = app.available_monitors() {
            for (index, monitor) in monitors.iter().enumerate() {
                let pos = monitor.position();
                let size = monitor.size();

                if mouse_x >= pos.x
                    && mouse_x < pos.x + size.width as i32
                    && mouse_y >= pos.y
                    && mouse_y < pos.y + size.height as i32
                {
                    println!("Mouse is on monitor {}", index);
                    let window_label = format!("motion-board-{}", index);
                    if let Some(window) = app.get_webview_window(&window_label) {
                        window
                            .set_position(tauri::PhysicalPosition::new(pos.x, pos.y + (22) as i32))
                            .unwrap();
                        window
                            .set_size(tauri::PhysicalSize::new(
                                size.width as f64,
                                size.height as f64,
                            ))
                            .unwrap();
                        println!("Toggling window: {}", window_label);
                        window
                            .emit_to(&window_label, "toggle-cursor-events", ())
                            .ok();
                        window.set_focus().ok();
                    }
                    break;
                }
            }
        }
    }
}

#[cfg(debug_assertions)]
fn cleanup_windows(app: &AppHandle) {
    println!("Cleaning up all windows...");

    // 关闭所有 motion-board 窗口
    for (label, window) in app.webview_windows() {
        if label.starts_with("motion-board-") {
            println!("Closing window: {}", label);
            let _ = window.close();
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() -> Result<(), Box<dyn std::error::Error>> {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|_app, _args, _cwd| {}))
        .plugin(tauri_plugin_autostart::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            get_machine_id,
            trigger_drawing_mode,
            refresh_monitors
        ])
        .device_event_filter(tauri::DeviceEventFilter::Always)
        .setup(|app| {
            #[cfg(target_os = "macos")]
            {
                use tauri::{menu::MenuBuilder};
                // 创建一个空菜单来禁用默认的 Cmd+Q 行为
                let menu = MenuBuilder::new(app).build()?;
                app.set_menu(menu)?;
                
                // macOS: 隐藏 Dock 图标
                use cocoa::appkit::{
                    NSApp, NSApplication,
                    NSApplicationActivationPolicy::NSApplicationActivationPolicyAccessory,
                };
                unsafe {
                    let app_ns = NSApp();
                    app_ns.setActivationPolicy_(NSApplicationActivationPolicyAccessory);
                }
            }

            let app_handle = app.handle().clone();

            // 设置 Ctrl+C 信号处理器
            #[cfg(debug_assertions)]
            {
                let app_handle_clone = app_handle.clone();
                ctrlc::set_handler(move || {
                    println!("\n收到 Ctrl+C 信号，正在清理资源...");
                    cleanup_windows(&app_handle_clone);
                    println!("清理完成，退出程序");
                    std::process::exit(0);
                })
                .expect("设置 Ctrl+C 处理器失败");
            }

            // 给每一个屏幕创建motion-board窗口
            if let Err(e) = create_motion_boards(&app_handle) {
                eprintln!("Failed to create motion boards: {}", e);
            }

            start_mouse_listener(app_handle.clone());

            // 启动定时刷新显示器任务
            let app_handle_for_refresh = app_handle.clone();
            tauri::async_runtime::spawn(async move {
                let mut interval = interval(Duration::from_millis(1500));
                loop {
                    interval.tick().await;
                    if let Err(e) = refresh_motion_boards(&app_handle_for_refresh, false) {
                        eprintln!("定时刷新显示器失败: {}", e);
                    }
                }
            });

            Ok(())
        })
        .plugin(tauri_plugin_macos_permissions::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let _ = app
                .get_webview_window("console")
                .expect("no console window")
                .set_focus();
        }))
        .on_window_event(|window, event| match event {
            WindowEvent::CloseRequested { api, .. } => {
                // 只对 console 窗口拦截关闭事件，其他窗口正常关闭
                if window.label() == "console" {
                    let _ = window.hide();
                    api.prevent_close();
                }
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}
