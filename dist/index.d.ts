/**
 * @requestUrl 接口地址
 * @historyTracker history上报
 * @hashTracker hash上报
 * @domTracker 携带Tracker-key 点击事件上报
 * @sdkVersion sdk版本
 * @extra 透传字段
 * @jsError js 和 Promise报错异常上报
 */
interface DefaultOptions {
    uuid: string | undefined;
    requestUrl: string | undefined;
    historyTracker: boolean;
    hashTracker: boolean;
    domTracker: boolean;
    sdkVersion: string | number;
    extra: Record<string, any> | undefined;
    jsError: boolean;
}
interface Options extends Partial<DefaultOptions> {
    requestUrl: string;
}

declare class Tracker {
    data: Options;
    constructor(options: Options);
    private initDefault;
    setUserId<T extends DefaultOptions['uuid']>(uuid: T): void;
    setExtra<T extends DefaultOptions['extra']>(extra: T): void;
    sendTracker<T>(data: T): void;
    private targetKeyReport;
    private jsError;
    private errorEvent;
    private promiseReject;
    private captureEvents;
    private installTracker;
    private reportTracker;
}

export { Tracker as default };
