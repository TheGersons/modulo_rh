import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { KpisService } from './kpis.service';
import { CreateKpiDto } from './dto/create-kpi.dto';
import { UpdateKpiDto } from './dto/update-kpi.dto';
import { CalcularKpiDto } from './dto/calcular-kpi.dto';

@Controller('kpis')
export class KpisController {
  constructor(private readonly kpisService: KpisService) {}

  @Post()
  create(@Body() createKpiDto: CreateKpiDto) {
    return this.kpisService.create(createKpiDto);
  }

  @Get()
  findAll(
    @Query('areaId') areaId?: string,
    @Query('puesto') puesto?: string,
    @Query('activo') activo?: string,
    @Query('tipoCriticidad') tipoCriticidad?: string,
  ) {
    return this.kpisService.findAll({
      areaId,
      puesto,
      activo: activo === 'true' ? true : activo === 'false' ? false : undefined,
      tipoCriticidad,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kpisService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateKpiDto: UpdateKpiDto) {
    return this.kpisService.update(id, updateKpiDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.kpisService.remove(id);
  }

  @Patch(':id/toggle')
  toggle(@Param('id') id: string) {
    return this.kpisService.toggle(id);
  }

  @Post('calcular')
  calcular(@Body() calcularDto: CalcularKpiDto) {
    return this.kpisService.calcularResultado(calcularDto);
  }

  @Post('validar-formula')
  validarFormula(
    @Body() body: { formulaCalculo: string; tipoCalculo: string },
  ) {
    return this.kpisService.validarFormula(
      body.formulaCalculo,
      body.tipoCalculo,
    );
  }
}
