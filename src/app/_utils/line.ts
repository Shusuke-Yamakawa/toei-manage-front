import axios from 'axios';
import qs from 'qs';

export const notify_line = async (msg: string) => {
  const LINE_TOKEN = 'Qeuzd60OWvkoG0ZbctkpkkWFb9fUmYJYcTDBujxypsV';
  const BASE_URL = 'https://notify-api.line.me';
  const PATH = '/api/notify';
  const config = {
    baseURL: BASE_URL,
    url: PATH,
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${LINE_TOKEN}`,
    },
    data: qs.stringify({
      message: `${msg}\nM1 社用`,
    }),
  };
  await axios.request(config);
};
