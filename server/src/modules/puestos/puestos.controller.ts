import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { PuestosService } from './puestos.service';
import { CreatePuestoDto } from './dto/create-puesto.dto';
import { UpdatePuestoDto } from './dto/update-puesto.dto';

@Controller('puestos')
export class PuestosController {
  constructor(private readonly puestosService: PuestosService) {}

  @Get()
  findAll(@Query('areaId') areaId?: string) {
    return this.puestosService.findAll(areaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.puestosService.findOne(id);
  }

  @Post()
  create(@Body() createPuestoDto: CreatePuestoDto) {
    return this.puestosService.create(createPuestoDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updatePuestoDto: UpdatePuestoDto) {
    return this.puestosService.update(id, updatePuestoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.puestosService.remove(id);
  }
}
