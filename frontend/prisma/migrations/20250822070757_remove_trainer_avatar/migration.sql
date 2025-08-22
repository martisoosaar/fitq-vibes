/*
  Warnings:

  - You are about to drop the column `avatar` on the `Trainer` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `trainerUnlocked` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Video` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `Video` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Video` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Video` DROP FOREIGN KEY `Video_trainerId_fkey`;

-- AlterTable
ALTER TABLE `Trainer` DROP COLUMN `avatar`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `password`,
    DROP COLUMN `trainerUnlocked`,
    ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `isAdmin` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `trainer_unlocked` TINYINT NULL;

-- AlterTable
ALTER TABLE `Video` DROP COLUMN `category`,
    DROP COLUMN `image`,
    ADD COLUMN `availableFrom` DATETIME(0) NULL,
    ADD COLUMN `availableUntil` DATETIME(0) NULL,
    ADD COLUMN `categoryId` INTEGER NOT NULL,
    ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `description` TEXT NOT NULL,
    ADD COLUMN `endTime` DATETIME(0) NULL,
    ADD COLUMN `energyConsumption` INTEGER NULL DEFAULT 0,
    ADD COLUMN `equipment` TEXT NULL,
    ADD COLUMN `hidden` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `hiddenHash` VARCHAR(255) NULL,
    ADD COLUMN `iframe` TEXT NULL,
    ADD COLUMN `keywords` TEXT NULL,
    ADD COLUMN `languageId` INTEGER NULL,
    ADD COLUMN `live` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `onDemand` BOOLEAN NULL DEFAULT true,
    ADD COLUMN `openForFree` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `openForSubscribers` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `openForTickets` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `playbackUrl` TEXT NULL,
    ADD COLUMN `recommend` TINYINT NULL,
    ADD COLUMN `recordId` VARCHAR(255) NULL,
    ADD COLUMN `reportedBad` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `singleTicketPrice` FLOAT NULL DEFAULT 0,
    ADD COLUMN `startTime` DATETIME(0) NULL,
    ADD COLUMN `unlisted` VARCHAR(255) NULL,
    ADD COLUMN `userId` INTEGER NOT NULL,
    ADD COLUMN `videoDeleted` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `videoForChallenge` INTEGER NULL DEFAULT 0,
    ADD COLUMN `videoLanguage` VARCHAR(255) NULL,
    ADD COLUMN `videoPlatform` TEXT NULL,
    ADD COLUMN `videoPreview` TEXT NULL,
    ADD COLUMN `videoPreviewExternal` TEXT NULL,
    ADD COLUMN `videoTest` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `views` INTEGER NULL DEFAULT 0,
    ADD COLUMN `vimeoId` VARCHAR(255) NULL,
    MODIFY `title` TEXT NOT NULL,
    MODIFY `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateTable
CREATE TABLE `user_follows` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `followerId` INTEGER NOT NULL,
    `followingId` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `user_follows_followerId_idx`(`followerId`),
    INDEX `user_follows_followingId_idx`(`followingId`),
    UNIQUE INDEX `user_follows_followerId_followingId_key`(`followerId`, `followingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `data` JSON NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_notifications_userId_isRead_idx`(`userId`, `isRead`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trainer_testimonials` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `trainerId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` TEXT NOT NULL,
    `isApproved` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `trainer_testimonials_trainerId_isApproved_idx`(`trainerId`, `isApproved`),
    INDEX `trainer_testimonials_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trainer_social_links` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `facebook_link` TEXT NULL,
    `youtube_link` TEXT NULL,
    `instagram_link` TEXT NULL,
    `tiktok_link` TEXT NULL,
    `twitter_link` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `trainer_social_links_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Language` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `languageName` VARCHAR(191) NOT NULL,
    `languageNative` VARCHAR(191) NULL,
    `languageAbbr` VARCHAR(191) NOT NULL,
    `languageFlag` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Language_languageAbbr_key`(`languageAbbr`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VideoCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `image` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `video_trainers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `videoId` INTEGER NOT NULL,
    `trainerId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `video_trainers_videoId_idx`(`videoId`),
    INDEX `video_trainers_trainerId_idx`(`trainerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VideoView` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `videoId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `trainerId` INTEGER NULL,
    `watchTimeSeconds` INTEGER NOT NULL DEFAULT 0,
    `playheadPosition` DOUBLE NOT NULL DEFAULT 0,
    `stillWatching` BOOLEAN NOT NULL DEFAULT true,
    `caloriesBurned` INTEGER NULL,
    `paid` BOOLEAN NOT NULL DEFAULT false,
    `userCash` DOUBLE NOT NULL DEFAULT 0.000,
    `trainerCash` DOUBLE NOT NULL DEFAULT 0.000,
    `currentlyWatchingLive` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `videoId`(`videoId`),
    INDEX `userId`(`userId`),
    INDEX `trainerId`(`trainerId`),
    INDEX `stillWatching`(`stillWatching`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `impersonation_tokens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(255) NOT NULL,
    `admin_id` INTEGER NOT NULL,
    `impersonated_id` INTEGER NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `used_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `impersonation_tokens_token_key`(`token`),
    INDEX `impersonation_tokens_token_idx`(`token`),
    INDEX `impersonation_tokens_admin_id_idx`(`admin_id`),
    INDEX `impersonation_tokens_impersonated_id_idx`(`impersonated_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `video_music_copyrights` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `video_id` INTEGER NOT NULL,
    `title` VARCHAR(128) NOT NULL,
    `artist` VARCHAR(128) NOT NULL,
    `data` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `video_music_copyrights_video_id_idx`(`video_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VideoComment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `videoId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `parentId` INTEGER NULL,
    `content` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `VideoComment_videoId_fkey`(`videoId`),
    INDEX `VideoComment_userId_fkey`(`userId`),
    INDEX `VideoComment_parentId_fkey`(`parentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VideoCommentLike` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `commentId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `VideoCommentLike_commentId_fkey`(`commentId`),
    INDEX `VideoCommentLike_userId_fkey`(`userId`),
    UNIQUE INDEX `VideoCommentLike_userId_commentId_key`(`userId`, `commentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `challenges` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `image` VARCHAR(500) NOT NULL,
    `content` TEXT NOT NULL,
    `slides` TEXT NOT NULL,
    `includes` TEXT NOT NULL,
    `commune` TEXT NOT NULL,
    `type` VARCHAR(255) NULL,
    `isSubscriptionNeeded` TINYINT NOT NULL DEFAULT 0,
    `path` VARCHAR(255) NULL,
    `beginDate` TIMESTAMP(0) NULL,
    `endDate` TIMESTAMP(0) NULL,
    `userId` INTEGER NULL,
    `minTeam` INTEGER NULL,
    `maxTeam` INTEGER NULL,
    `challengeVisible` TINYINT NOT NULL DEFAULT 1,
    `createdAt` TIMESTAMP(0) NULL,
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedAt` TIMESTAMP(0) NULL,

    INDEX `challenges_userId_idx`(`userId`),
    INDEX `challenges_challengeVisible_idx`(`challengeVisible`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trainer_programs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `trainerId` INTEGER NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `shortDescription` TEXT NOT NULL,
    `description` TEXT NOT NULL,
    `picture` VARCHAR(500) NULL,
    `urlSlug` VARCHAR(255) NULL,
    `faq` TEXT NULL,
    `unitLength` VARCHAR(16) NOT NULL DEFAULT 'DAY',
    `unitVisibility` VARCHAR(255) NOT NULL DEFAULT 'VISIBLE_AFTER_PREVIOUS',
    `languageId` TINYINT NOT NULL,
    `status` VARCHAR(16) NOT NULL DEFAULT 'DRAFT',
    `commentsEnabled` BOOLEAN NOT NULL DEFAULT false,
    `feedbackEnabled` BOOLEAN NOT NULL DEFAULT false,
    `intro_video_id` INTEGER NULL,
    `createdAt` TIMESTAMP(0) NULL,
    `updatedAt` TIMESTAMP(0) NULL,
    `deletedAt` TIMESTAMP(0) NULL,

    INDEX `trainer_programs_trainerId_idx`(`trainerId`),
    INDEX `trainer_programs_status_idx`(`status`),
    INDEX `trainer_programs_intro_video_id_idx`(`intro_video_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trainer_program_units` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `programId` BIGINT NOT NULL,
    `order` INTEGER NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `status` VARCHAR(255) NOT NULL DEFAULT 'DRAFT',
    `createdAt` TIMESTAMP(0) NULL,
    `updatedAt` TIMESTAMP(0) NULL,
    `deletedAt` TIMESTAMP(0) NULL,

    INDEX `trainer_program_units_programId_idx`(`programId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trainer_program_unit_video_materials` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `unitId` BIGINT NOT NULL,
    `videoId` INTEGER NOT NULL,
    `createdAt` TIMESTAMP(0) NULL,
    `updatedAt` TIMESTAMP(0) NULL,
    `deletedAt` TIMESTAMP(0) NULL,

    INDEX `trainer_program_unit_video_materials_unitId_idx`(`unitId`),
    INDEX `trainer_program_unit_video_materials_videoId_idx`(`videoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trainer_program_unit_text_tasks` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `unitId` BIGINT NOT NULL,
    `order` INTEGER NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `createdAt` TIMESTAMP(0) NULL,
    `updatedAt` TIMESTAMP(0) NULL,
    `deletedAt` TIMESTAMP(0) NULL,

    INDEX `trainer_program_unit_text_tasks_unitId_idx`(`unitId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trainer_program_unit_video_tasks` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `unitId` BIGINT NOT NULL,
    `videoId` INTEGER NOT NULL,
    `order` INTEGER NULL,
    `createdAt` TIMESTAMP(0) NULL,
    `updatedAt` TIMESTAMP(0) NULL,
    `deletedAt` TIMESTAMP(0) NULL,

    INDEX `trainer_program_unit_video_tasks_unitId_idx`(`unitId`),
    INDEX `trainer_program_unit_video_tasks_videoId_idx`(`videoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trainer_program_unit_files` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `unitId` BIGINT NOT NULL,
    `order` INTEGER NULL,
    `title` VARCHAR(255) NOT NULL,
    `file` VARCHAR(500) NOT NULL,
    `createdAt` TIMESTAMP(0) NULL,
    `updatedAt` TIMESTAMP(0) NULL,
    `deletedAt` TIMESTAMP(0) NULL,

    INDEX `trainer_program_unit_files_unitId_idx`(`unitId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trainer_program_unit_workout_template_tasks` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `unitId` BIGINT NOT NULL,
    `order` INTEGER NULL,
    `title` VARCHAR(255) NOT NULL,
    `workoutTemplateId` INTEGER NOT NULL,
    `createdAt` TIMESTAMP(0) NULL,
    `updatedAt` TIMESTAMP(0) NULL,
    `deletedAt` TIMESTAMP(0) NULL,

    INDEX `trainer_program_unit_workout_template_tasks_unitId_idx`(`unitId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trainer_program_unit_cardio_template_tasks` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `unitId` BIGINT NOT NULL,
    `order` INTEGER NULL,
    `title` VARCHAR(255) NOT NULL,
    `cardioTemplateId` INTEGER NOT NULL,
    `createdAt` TIMESTAMP(0) NULL,
    `updatedAt` TIMESTAMP(0) NULL,
    `deletedAt` TIMESTAMP(0) NULL,

    INDEX `trainer_program_unit_cardio_template_tasks_unitId_idx`(`unitId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trainer_program_users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `programId` BIGINT NOT NULL,
    `userId` INTEGER NOT NULL,
    `startDate` DATE NULL,
    `status` VARCHAR(16) NOT NULL DEFAULT 'ACTIVE',
    `currentUnit` INTEGER NULL,
    `createdAt` TIMESTAMP(0) NULL,
    `updatedAt` TIMESTAMP(0) NULL,
    `deletedAt` TIMESTAMP(0) NULL,

    INDEX `trainer_program_users_programId_idx`(`programId`),
    INDEX `trainer_program_users_userId_idx`(`userId`),
    UNIQUE INDEX `trainer_program_users_programId_userId_key`(`programId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trainer_program_user_unit_done` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `programUserId` BIGINT NOT NULL,
    `unitId` BIGINT NOT NULL,
    `completedAt` TIMESTAMP(0) NULL,
    `createdAt` TIMESTAMP(0) NULL,
    `updatedAt` TIMESTAMP(0) NULL,

    INDEX `trainer_program_user_unit_done_programUserId_idx`(`programUserId`),
    INDEX `trainer_program_user_unit_done_unitId_idx`(`unitId`),
    UNIQUE INDEX `trainer_program_user_unit_done_programUserId_unitId_key`(`programUserId`, `unitId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trainer_program_user_tasks_done` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `programUserId` BIGINT NOT NULL,
    `taskType` VARCHAR(50) NOT NULL,
    `taskId` BIGINT NOT NULL,
    `workoutId` INTEGER NULL,
    `completedAt` TIMESTAMP(0) NULL,
    `createdAt` TIMESTAMP(0) NULL,
    `updatedAt` TIMESTAMP(0) NULL,

    INDEX `trainer_program_user_tasks_done_programUserId_idx`(`programUserId`),
    INDEX `trainer_program_user_tasks_done_taskType_taskId_idx`(`taskType`, `taskId`),
    UNIQUE INDEX `trainer_program_user_tasks_done_programUserId_taskType_taskI_key`(`programUserId`, `taskType`, `taskId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `categoryId` ON `Video`(`categoryId`);

-- CreateIndex
CREATE INDEX `userId` ON `Video`(`userId`);

-- CreateIndex
CREATE INDEX `languageId` ON `Video`(`languageId`);

-- AddForeignKey
ALTER TABLE `user_follows` ADD CONSTRAINT `user_follows_followerId_fkey` FOREIGN KEY (`followerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_follows` ADD CONSTRAINT `user_follows_followingId_fkey` FOREIGN KEY (`followingId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_notifications` ADD CONSTRAINT `user_notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trainer_testimonials` ADD CONSTRAINT `trainer_testimonials_trainerId_fkey` FOREIGN KEY (`trainerId`) REFERENCES `Trainer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trainer_testimonials` ADD CONSTRAINT `trainer_testimonials_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trainer_social_links` ADD CONSTRAINT `trainer_social_links_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Trainer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `video_trainers` ADD CONSTRAINT `video_trainers_videoId_fkey` FOREIGN KEY (`videoId`) REFERENCES `Video`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `video_trainers` ADD CONSTRAINT `video_trainers_trainerId_fkey` FOREIGN KEY (`trainerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Video` ADD CONSTRAINT `video_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Video` ADD CONSTRAINT `video_ibfk_2` FOREIGN KEY (`categoryId`) REFERENCES `VideoCategory`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Video` ADD CONSTRAINT `video_ibfk_3` FOREIGN KEY (`trainerId`) REFERENCES `Trainer`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Video` ADD CONSTRAINT `video_ibfk_4` FOREIGN KEY (`languageId`) REFERENCES `Language`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `VideoView` ADD CONSTRAINT `VideoView_videoId_fkey` FOREIGN KEY (`videoId`) REFERENCES `Video`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VideoView` ADD CONSTRAINT `VideoView_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VideoView` ADD CONSTRAINT `VideoView_trainerId_fkey` FOREIGN KEY (`trainerId`) REFERENCES `Trainer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `impersonation_tokens` ADD CONSTRAINT `impersonation_tokens_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `impersonation_tokens` ADD CONSTRAINT `impersonation_tokens_impersonated_id_fkey` FOREIGN KEY (`impersonated_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `video_music_copyrights` ADD CONSTRAINT `video_music_copyrights_video_id_fkey` FOREIGN KEY (`video_id`) REFERENCES `Video`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VideoComment` ADD CONSTRAINT `VideoComment_videoId_fkey` FOREIGN KEY (`videoId`) REFERENCES `Video`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VideoComment` ADD CONSTRAINT `VideoComment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VideoComment` ADD CONSTRAINT `VideoComment_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `VideoComment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VideoCommentLike` ADD CONSTRAINT `VideoCommentLike_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VideoCommentLike` ADD CONSTRAINT `VideoCommentLike_commentId_fkey` FOREIGN KEY (`commentId`) REFERENCES `VideoComment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `challenges` ADD CONSTRAINT `challenges_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trainer_programs` ADD CONSTRAINT `trainer_programs_trainerId_fkey` FOREIGN KEY (`trainerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trainer_programs` ADD CONSTRAINT `trainer_programs_intro_video_id_fkey` FOREIGN KEY (`intro_video_id`) REFERENCES `Video`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trainer_program_units` ADD CONSTRAINT `trainer_program_units_programId_fkey` FOREIGN KEY (`programId`) REFERENCES `trainer_programs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trainer_program_unit_video_materials` ADD CONSTRAINT `trainer_program_unit_video_materials_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `trainer_program_units`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trainer_program_unit_video_materials` ADD CONSTRAINT `trainer_program_unit_video_materials_videoId_fkey` FOREIGN KEY (`videoId`) REFERENCES `Video`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trainer_program_unit_text_tasks` ADD CONSTRAINT `trainer_program_unit_text_tasks_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `trainer_program_units`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trainer_program_unit_video_tasks` ADD CONSTRAINT `trainer_program_unit_video_tasks_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `trainer_program_units`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trainer_program_unit_video_tasks` ADD CONSTRAINT `trainer_program_unit_video_tasks_videoId_fkey` FOREIGN KEY (`videoId`) REFERENCES `Video`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trainer_program_unit_files` ADD CONSTRAINT `trainer_program_unit_files_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `trainer_program_units`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trainer_program_unit_workout_template_tasks` ADD CONSTRAINT `trainer_program_unit_workout_template_tasks_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `trainer_program_units`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trainer_program_unit_cardio_template_tasks` ADD CONSTRAINT `trainer_program_unit_cardio_template_tasks_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `trainer_program_units`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trainer_program_users` ADD CONSTRAINT `trainer_program_users_programId_fkey` FOREIGN KEY (`programId`) REFERENCES `trainer_programs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trainer_program_users` ADD CONSTRAINT `trainer_program_users_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trainer_program_user_unit_done` ADD CONSTRAINT `trainer_program_user_unit_done_programUserId_fkey` FOREIGN KEY (`programUserId`) REFERENCES `trainer_program_users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trainer_program_user_unit_done` ADD CONSTRAINT `trainer_program_user_unit_done_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `trainer_program_units`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trainer_program_user_tasks_done` ADD CONSTRAINT `trainer_program_user_tasks_done_programUserId_fkey` FOREIGN KEY (`programUserId`) REFERENCES `trainer_program_users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trainer_program_user_tasks_done` ADD CONSTRAINT `trainer_program_user_tasks_done_textTaskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `trainer_program_unit_text_tasks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trainer_program_user_tasks_done` ADD CONSTRAINT `trainer_program_user_tasks_done_videoTaskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `trainer_program_unit_video_tasks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trainer_program_user_tasks_done` ADD CONSTRAINT `trainer_program_user_tasks_done_workoutTaskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `trainer_program_unit_workout_template_tasks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trainer_program_user_tasks_done` ADD CONSTRAINT `trainer_program_user_tasks_done_cardioTaskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `trainer_program_unit_cardio_template_tasks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `Video` RENAME INDEX `Video_trainerId_fkey` TO `trainerId`;
