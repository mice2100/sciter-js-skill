#ifndef __MAINWND_H__
#define __MAINWND_H__

#include "sciter-x-window.hpp"

class mainWnd : public sciter::window
{
public:
    mainWnd() : window(SW_TITLEBAR | SW_RESIZEABLE | SW_CONTROLS | SW_MAIN | SW_ENABLE_DEBUG) {}

    // ============================================================
    // NATIVE FUNCTIONS - Exposed to JavaScript via assetInterface
    // ============================================================
    // Call from JS as: Window.this.assetInterface.functionName(args...)

    // Example: String concatenation
    std::string stringSum(const std::string a, const std::string b) {
        return a + "+" + b;
    }

    // Example: Add two integers
    int addIntegers(int a, int b) {
        return a + b;
    }

    // Example: Open a file dialog (returns selected file path)
    std::string openFileDialog(const std::string& title, const std::string& filter) {
        #ifdef _WIN32
        // Windows implementation
        OPENFILENAMEW ofn = {0};
        WCHAR szFile[260] = {0};

        ofn.lStructSize = sizeof(ofn);
        ofn.hwndOwner = get_hwnd();
        ofn.lpstrFile = szFile;
        ofn.nMaxFile = sizeof(szFile) / sizeof(WCHAR);
        ofn.lpstrTitle = std::wstring(filter.begin(), filter.end()).c_str();
        ofn.Flags = OFN_FILEMUSTEXIST | OFN_PATHMUSTEXIST;

        if (GetOpenFileNameW(&ofn)) {
            std::wstring ws(szFile);
            return std::string(ws.begin(), ws.end());
        }
        #elif defined(__APPLE__)
        // macOS implementation - add NSOpenPanel code here
        #endif
        return "";
    }

    // ============================================================
    // VIRTUAL PROPERTIES - Read-only properties exposed to JS
    // ============================================================
    // Access from JS as: Window.this.assetInterface.propertyName

    int get_windowHandle() {
        return (int)(intptr_t)get_hwnd();
    }

    std::string get_appVersion() {
        return "1.0.0";
    }

    // ============================================================
    // ASSET INTERFACE DEFINITION
    // ============================================================
    // This defines the bridge between C++ and JavaScript

    SOM_PASSPORT_BEGIN_EX(assetInterface, mainWnd)
        SOM_FUNCS(
            SOM_FUNC(stringSum)
            SOM_FUNC(addIntegers)
            SOM_FUNC(openFileDialog)
        )
        SOM_PROPS(
            SOM_RO_VIRTUAL_PROP(windowHandle, get_windowHandle)
            SOM_RO_VIRTUAL_PROP(appVersion, get_appVersion)
        )
    SOM_PASSPORT_END

    // ============================================================
    // NAMED CALL HANDLER - Alternative function exposure method
    // ============================================================
    // Call from JS as: Window.this.xcall("functionName", args...)

    BEGIN_FUNCTION_MAP
    FUNCTION_1("xcallTest", xcallTest)
    END_FUNCTION_MAP

    sciter::value xcallTest(sciter::value data) {
        return data.get<int>() * 2;
    }

    // ============================================================
    // EVENT HANDLERS - Override to handle DOM events
    // ============================================================

    virtual bool on_event(HELEMENT he, BEHAVIOR_EVENT_PARAMS& params) {
        switch (params.cmd) {
            case BUTTON_CLICK:
                // Handle button click
                // params.he is the element that sent the event
                return true;

            case SUBMIT:
                // Handle form submission
                return true;

            case EDIT_VALUE_CHANGED:
                // Handle text input change
                return true;
        }
        return false; // Let default handler process
    }

    virtual bool on_script_call(HELEMENT he, LPCSTR name, UINT argc, const sciter::value* argv, sciter::value& retval) {
        // Alternative method for handling JS calls
        // Override this to handle dynamic function calls
        return sciter::window::on_script_call(he, name, argc, argv, retval);
    }
};

#endif
