import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsIn, IsOptional, IsArray, ValidateNested } from 'class-validator';


class DetalleRevisionDto {
    @IsString()
    @IsNotEmpty()
    kpiId: string;

    @IsString()
    @IsNotEmpty()
    kpiNombre: string;

    @IsString()
    @IsNotEmpty()
    motivo: string;
}
export class CreateValidacionDto {
    @IsString()
    @IsNotEmpty()
    evaluacionId: string;

    @IsString()
    @IsNotEmpty()
    empleadoId: string;

    @IsString()
    @IsNotEmpty()
    @IsIn(['aceptada', 'revision_solicitada'])
    status: string;

    @IsString()
    @IsOptional()
    motivoRevision?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DetalleRevisionDto)
    @IsOptional()
    detallesRevision?: DetalleRevisionDto[];

    @IsArray()
    @IsOptional()
    archivosAdjuntos?: string[]; // URLs de los archivos
}