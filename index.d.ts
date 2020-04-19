interface DebugManager {

    initServerUrlMap(serverUrlMap: object, currentUrl: string, changeCallback: (baseUrl: string) => void): DebugManager

    initDeviceInfo(deviceInfo: object): DebugManager;

    appendHttpLogs(params: object, response: object, parseResult?: object): void;

    appendWebViewLogs(loadUrl: string): void;

    appendLogs(text: string): void;

    showFloat(RootSiblings: object): void;
}

export var DebugManager: DebugManager;

