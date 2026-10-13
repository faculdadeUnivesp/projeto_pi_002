import { IsDateString, IsNotEmpty } from 'class-validator';

export class RelatorioVendasDto {
  @IsNotEmpty()
  @IsDateString()
  dataInicio: string;

  @IsNotEmpty()
  @IsDateString()
  dataFim: string;
}