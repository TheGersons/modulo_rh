-- AlterTable
ALTER TABLE "KPI" ALTER COLUMN "operadorMeta" SET DEFAULT '>=';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "necesita_cambio_password" BOOLEAN NOT NULL DEFAULT false;
