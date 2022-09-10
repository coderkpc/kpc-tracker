(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.tracker = factory());
})(this, (function () { 'use strict';

  /*
   * @Author: 柯芃丞 kepengcheng314@163.com
   * @Date: 2022-09-10 13:26:00
   * @Description: 类型声明
   *
   */
  var TrackerConfig;
  (function (TrackerConfig) {
      TrackerConfig["sdkVerion"] = "1.0.0";
  })(TrackerConfig || (TrackerConfig = {}));

  /*
   * @Author: 柯芃丞 kepengcheng314@163.com
   * @Date: 2022-09-10 13:26:00
   * @Description: 页面访问量，PageView，每次对网站的访问均被记录
   * 主要监听history和hash
   *
   */
  const createHistoryEvent = (type) => {
      // 获取原始函数
      const origin = history[type];
      // 返回一个高阶函数
      return function () {
          // 调用原始函数
          const res = origin.apply(this, arguments);
          // 1. 自定义一个事件
          const e = new Event(type);
          // 2. 派发事件
          window.dispatchEvent(e);
          // 返回原始结果
          return res;
      };
  };

  /*
   * @Author: 柯芃丞 kepengcheng314@163.com
   * @Date: 2022-09-10 13:25:57
   * @Description: Tracker类
   *
   */
  // 鼠标事件
  const MouseEventList = ['click', 'dblclick', 'contextmenu', 'mousedown', 'mouseup', 'mouseenter', 'mouseout', 'mouseover'];
  class Tracker {
      constructor(options) {
          // 用户传入的参数覆盖默认参数
          this.data = Object.assign(this.initDefault(), options);
          this.installTracker();
      }
      // 默认参数
      initDefault() {
          // 重写history方法
          window.history['pushState'] = createHistoryEvent('pushState');
          window.history['replaceState'] = createHistoryEvent('replaceState');
          return {
              sdkVersion: TrackerConfig.sdkVerion,
              historyTracker: false,
              hashTracker: false,
              domTracker: false,
              jsError: false
          };
      }
      // 设置用户id
      setUserId(uuid) {
          this.data.uuid = uuid;
      }
      // 透传字段设置
      setExtra(extra) {
          this.data.extra = extra;
      }
      // 手动上报
      sendTracker(data) {
          this.reportTracker(data);
      }
      // dom上报
      targetKeyReport() {
          MouseEventList.forEach(event => {
              window.addEventListener(event, (e) => {
                  // 断言成一个元素
                  const target = e.target;
                  // 读取属性
                  const targetKey = target.getAttribute('target-key');
                  if (targetKey) {
                      this.reportTracker({
                          event,
                          targetKey
                      });
                  }
              });
          });
      }
      jsError() {
          this.errorEvent();
          this.promiseReject();
      }
      // js error上报
      errorEvent() {
          window.addEventListener('error', event => {
              this.reportTracker({
                  event: 'error',
                  targetKey: 'message',
                  message: event.message,
              });
          });
      }
      // promise错误上报
      promiseReject() {
          window.addEventListener('unhandledrejection', event => {
              event.promise.catch(error => {
                  this.reportTracker({
                      event: 'Promise',
                      targetKey: 'message',
                      message: error
                  });
              });
          });
      }
      // 事件捕获器
      captureEvents(mouseEventList, targetKey, data) {
          mouseEventList.forEach(event => {
              window.addEventListener(event, () => {
                  // 数据上报
                  this.reportTracker({
                      event,
                      targetKey,
                      data
                  });
              });
          });
      }
      installTracker() {
          // 是否开启historyTracker
          if (this.data.historyTracker) {
              this.captureEvents(['pushState', 'replaceState', 'popstate'], 'history-pv');
          }
          // 是否开启hashTracker
          if (this.data.hashTracker) {
              this.captureEvents(['hashchange'], 'hash-pv');
          }
          // 是否开启domTracker
          if (this.data.domTracker) {
              this.targetKeyReport();
          }
          // 是否开启js上报
          if (this.data.jsError) {
              this.jsError();
          }
      }
      reportTracker(data) {
          // 定义参数
          const params = Object.assign(this.data, data, {
              time: new Date().getTime()
          });
          // 定义请求头
          let headers = {
              type: 'application/x-www-form-urlencoded'
          };
          let blob = new Blob([JSON.stringify(params)], headers);
          // 这个api在页面关闭后仍然会请求，适合做埋点
          navigator.sendBeacon(this.data.requestUrl, blob);
      }
  }

  return Tracker;

}));
