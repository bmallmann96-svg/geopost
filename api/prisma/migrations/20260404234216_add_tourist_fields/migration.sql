-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "accessibilityRating" INTEGER,
ADD COLUMN     "attractionTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "bestSeason" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "bestTimeOfDay" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "conservationRating" INTEGER,
ADD COLUMN     "crowdLevel" TEXT,
ADD COLUMN     "experienceRating" INTEGER,
ADD COLUMN     "howToGetThere" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "mustSee" TEXT,
ADD COLUMN     "petsAllowed" TEXT,
ADD COLUMN     "touristTip" TEXT,
ADD COLUMN     "visitDuration" TEXT,
ADD COLUMN     "wheelchairAccess" TEXT;
