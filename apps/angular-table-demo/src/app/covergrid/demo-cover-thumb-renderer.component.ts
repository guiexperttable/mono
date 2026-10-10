import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ComponentRendererIf } from '@guiexpert/angular-table';
import { AreaIdent, AreaModelIf, RendererCleanupFnType } from '@guiexpert/table';

@Component({
  selector: 'demo-cover-grid-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `

    <div
      class="thumb-div"
      [style.padding-top.px]="rowIndex===0 ? 64 : 0"
      [style.height.px]="300"
      [style.width.px]="200">
      @if (value) {
      <a
        href="javascript:void(0)">
        <div class="img-outer-div">
          <img
            class="thumb-img"
            [src]="value"
            [alt]="value"
            [title]="value"
            [style.height.px]="300"
            [style.width.px]="200">
        </div>
      </a>
      }
    </div>

  `,
  styles: [`

    .thumb-div {
      display: inline-block;

      a {
        .img-outer-div {
          background-color: transparent;
          overflow: hidden;

          img {
            cursor: pointer;
            transition: transform .5s ease;
          }

          &:hover img {
            transform: scale(1.3);
          }
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DemoCoverGridRendererComponent implements ComponentRendererIf<string> {
  @Input() value: string = '';

  rowIndex: number = 0;


  constructor(
    private cdr: ChangeDetectorRef
  ) {
  }

  setData(
    rowIndex: number,
    columnIndex: number,
    areaIdent: AreaIdent,
    areaModel: AreaModelIf,
    cellValue: any): RendererCleanupFnType | undefined {

    this.rowIndex = rowIndex;
    this.value = cellValue;

    this.cdr.markForCheck();
    return undefined;
  }

}
