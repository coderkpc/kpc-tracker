/*
 * @Author: 柯芃丞 kepengcheng314@163.com
 * @Date: 2022-09-10 13:26:00
 * @Description: 类型声明
 * 
 */

/**
 * @requestUrl 接口地址
 * @historyTracker history上报
 * @hashTracker hash上报
 * @domTracker 携带Tracker-key 点击事件上报
 * @sdkVersion sdk版本
 * @extra 透传字段
 * @jsError js 和 Promise报错异常上报
 */
export interface DefaultOptions {
  uuid: string | undefined,
  requestUrl: string | undefined,
  historyTracker: boolean,
  hashTracker: boolean,
  domTracker: boolean,
  sdkVersion: string | number,
  extra: Record<string, any> | undefined,
  jsError: boolean
}

// 用户传入的参数 只有url必填
export interface Options extends Partial<DefaultOptions> {
  requestUrl: string,
}

export enum TrackerConfig {
  sdkVerion = '1.0.0'
}
