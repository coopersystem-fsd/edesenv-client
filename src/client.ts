import { EdesenvClientConfig } from './contracts/client-config.interface';
import axios from 'axios';
import axiosCookieJarSupport from 'axios-cookiejar-support';
import tough from 'tough-cookie';

const baseUrl = 'http://edesenv3.coopersystem.com.br/edesenv2';

axios.defaults.baseURL = baseUrl;

axiosCookieJarSupport(axios);
const cookieJar = new tough.CookieJar();

function hourMinuteToDate(time: string) {
  const today = new Date(Date.now());
  const [hours, minutes] = time.split(':');

  today.setHours(+hours);
  today.setMinutes(+minutes);

  return today;
}

export class EdesenvClient {
  constructor(private readonly config: EdesenvClientConfig) {}

  private async _doLogin() {
    const { username, password } = this.config;
    await axios.post(
      '/usuarios/login',
      {
        Usuario: {
          username,
          password,
        },
      },
      {
        jar: cookieJar,
        withCredentials: true,
      }
    );
  }

  async getCheckPointEntriesToday(): Promise<Date[]> {
    await this._doLogin();

    const { data } = await axios.get('/alocacoes/get_entradas_saidas', {
      jar: cookieJar,
      withCredentials: true,
    });

    const matches = data.match(
      /(?<=<div id="content" style="display:none">)\s+(.*?)\s+(?=<\/div>)/gm
    );

    if (!matches) {
      throw new Error(
        "Failed to obtain check point entries from Edesenv. Please, check if it's working fine!"
      );
    }

    const [allocationDataString] = matches;

    const {
      Alocacao: { hh_entrada_1, hh_entrada_2, hh_sai_1, hh_sai_2 },
    } = JSON.parse(allocationDataString.trim()) as {
      Alocacao: {
        hh_entrada_1?: string;
        hh_entrada_2?: string;
        hh_sai_1?: string;
        hh_sai_2?: string;
      };
    };

    if (!hh_entrada_1) {
      return [];
    }

    const entries = [];

    entries.push(hourMinuteToDate(hh_entrada_1));
    if (hh_sai_1) {
      entries.push(hourMinuteToDate(hh_sai_1));
    }
    if (hh_entrada_2) {
      entries.push(hourMinuteToDate(hh_entrada_2));
    }
    if (hh_sai_2) {
      entries.push(hourMinuteToDate(hh_sai_2));
    }

    return entries;
  }
}
