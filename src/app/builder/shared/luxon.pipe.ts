import { Pipe, PipeTransform } from "@angular/core";
import { DateTime } from "luxon";
@Pipe({
  name: "dateTimeFormat",
})
export class LuxonDateTimeFormat implements PipeTransform {
  transform(value: DateTime, format: string): string {
    return value.toFormat(format);
  }
}
