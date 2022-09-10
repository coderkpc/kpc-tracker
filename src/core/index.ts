/*
 * @Author: 柯芃丞 kepengcheng314@163.com
 * @Date: 2022-09-10 13:25:57
 * @Description: Tracker类
 * 
 */
import { DefaultOptions, TrackerConfig, Options } from "../types/index";
import { createHistoryEvent } from "../utils/pv";

// 鼠标事件
const MouseEventList: string[] = ['click', 'dblclick', 'contextmenu', 'mousedown', 'mouseup', 'mouseenter', 'mouseout', 'mouseover']

export default class Tracker {
  public data: Options;
  constructor(options: Options) {
    // 用户传入的参数覆盖默认参数
    this.data = Object.assign(this.initDefault(), options)
    this.installTracker()
  }
  // 默认参数
  private initDefault(): DefaultOptions {
    // 重写history方法
    window.history['pushState'] = createHistoryEvent('pushState')
    window.history['replaceState'] = createHistoryEvent('replaceState')
    return <DefaultOptions>{
      sdkVersion: TrackerConfig.sdkVerion,
      historyTracker: false,
      hashTracker: false,
      domTracker: false,
      jsError: false
    }
  }

  // 设置用户id
  public setUserId<T extends DefaultOptions['uuid']>(uuid: T) {
    this.data.uuid = uuid
  }

  // 透传字段设置
  public setExtra<T extends DefaultOptions['extra']>(extra: T) {
    this.data.extra = extra
  }

  // 手动上报
  public sendTracker<T>(data: T) {
    this.reportTracker(data)
  }

  // dom上报
  private targetKeyReport() {
    MouseEventList.forEach(event => {
      window.addEventListener(event, (e) => {
        // 断言成一个元素
        const target = e.target as HTMLElement
        // 读取属性
        const targetKey = target.getAttribute('target-key')
        if (targetKey) {
          this.reportTracker({
            event,
            targetKey
          })
        }
      })
    })
  }

  private jsError() {
    this.errorEvent()
    this.promiseReject()
  }

  // js error上报
  private errorEvent() {
    window.addEventListener('error', event => {
      this.reportTracker({
        event: 'error',
        targetKey: 'message',
        message: event.message,
      })
    })
  }

  // promise错误上报
  private promiseReject() {
    window.addEventListener('unhandledrejection', event => {
      event.promise.catch(error => {
        this.reportTracker({
          event: 'Promise',
          targetKey: 'message',
          message: error
        })
      })
    })
  }

  // 事件捕获器
  private captureEvents<T>(mouseEventList: string[], targetKey: string, data?: T) {
    mouseEventList.forEach(event => {
      window.addEventListener(event, () => {
        // 数据上报
        this.reportTracker({
          event,
          targetKey,
          data
        })
      })
    })
  }

  private installTracker() {
    // 是否开启historyTracker
    if (this.data.historyTracker) {
      this.captureEvents(['pushState', 'replaceState', 'popstate'], 'history-pv')
    }
    // 是否开启hashTracker
    if (this.data.hashTracker) {
      this.captureEvents(['hashchange'], 'hash-pv')
    }
    // 是否开启domTracker
    if (this.data.domTracker) {
      this.targetKeyReport()
    }
    // 是否开启js上报
    if (this.data.jsError) {
      this.jsError()
    }
  }

  private reportTracker<T>(data: T) {
    // 定义参数
    const params = Object.assign(this.data, data, {
      time: new Date().getTime()
    })
    // 定义请求头
    let headers = {
      type: 'application/x-www-form-urlencoded'
    }

    let blob = new Blob([JSON.stringify(params)], headers)
    // 这个api在页面关闭后仍然会请求，适合做埋点
    navigator.sendBeacon(this.data.requestUrl, blob)
  }
}