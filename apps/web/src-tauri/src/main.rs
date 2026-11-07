// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::io::Write;
use std::net::TcpStream;
use std::time::Duration;

#[derive(Debug, Serialize, Deserialize)]
pub struct PrinterInfo {
    pub name: String,
    pub is_default: bool,
    pub port: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PrintResponse {
    pub success: bool,
    pub message: String,
    pub bytes_written: usize,
}

/// Lists all installed Windows printers using Windows spooler API
#[tauri::command]
fn list_printers() -> Result<Vec<PrinterInfo>, String> {
    #[cfg(target_os = "windows")]
    {
        use std::ptr::null_mut;
        use winapi::um::winspool::{EnumPrintersW, PRINTER_ENUM_LOCAL, PRINTER_ENUM_CONNECTIONS, PRINTER_INFO_2W};

        let mut bytes_needed = 0;
        let mut count = 0;

        unsafe {
            EnumPrintersW(
                PRINTER_ENUM_LOCAL | PRINTER_ENUM_CONNECTIONS,
                null_mut(),
                2,
                null_mut(),
                0,
                &mut bytes_needed,
                &mut count,
            );
        }

        if bytes_needed == 0 {
            return Ok(vec![]);
        }

        let mut buffer: Vec<u8> = vec![0; bytes_needed as usize];

        let success = unsafe {
            EnumPrintersW(
                PRINTER_ENUM_LOCAL | PRINTER_ENUM_CONNECTIONS,
                null_mut(),
                2,
                buffer.as_mut_ptr(),
                bytes_needed,
                &mut bytes_needed,
                &mut count,
            )
        };

        if success == 0 {
            return Err("Failed to enumerate Windows printers".into());
        }

        let mut printers = Vec::new();
        let p_info = buffer.as_ptr() as *const PRINTER_INFO_2W;

        for i in 0..count {
            unsafe {
                let info = &*p_info.offset(i as isize);
                let name = from_wide_ptr(info.pPrinterName);
                let port = from_wide_ptr(info.pPortName);
                printers.push(PrinterInfo {
                    name,
                    is_default: (info.Attributes & 0x00000004) != 0,
                    port,
                });
            }
        }

        Ok(printers)
    }

    #[cfg(not(target_os = "windows"))]
    {
        Ok(vec![
            PrinterInfo {
                name: "POS-80-Thermal-Default".into(),
                is_default: true,
                port: "USB001".into(),
            }
        ])
    }
}

/// Sends raw ESC/POS byte buffer directly to Windows print spooler
#[tauri::command]
fn print_raw_escpos(printer_name: String, data: Vec<u8>) -> Result<PrintResponse, String> {
    #[cfg(target_os = "windows")]
    {
        use std::ffi::OsStr;
        use std::os::windows::ffi::OsStrExt;
        use std::ptr::null_mut;
        use winapi::um::winspool::*;

        let wide_name: Vec<u16> = OsStr::new(&printer_name)
            .encode_wide()
            .chain(std::iter::once(0))
            .collect();

        let mut handle = null_mut();
        let open_res = unsafe { OpenPrinterW(wide_name.as_ptr() as *mut _, &mut handle, null_mut()) };
        if open_res == 0 || handle.is_null() {
            return Err(format!("Could not open printer '{}'", printer_name));
        }

        let doc_name: Vec<u16> = OsStr::new("RestaurantOS Bill")
            .encode_wide()
            .chain(std::iter::once(0))
            .collect();
        let data_type: Vec<u16> = OsStr::new("RAW")
            .encode_wide()
            .chain(std::iter::once(0))
            .collect();

        let mut doc_info = DOC_INFO_1W {
            pDocName: doc_name.as_ptr() as *mut _,
            pOutputFile: null_mut(),
            pDatatype: data_type.as_ptr() as *mut _,
        };

        let job_id = unsafe { StartDocPrinterW(handle, 1, &mut doc_info as *mut _ as *mut _) };
        if job_id == 0 {
            unsafe { ClosePrinter(handle) };
            return Err("StartDocPrinter failed".into());
        }

        unsafe { StartPagePrinter(handle) };

        let mut bytes_written = 0;
        let write_res = unsafe {
            WritePrinter(
                handle,
                data.as_ptr() as *mut _,
                data.len() as u32,
                &mut bytes_written,
            )
        };

        unsafe {
            EndPagePrinter(handle);
            EndDocPrinterW(handle);
            ClosePrinter(handle);
        }

        if write_res == 0 {
            return Err("WritePrinter raw buffer transfer failed".into());
        }

        Ok(PrintResponse {
            success: true,
            message: format!("Sent {} bytes to {}", bytes_written, printer_name),
            bytes_written: bytes_written as usize,
        })
    }

    #[cfg(not(target_os = "windows"))]
    {
        println!("[MOCK PRINT] {} bytes sent to {}", data.len(), printer_name);
        Ok(PrintResponse {
            success: true,
            message: format!("Mock printed {} bytes to {}", data.len(), printer_name),
            bytes_written: data.len(),
        })
    }
}

/// Sends raw ESC/POS bytes over TCP network socket (e.g. Ethernet / WiFi Kitchen Printer)
#[tauri::command]
fn print_network_escpos(host: String, port: u16, data: Vec<u8>) -> Result<PrintResponse, String> {
    let addr = format!("{}:{}", host, port);
    let mut stream = TcpStream::connect_timeout(
        &addr.parse().map_err(|e| format!("Invalid IP address '{}': {}", addr, e))?,
        Duration::from_secs(4),
    ).map_err(|e| format!("Failed to connect to IP printer at {}: {}", addr, e))?;

    stream.set_write_timeout(Some(Duration::from_secs(5)))
        .map_err(|e| format!("Set socket write timeout failed: {}", e))?;

    stream.write_all(&data)
        .map_err(|e| format!("Writing to socket {} failed: {}", addr, e))?;

    stream.flush()
        .map_err(|e| format!("Socket flush failed: {}", e))?;

    Ok(PrintResponse {
        success: true,
        message: format!("Successfully transmitted {} bytes to network printer at {}", data.len(), addr),
        bytes_written: data.len(),
    })
}

/// Triggers cash drawer kick pulse: ESC p 0 25 250 (Pin 2)
#[tauri::command]
fn kick_cash_drawer(printer_name: String) -> Result<PrintResponse, String> {
    let kick_pulse: Vec<u8> = vec![0x1B, 0x70, 0x00, 0x19, 0xFA];
    print_raw_escpos(printer_name, kick_pulse)
}

#[cfg(target_os = "windows")]
unsafe fn from_wide_ptr(ptr: *const u16) -> String {
    if ptr.is_null() {
        return String::new();
    }
    let mut len = 0;
    while *ptr.offset(len) != 0 {
        len += 1;
    }
    let slice = std::slice::from_raw_parts(ptr, len as usize);
    String::from_utf16_lossy(slice)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            list_printers,
            print_raw_escpos,
            print_network_escpos,
            kick_cash_drawer
        ])
        .run(tauri::generate_context!())
        .expect("error while running RestaurantOS Tauri application");
}
