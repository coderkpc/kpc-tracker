/*
 * @Author: 柯芃丞 kepengcheng314@163.com
 * @Date: 2022-09-10 13:26:00
 * @Description: 页面访问量，PageView，每次对网站的访问均被记录
 * 主要监听history和hash
 * 
 */
export const createHistoryEvent = <T extends keyof History>(type: T) => {
  // 获取原始函数
  const origin = history[type]

  // 返回一个高阶函数
  return function () {
    // 调用原始函数
    const res = origin.apply(this, arguments)

    // 1. 自定义一个事件
    const e = new Event(type)

    // 2. 派发事件
    window.dispatchEvent(e)


    // 返回原始结果
    return res
  }
}