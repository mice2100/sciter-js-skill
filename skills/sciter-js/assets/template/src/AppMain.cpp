#include "sciter-x-api.h"
#include "sciter-x-window.hpp"
#include "mainWnd.h"
#include "spdlog/spdlog.h"

#ifdef LOCAL_MODE
const unsigned char resources[] = {0x00};
#else
#include "resources.cpp"
#endif

#include <filesystem>
#include <algorithm>

#ifdef _WIN32
#include <windows.h>
#elif defined(__APPLE__)
#include <mach-o/dyld.h>
#else
#include <unistd.h>
#endif

// ============================================================
// Platform-specific path utilities
// ============================================================

#ifdef WIN32
    sciter::string GetAppPath()
    {
        WCHAR path[_MAX_PATH] = {0};
        GetModuleFileNameW(NULL, path, _MAX_PATH);
        *wcsrchr(path, L'\\') = '\0';
        return sciter::string(path);
    }
#else
    sciter::string GetAppPath()
    {
        sciter::string appPath = sciter::application::argv()[0];
        std::size_t found = appPath.find_last_of(u"/");
        return appPath.substr(0, found);
    }
#endif

sciter::string Path2Url(const wchar_t* path)
{
    sciter::string url = WSTR("file://");
    url = url + sciter::string(path);
    std::replace(std::begin(url), std::end(url), L'\\', L'/');
    return url;
}

// ============================================================
// Application entry point
// ============================================================
// Note: Always use uimain() as entry point for Sciter apps
// Do NOT use main() or WinMain() directly

int uimain(std::function<int()> run)
{
    // Configure Sciter script runtime options
    UINT script_options = ALLOW_FILE_IO       // Allow file system access
                      | ALLOW_SOCKET_IO      // Allow network access
                      | ALLOW_SYSINFO        // Allow system info access
                      | ALLOW_EVAL           // Allow eval()
                      | SCITER_SET_SCRIPT_RUNTIME_FEATURES;

    SciterSetOption(nullptr, SCITER_SET_SCRIPT_RUNTIME_FEATURES, script_options);

#ifdef CONSOLE
    // Enable debug console for development
    spdlog::set_level(spdlog::level::debug);
    spdlog::debug("Sciter app starting in debug mode");
    sciter::debug_output_console console;
    SciterSetOption(nullptr, SCITER_SET_DEBUG_MODE, TRUE);
#endif

    // ========================================================
    // Determine UI resource loading mode
    // ========================================================
    // LOCAL_MODE: Load from file system (development)
    // Archive mode: Load from compiled resources (production)

    sciter::string appBaseUrl;

#ifdef LOCAL_MODE
    // Development mode - load from ui/ folder
    sciter::string strRoot = GetAppPath();
    strRoot += WSTR("/ui/main.htm");
    appBaseUrl = Path2Url(strRoot.c_str());

    #ifdef CONSOLE
    spdlog::debug("Loading UI from: {}", (const char*)sciter::string::utf8(appBaseUrl).c_str());
    #endif
#else
    // Production mode - load from compiled resources
    sciter::archive::instance().open(aux::elements_of(resources));
    appBaseUrl = WSTR("this://app/main.htm");

    #ifdef CONSOLE
    spdlog::debug("Loading UI from compiled resources");
    #endif
#endif

    // ========================================================
    // Create and configure main window
    // ========================================================

    sciter::om::hasset<mainWnd> pMainWnd = new mainWnd();

    // Register window as global asset (accessible from all frames)
    SciterSetGlobalAsset(pMainWnd);

    // Load the UI
    pMainWnd->load(appBaseUrl.c_str());

    // ========================================================
    // Run the application
    // ========================================================

    int ret = run();

#ifdef CONSOLE
    spdlog::debug("Sciter app exiting");
#endif

    return ret;
}
