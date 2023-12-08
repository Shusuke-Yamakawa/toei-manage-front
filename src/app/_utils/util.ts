// eslint-disable-next-line no-promise-executor-return
export const sleep = async (delay: number) => new Promise((resolve) => setTimeout(resolve, delay));
