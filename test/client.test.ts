import axios from 'axios';
import axiosCookieJarSupport from 'axios-cookiejar-support';

import { EdesenvClient } from './../src';

axiosCookieJarSupport(axios);

jest.mock('axios');
jest.mock('axios-cookiejar-support');

const get = axios.get as jest.MockedFunction<typeof axios.get>;

describe('Edesenv client', () => {
  let client: EdesenvClient;

  beforeAll(() => {
    client = new EdesenvClient({
      username: 'samuel.martins',
      password: '@secret',
    });
    global.Date.now = jest.fn().mockReturnValue(new Date(2020, 1, 1).getTime());
  });

  describe('getCheckPointEntriesToday', () => {
    describe('When cannot get expected HTML response', () => {
      it('should throw an error', async () => {
        get.mockReturnValue(
          Promise.resolve({
            data: `<div>HTML not containing expected response</div>`,
          })
        );
        await expect(client.getCheckPointEntriesToday()).rejects.toThrowError(
          /Failed to obtain check point entries from Edesenv. Please, check if it's working fine!/
        );
      });
    });

    describe('Without check point entries', () => {
      beforeAll(() => {
        get.mockReturnValue(
          Promise.resolve({
            data: `<div id="content" style="display:none">
                              {"Alocacao":{"ent_aloca_1":null,"sai_aloca_1":null,"ent_aloca_2":null,"sai_aloca_2":null,"ip_ent_1":null,"ip_ent_2":null,"ip_ent_3":null,"ip_sai_1":null,"ip_sai_2":null,"ip_sai_3":null,"hh_entrada_1":null,"hh_entrada_2":null,"hh_entrada_3":null,"hh_sai_1":null,"hh_sai_2":null,"hh_sai_3":null}}            </div>`,
          })
        );
      });

      it('should return an empty array', async () => {
        const entries = await client.getCheckPointEntriesToday();
        expect(entries).toStrictEqual([]);
      });
    });

    describe.each([
      [
        `<div id="content" style="display:none">
                              {"Alocacao":{"ent_aloca_1":null,"sai_aloca_1":null,"ent_aloca_2":null,"sai_aloca_2":null,"ip_ent_1":null,"ip_ent_2":null,"ip_ent_3":null,"ip_sai_1":null,"ip_sai_2":null,"ip_sai_3":null,"hh_entrada_1":null,"hh_entrada_2":null,"hh_entrada_3":null,"hh_sai_1":null,"hh_sai_2":null,"hh_sai_3":null}}            </div>`,
        [],
      ],
      [
        `<div id="content" style="display:none">
                              {"Alocacao":{"ent_aloca_1":null,"sai_aloca_1":null,"ent_aloca_2":null,"sai_aloca_2":null,"ip_ent_1":null,"ip_ent_2":null,"ip_ent_3":null,"ip_sai_1":null,"ip_sai_2":null,"ip_sai_3":null,"hh_entrada_1":"08:00","hh_entrada_2":null,"hh_entrada_3":null,"hh_sai_1":null,"hh_sai_2":null,"hh_sai_3":null}}            </div>`,
        [new Date(2020, 1, 1, 8)],
      ],
      [
        `<div id="content" style="display:none">
                              {"Alocacao":{"ent_aloca_1":null,"sai_aloca_1":null,"ent_aloca_2":null,"sai_aloca_2":null,"ip_ent_1":null,"ip_ent_2":null,"ip_ent_3":null,"ip_sai_1":null,"ip_sai_2":null,"ip_sai_3":null,"hh_entrada_1":"08:00","hh_entrada_2":null,"hh_entrada_3":null,"hh_sai_1":"12:00","hh_sai_2":null,"hh_sai_3":null}}            </div>`,
        [new Date(2020, 1, 1, 8), new Date(2020, 1, 1, 12)],
      ],
      [
        `<div id="content" style="display:none">
                              {"Alocacao":{"ent_aloca_1":null,"sai_aloca_1":null,"ent_aloca_2":null,"sai_aloca_2":null,"ip_ent_1":null,"ip_ent_2":null,"ip_ent_3":null,"ip_sai_1":null,"ip_sai_2":null,"ip_sai_3":null,"hh_entrada_1":"08:00","hh_entrada_2":"13:00","hh_entrada_3":null,"hh_sai_1":"12:00","hh_sai_2":null,"hh_sai_3":null}}            </div>`,
        [
          new Date(2020, 1, 1, 8),
          new Date(2020, 1, 1, 12),
          new Date(2020, 1, 1, 13),
        ],
      ],
      [
        `<div id="content" style="display:none">
                              {"Alocacao":{"ent_aloca_1":null,"sai_aloca_1":null,"ent_aloca_2":null,"sai_aloca_2":null,"ip_ent_1":null,"ip_ent_2":null,"ip_ent_3":null,"ip_sai_1":null,"ip_sai_2":null,"ip_sai_3":null,"hh_entrada_1":"08:00","hh_entrada_2":"13:00","hh_entrada_3":null,"hh_sai_1":"12:00","hh_sai_2":"18:00","hh_sai_3":null}}            </div>`,
        [
          new Date(2020, 1, 1, 8),
          new Date(2020, 1, 1, 12),
          new Date(2020, 1, 1, 13),
          new Date(2020, 1, 1, 18),
        ],
      ],
    ])('With response %s', (data: string, entries: Date[]) => {
      it('should return entries', async () => {
        get.mockReturnValue(
          Promise.resolve({
            data,
          })
        );
        const res = await client.getCheckPointEntriesToday();

        expect(res).toStrictEqual(entries);
      });
    });
  });
});
