-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "ambienceRating" INTEGER,
ADD COLUMN     "bestDish" TEXT,
ADD COLUMN     "cuisineTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "foodRating" INTEGER,
ADD COLUMN     "mealTimes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "mediaType" TEXT NOT NULL DEFAULT 'photo',
ADD COLUMN     "occasions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "priceRange" TEXT,
ADD COLUMN     "serviceRating" INTEGER,
ADD COLUMN     "tip" TEXT,
ADD COLUMN     "valueRating" INTEGER,
ADD COLUMN     "wouldReturn" TEXT;
