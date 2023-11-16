import { HttpClient } from "@angular/common/http";
import { Component } from "@angular/core";
import {
  ColDef,
  GridReadyEvent,
  IServerSideDatasource,
  RowModelType
} from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "ag-grid-enterprise";
import { IOlympicData } from "./interfaces";

declare var FakeServer: any;

@Component({
  selector: "my-app",
  template: `<ag-grid-angular
    style="width: 100%; height: 100%;"
    class="ag-theme-alpine-dark"
    [columnDefs]="columnDefs"
    [defaultColDef]="defaultColDef"
    [autoGroupColumnDef]="autoGroupColumnDef"
    [rowModelType]="rowModelType"
    [cacheBlockSize]="cacheBlockSize"
    [animateRows]="true"
    [rowData]="rowData"
    (gridReady)="onGridReady($event)"
    [rowGroupPanelShow]="rowGroupPanelShow"
  ></ag-grid-angular> `
})
export class AppComponent {
  public columnDefs: ColDef[] = [
    { field: "country", rowGroup: true, hide: true },
    { field: "sport", rowGroup: true, hide: true },
    { field: "year", minWidth: 100 },
    { field: "gold", aggFunc: "sum", enableValue: true },
    { field: "silver", aggFunc: "sum", enableValue: true },
    { field: "bronze", aggFunc: "sum", enableValue: true }
  ];

  // possible options: 'never', 'always', 'onlyWhenGrouping'
  public rowGroupPanelShow = "always";

  public defaultColDef: ColDef = {
    flex: 1,
    minWidth: 120,
    resizable: true,
    sortable: true
  };
  public autoGroupColumnDef: ColDef = {
    flex: 1,
    minWidth: 280,
    field: "athlete"
  };
  public rowModelType: RowModelType = "serverSide";
  public cacheBlockSize = 5;
  public rowData!: IOlympicData[];

  constructor(private http: HttpClient) {}

  onGridReady(params: GridReadyEvent<IOlympicData>) {
    this.http
      .get<IOlympicData[]>(
        "https://www.ag-grid.com/example-assets/olympic-winners.json"
      )
      .subscribe((data) => {
        // setup the fake server with ENTIRE dataset
        var fakeServer = new FakeServer(data);
        // create datasource with a reference to the fake server
        var datasource = getServerSideDatasource(fakeServer);
        // register the datasource with the grid
        params.api!.setServerSideDatasource(datasource);
      });
  }
}

function getServerSideDatasource(server: any): IServerSideDatasource {
  return {
    getRows: (params) => {
      console.log("[Datasource] - rows requested by grid: ", params.request);
      var response = server.getData(params.request);
      // adding delay to simulate real server call
      setTimeout(function () {
        if (response.success) {
          // call the success callback
          // console.log("[Datasource] response:", response);
          params.success({
            rowData: response.rows,
            rowCount: response.lastRow
          });
        } else {
          // inform the grid request failed
          params.fail();
        }
      }, 1000);
    }
  };
}
