import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Download, DownloadsLabels, Gazette, GazetteQuery, GazetteResponse, Pagination } from 'src/app/interfaces/gazette';

@Injectable({
  providedIn: 'root',
})
export class GazetteService {
  constructor(private http: HttpClient) {}

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   *
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);

      // Let the app keep running by returning a default result.
      return of(result as T);
    };
  }

  pagination(page: number): Pagination {
    return { size: 10, offset: (page - 1) * 10 };
  }

  resolveGazetteDownloads(gazette: Gazette): Gazette {
    const downloads: Download[] = [];
    if (gazette.txt_url) {
      downloads.push({
        value: gazette.txt_url,
        viewValue: DownloadsLabels.TXT,
      });
    }
    downloads.push({ value: gazette.url, viewValue: DownloadsLabels.ORIGINAL });

    return { ...gazette, downloads };
  }

  resolveGazettes(res: GazetteResponse): GazetteResponse {
    const gazettes = res.gazettes.map((gazette: Gazette) =>
      this.resolveGazetteDownloads(gazette)
    );
    return { ...res, gazettes };
  }

  findAll(query: GazetteQuery): Observable<GazetteResponse> {
    const { term, territory_id, since, until, sort_by, page } = query;
    let queryParams = {};
    let territoryQuery = '';

    if (territory_id && !Array.isArray(territory_id)) {
      queryParams = { ...queryParams, territory_ids: territory_id };
    } else if (territory_id && territory_id.length) {
      (territory_id as string[]).forEach((id) => {
        territoryQuery += '&territory_ids=' + id;
      });
    }

    if (term) {
      queryParams = {
        ...queryParams,
        querystring: term,
        pre_tags: '<b>',
        post_tags: '</b>',
        excerpt_size: 500,
        number_of_excerpts: 1,
      };
    }

    if (since) {
      queryParams = { ...queryParams, published_since: since };
    }

    if (until) {
      queryParams = { ...queryParams, published_until: until };
    }

    if (sort_by) {
      queryParams = { ...queryParams, sort_by };
    }

    const pagination: Pagination = this.pagination(page || 1);
    queryParams = {
      ...queryParams,
      size: pagination.size,
      offset: pagination.offset,
    };

    const encodedQueryString = new URLSearchParams(queryParams).toString();
    const url = new URL(
      `/api/gazettes?${encodedQueryString}${territoryQuery}`,
      `http://localhost:8080`
    ).toString();

    let mock = {
      total_gazettes: 116,
      gazettes: [
        {
          territory_id: '5300108',
          date: '2024-01-25',
          scraped_at: '2024-01-25T23:11:44.323563',
          url: 'https://querido-diario.nyc3.cdn.digitaloceanspaces.com/5300108/2024-01-25/5ce79f06230671cf2e0abe890420e13ce5698d6f.pdf',
          territory_name: 'Brasília',
          state_code: 'DF',
          excerpts: [
            'FEDERAL, no uso das atribuições que lhe confere\n\no artigo 100, inciso VII da Lei Orgânica do Distrito Federal, DECRETA:\n\nArt. 1º Fica declarada situação de emergência no âmbito da saúde pública no Distrito Federal,\n\nem razão do risco de epidemia de <b>dengue</b> e outras arboviroses no Distrito Federal.\n\n§ 1º A situação de emergência de que trata este Decreto autoriza a adoção de todas as\n\nmedidas administrativas necessárias à contenção da epidemia, em especial, a aquisição\n\npública de insumos e materiais',
          ],
          is_extra_edition: true,
          txt_url:
            'https://querido-diario.nyc3.cdn.digitaloceanspaces.com/5300108/2024-01-25/5ce79f06230671cf2e0abe890420e13ce5698d6f.txt',
        },
        {
          territory_id: '5300108',
          date: '2024-01-26',
          scraped_at: '2024-01-26T22:55:56.312585',
          url: 'https://querido-diario.nyc3.cdn.digitaloceanspaces.com/5300108/2024-01-26/66a119b119da12ea81df9b7255992835ccee49f5.pdf',
          territory_name: 'Brasília',
          state_code: 'DF',
          excerpts: [
            'que lhe confere o\nartigo 100, inciso VII, da Lei Orgânica do Distrito Federal, DECRETA:\n\nCAPÍTULO I\nDISPOSIÇÕES GERAIS\n\nArt. 1º As medidas para enfrentamento da presença do mosquito transmissor do vírus da\n<b>dengue</b>, do vírus chikungunya e do vírus da zika e atual infecção intensificada da <b>dengue</b> e\noutras arboviroses, no âmbito do Distrito Federal, ficam definidas nos termos deste Decreto.\n\nCAPÍTULO II\nDO GRUPO EXECUTIVO\n\nArt. 2º Fica criado o Grupo Executivo para o desenvolvimento de ações de prevenção',
          ],
          is_extra_edition: true,
          txt_url:
            'https://querido-diario.nyc3.cdn.digitaloceanspaces.com/5300108/2024-01-26/66a119b119da12ea81df9b7255992835ccee49f5.txt',
        },
        {
          territory_id: '5300108',
          date: '2024-02-09',
          scraped_at: '2024-02-09T23:02:31.095532',
          url: 'https://querido-diario.nyc3.cdn.digitaloceanspaces.com/5300108/2024-02-09/2bcb7185e16c3df1abe55208069905e13aa21100.pdf',
          territory_name: 'Brasília',
          state_code: 'DF',
          excerpts: [
            'Hospitalar com características de suporte à Rede de Saúde\nna emergência pública de saúde decorrente do risco de epidemia de <b>dengue</b> e outras\narboviroses no Distrito Federal. Parágrafo único. O presidente do Conselho de\nAdministração (CONAD) fica autorizado a realizar todos os atos necessários ao combate\n\nda situação de emergência de saúde pública decorrente do risco de epidemia de <b>dengue</b> e\noutras arboviroses no Distrito Federal, ad referendum do colegiado."\nArt. 61. Este Estatuto entra em vigor após sua',
          ],
          is_extra_edition: true,
          txt_url:
            'https://querido-diario.nyc3.cdn.digitaloceanspaces.com/5300108/2024-02-09/2bcb7185e16c3df1abe55208069905e13aa21100.txt',
        },
        {
          territory_id: '5300108',
          date: '2024-03-15',
          scraped_at: '2024-03-16T22:49:47.422493',
          url: 'https://querido-diario.nyc3.cdn.digitaloceanspaces.com/5300108/2024-03-15/762b9673d31893fb39e744a4f5f5c9cf0ee001f9.pdf',
          territory_name: 'Brasília',
          state_code: 'DF',
          excerpts: [
            'Edital de Chamamento Público Nº 01/2024, que tem por objeto a\ncelebração de convênio com entidades, para finalidade de execução de serviços de instalação de 11\ntendas e prestação de serviços de atendimento e hidratação de pacientes acometidos pela <b>dengue</b> e\noutras arboviroses no Distrito Federal, no uso de sua competência resolve para fins de transparência o\nresultado definitivo, nos termos do Relatório 5 (136066765) que será disponibilizado no Site:\nhttps://www.saude.df.gov.br/chamamento-publico.',
          ],
          is_extra_edition: true,
          txt_url:
            'https://querido-diario.nyc3.cdn.digitaloceanspaces.com/5300108/2024-03-15/762b9673d31893fb39e744a4f5f5c9cf0ee001f9.txt',
        },
        {
          territory_id: '5300108',
          date: '2024-02-21',
          scraped_at: '2024-02-22T22:55:35.778393',
          url: 'https://querido-diario.nyc3.cdn.digitaloceanspaces.com/5300108/2024-02-21/7ed29003e19ef685328a1f4c3c3ee0562e7168c4.pdf',
          territory_name: 'Brasília',
          state_code: 'DF',
          excerpts: [
            '2005, e no art. 262 do Decreto Distrital nº 44.330, visando celebração\n\nde convênio com entidades, para finalidade de execução de serviços de instalação de\n\n11 tendas e prestação de serviços de atendimento e hidratação de pacientes\n\nacometidos pela <b>dengue</b> e outras arboviroses no Distrito Federal, regidos pelo\n\ndisposto na Lei nº 13.204, de 2015; Lei nº. 8.080/90, de 19 de setembro de 1990;\n\nDecreto nº 37.843, de 13 de dezembro de 2016; Decreto nº 39.600, de 28 de\n\ndezembro de 2018; Portaria nº 287/2022',
          ],
          is_extra_edition: true,
          txt_url:
            'https://querido-diario.nyc3.cdn.digitaloceanspaces.com/5300108/2024-02-21/7ed29003e19ef685328a1f4c3c3ee0562e7168c4.txt',
        },
        {
          territory_id: '5300108',
          date: '2024-01-25',
          scraped_at: '2024-01-25T23:11:48.252745',
          url: 'https://querido-diario.nyc3.cdn.digitaloceanspaces.com/5300108/2024-01-25/c5937c461b2618219aa492107879bf455033906c.pdf',
          territory_name: 'Brasília',
          state_code: 'DF',
          excerpts: [
            'YE01996606 PROVIMENTO\n\nFAUZI NACFUR JÚNIOR\n\nSECRETARIA DE ESTADO DE PROTEÇÃO\nDA ORDEM URBANÍSTICA - DF LEGAL\n\nPORTARIA N° 11, DE 22 DE JANEIRO DE 2024\nDispõe sobre a criação de Força-Tarefa, no âmbito da DF LEGAL, para prevenção, controle\ne combate à <b>dengue</b>.\nO SECRETÁRIO DE ESTADO DE PROTEÇÃO DA ORDEM URBANÍSTICA DO\nDISTRITO FEDERAL – DF LEGAL, no uso das atribuições que lhe confere o inciso III,\ndo parágrafo único, do artigo 105, da Lei Orgânica do Distrito Federal e com fundamento\nnos incisos I, II',
          ],
          is_extra_edition: false,
          txt_url:
            'https://querido-diario.nyc3.cdn.digitaloceanspaces.com/5300108/2024-01-25/c5937c461b2618219aa492107879bf455033906c.txt',
        },
        {
          territory_id: '5300108',
          date: '2022-05-11',
          scraped_at: '2022-05-11T11:23:34.918149',
          url: 'https://querido-diario.nyc3.cdn.digitaloceanspaces.com/5300108/2022-05-11/ac6b05ec5d2ac9950e194241bafc80f3819a240e.pdf',
          territory_name: 'Brasília',
          state_code: 'DF',
          excerpts: [
            'DISTRITO FEDERAL, por intermédio de sua\nSECRETARIA DE ESTADO DE SAÚDE DO DISTRITO FEDERAL e a empresa - PMH -\nPRODUTOS MEDICOS HOSPITALARES LTDA. CNPJ Nº 00.740.696/0001-92. Objeto:\nAQUISIÇÃO DE TESTE RÁPIDO PARA DETECÇÃO DE ANTÍGENO NS1 PARA O\nVÍRUS DA <b>DENGUE</b>, conforme Ata de Registro de Preço nº 000090/2021-SESDF e\nPedido de Aquisição de Material 5-22/PAM002068 e Autorização de Fornecimento de\nMaterial nº 5-22/AFM001812. VALOR: R$ 308.945,00 (trezentos e oito mil novecentos e\nquarenta e cinco reais),',
          ],
          is_extra_edition: false,
          txt_url:
            'https://querido-diario.nyc3.cdn.digitaloceanspaces.com/5300108/2022-05-11/ac6b05ec5d2ac9950e194241bafc80f3819a240e.txt',
        },
        {
          territory_id: '5300108',
          date: '2024-03-08',
          scraped_at: '2024-03-08T22:58:55.559645',
          url: 'https://querido-diario.nyc3.cdn.digitaloceanspaces.com/5300108/2024-03-08/dfb4dc15e8af3d638887cc51cdfa3683a4ffbef6.pdf',
          territory_name: 'Brasília',
          state_code: 'DF',
          excerpts: [
            'do\n\nCidadão em Combate a\n\n<b>Dengue</b>"\n\nVicente\n\nPires\n09\n\n09:00 às\n\n16:00\n\nRODRIGO DE\n\nMORAIS\n\nGUIMARAES\n\n254.764-3\n\n19ª Edição - Programa\n\n"GDF Mais Perto do\n\nCidadão em Combate a\n\n<b>Dengue</b>"\n\nVicente\n\nPires\n09\n\n09:00 às\n\n16:00\n\nMICHEL RAMOS\n\nRIBEIRO\n255.851-3\n\n19ª Edição - Programa\n\n"GDF Mais Perto do\n\nCidadão em Combate a\n\n<b>Dengue</b>"\n\nVicente\n\nPires\n09\n\n09:00 às\n\n16:00\n\nDANIELLE\n\nCRISTINE\n\nCARVALHO\n\n248.016-6\n\n19ª Edição - Programa\n\n"GDF Mais Perto do\n\nCidadão em Combate a\n\n<b>Dengue</b>"\n\nVicente\n\nPires\n10\n\n09:00',
          ],
          is_extra_edition: false,
          txt_url:
            'https://querido-diario.nyc3.cdn.digitaloceanspaces.com/5300108/2024-03-08/dfb4dc15e8af3d638887cc51cdfa3683a4ffbef6.txt',
        },
        {
          territory_id: '5300108',
          date: '2023-05-15',
          scraped_at: '2023-05-16T11:20:00.667558',
          url: 'https://querido-diario.nyc3.cdn.digitaloceanspaces.com/5300108/2023-05-15/9bf953211e9dff86442357582a3b5e5fee902955.pdf',
          territory_name: 'Brasília',
          state_code: 'DF',
          excerpts: [
            'saúde: visita domiciliar - saúde e comunidade.\navaliação das áreas de risco ambiental e sanitário; conceitos básicos, Noções básicas de\nepidemiologia, meio ambiente e saneamento, medidas de prevenção e controle de vetores;\nnoções básicas de doenças: <b>dengue</b>, zika, Chikungunya, febre amarela, Febre do Mayaro,\nmalária, leishmaniose visceral e tegumentar, febre do Nilo, doenças de chagas,\nesquistossomose, espécies sinantrópicas, hantavírus, leptospirose e raiva, carrapatos e\npulgas . animais peçonhentos',
          ],
          is_extra_edition: true,
          txt_url:
            'https://querido-diario.nyc3.cdn.digitaloceanspaces.com/5300108/2023-05-15/9bf953211e9dff86442357582a3b5e5fee902955.txt',
        },
        {
          territory_id: '5300108',
          date: '2020-01-24',
          scraped_at: '2021-12-16T18:27:51.229612',
          url: 'https://querido-diario.nyc3.cdn.digitaloceanspaces.com/5300108/2020-01-24/7a220037e1a775ff1aa8589519f01a732452a869.pdf',
          territory_name: 'Brasília',
          state_code: 'DF',
          excerpts: [
            'Distrito Federal, e considerando o artigo da 196 da Constituição\nFederal, DECRETA:\nArt. 1º Fica declarada situação de emergência no âmbito da saúde pública no Distrito Federal, pelo período de\n180 (cento e oitenta) dias, em razão do risco de epidemia de <b>dengue</b>, potencial epidemia de febre amarela e da\npossível introdução dos vírus Zika e Chikungunya no Distrito Federal, bem como da alteração do padrão de\nocorrência de microcefalias no Brasil.\nArt. 2º A situação de emergência de que trata este Decreto autoriza',
          ],
          is_extra_edition: true,
          txt_url:
            'https://querido-diario.nyc3.cdn.digitaloceanspaces.com/5300108/2020-01-24/7a220037e1a775ff1aa8589519f01a732452a869.txt',
        },
      ],
    };

    return this.http.get<GazetteResponse>(url).pipe(
      map((res: GazetteResponse) => {
        return this.resolveGazettes(res);
      }),
      catchError(this.handleError<GazetteResponse>(mock as GazetteResponse))
    );
  }
}
