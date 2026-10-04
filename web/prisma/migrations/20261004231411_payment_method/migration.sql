-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'TRANSFER', 'CARD');

-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CARD';

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CARD';
