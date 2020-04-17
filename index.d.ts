interface DebugManager {

    initServerUrlMap(serverUrlMap: object, currentUrl: string, changeCallback: (baseUrl: string) => void): void

    initDeviceInfo(deviceInfo: object): void;

    appendHttpLogs(params: object, response: object, parseResult: object): void;

    appendWebViewLogs(loadUrl: string): void;

    appendLogs(text: string): void;

    showFloat(sibling: object): void;
}

export var DebugManager: DebugManager;

