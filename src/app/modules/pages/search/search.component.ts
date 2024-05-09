import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaginationInstance } from 'ngx-pagination';
import { Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { EnvService } from 'src/app/env.service';
import { City } from 'src/app/interfaces/city';
import { Gazette, GazetteResponse } from 'src/app/interfaces/gazette';
import { Level } from 'src/app/interfaces/level';
import { LevelDescription, Pagination, SearchResponse } from 'src/app/interfaces/search';
import { Territory } from 'src/app/interfaces/territory';
import { GazetteService } from 'src/app/services/gazette/gazette.service';
import { TerritoryService } from 'src/app/services/territory/territory.service';

export interface DownloadSelection {
  selectAll: boolean;
  gazettes: SelectedGazette[];
}

export interface SelectedGazette extends Gazette {
  selected: boolean;
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.sass'],
})
export class SearchComponent implements OnInit {
  constructor(
    private env: EnvService,
    private router: Router,
    private route: ActivatedRoute,
    private territoryService: TerritoryService,
    private gazetteService: GazetteService
  ) {}
  term: string | undefined = undefined;
  territoryId: string | undefined = undefined;
  cityName: string | null = null;
  foundResult: boolean = false;
  searchResultMaxSize: number = this.env.qdApiSearchResultMaxSize;
  response: Observable<SearchResponse> = new Observable();
  city: Observable<City | null> = new Observable();
  levelDescription: LevelDescription | undefined = undefined;
  cities: string[] = [];
  levels: number[] = [];

  levelIcon: string | null = null;

  territories: Territory[] = [];

  gazetteResponse: GazetteResponse | null = null;

  pagination: Pagination = { itemsPerPage: 10, currentPage: 1 };

  selectedGazettes: Gazette[] = [];

  level$: Observable<Level | null> = of(null);

  @Output() pageBoundsCorrection = new EventEmitter();

  public config: PaginationInstance = {
    id: 'custom',
    itemsPerPage: 10,
    currentPage: 1,
  };

  orderOptions = [
    {
      viewValue: 'Relevância',
      value: 'relevance',
    },
    {
      viewValue: 'Mais recentes',
      value: 'descending_date',
    },
    {
      viewValue: 'Mais antigos',
      value: 'ascending_date',
    },
  ];

  //p: number = 0;
  p: number[] = [];

  page: number = 1;
  sort_by: string = 'relevance';
  pageChange(page: number) {
    const queryParams = this.route.snapshot.queryParams;
    this.router.navigate(['/pesquisa'], {
      queryParams: { ...queryParams, page },
    });
  }

  nextPage() {
    this.pageChange(Number(this.pagination.currentPage || 1) + 1);
  }

  previousPage() {
    this.pageChange(Number(this.pagination.currentPage) - 1);
  }

  firstPage() {
    this.pageChange(1);
  }

  lastPage() {
    const page =
      this.gazetteResponse && this.gazetteResponse.total_gazettes / 10;
    if (page) {
      this.pageChange(Math.ceil(page));
    }
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params.sort_by) {
        this.sort_by = params.sort_by;
      }

      this.levels = [];
      this.territories = [];
      if (params.city) {
        this.cities = Array.isArray(params.city) ? params.city : [params.city];
        this.getCities();
      }
      this.gazetteService
        .findAll({ ...params, territory_id: params.city })
        .pipe(take(1))
        .subscribe(
          (res) => {
            this.gazetteResponse = res;
            let pagination: Pagination = this.pagination;
            const totalItems = Math.ceil(res.total_gazettes / 10);
            pagination = {
              ...pagination,
              currentPage: params.page,
              totalItems,
            };
            this.pagination = pagination;
            this.setDownloadSelection(res.gazettes);
          },
          () => {
            this.gazetteResponse = { total_gazettes: 0 } as GazetteResponse;
          }
        );
    });
  }

  getCities() {
    this.cities.forEach((city) => {
      this.territoryService
        .findOne({ territoryId: city })
        .pipe(take(1))
        .subscribe((res) => {
          this.territories.push(res);
          const level = parseInt(res.level);
          if (!this.levels.includes(level)) {
            this.levels.push(level);
          }
        });
    });
  }

  openFile(link: string) {
    window.open(link);
  }

  orderChanged(sort_by: string) {
    const queryParams = this.route.snapshot.queryParams;
    this.router.navigate(['/pesquisa'], {
      queryParams: { ...queryParams, sort_by },
    });
  }

  previous() {}

  // @todo export to utils
  extractUrlDomain(url: string): string {
    return url
      .replace(/www.|https:\/\/|http:\/\//g, '')
      .replace(/(br).*/, 'br');
  }

  formatText(text: string): string {
    return text.replace('\n', '<br />');
  }

  downloadCSVs() {
    console.log('Download->>', this.downloadSelection, this.selectedGazettes);
  }

  get getQntSelected() {
    if (this.selectedGazettes.length === 0) {
      return '';
    }

    return ' (' + this.selectedGazettes.length + ')';
  }

  qntSelected = 0;
  allSelected = false;
  downloadSelection: DownloadSelection = {
    selectAll: false,
    gazettes: [],
  };

  setDownloadSelection(res: Gazette[]) {
    this.downloadSelection.gazettes = res.map((excerpt) => {
      if (this.selectedGazettes.includes(excerpt)) {
        return { ...excerpt, selected: true };
      }
      return { ...excerpt, selected: false };
    });
  }

  updateDownloadArray(selected: boolean, gazette: SelectedGazette) {
    if (gazette.selected && !this.selectedGazettes.includes(gazette)) {
      this.selectedGazettes.push(gazette);
    } else if (!gazette.selected && this.selectedGazettes.includes(gazette)) {
      this.selectedGazettes = this.selectedGazettes.filter(
        (g) => g !== gazette
      );
    }
  }

  updateSelectAll() {
    this.allSelected = this.downloadSelection.gazettes.every((gazzete) => {
      gazzete.selected;
    });
    this.downloadSelection.gazettes.map((gazette) => {
      this.updateDownloadArray(gazette.selected, gazette);
    });
  }

  someSelected() {
    if (!this.downloadSelection.gazettes) {
      return false;
    }
    return (
      this.downloadSelection.gazettes.filter((excerpt) => excerpt.selected)
        .length > 0 && !this.allSelected
    );
  }

  setAllSelected(selected: boolean) {
    this.allSelected = selected;
    if (!this.downloadSelection.gazettes) {
      return;
    }
    this.downloadSelection.gazettes.forEach((excerpt) => {
      excerpt.selected = selected;
      this.updateDownloadArray(selected, excerpt);
    });
  }
}
