import { PrismaClient } from '@prisma/client'
import mysql from 'mysql2/promise'

const prisma = new PrismaClient()

async function main() {
  // Connect to legacy database
  const legacyConnection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'M1nupar007',
    database: 'fitq_legacy'
  })

  console.log('Connected to legacy database')

  // Get all users from legacy database
  const [users] = await legacyConnection.execute(`
    SELECT 
      id,
      role_id,
      name,
      profile_desc,
      trainer_welcome_title,
      trainer_welcome_desc,
      email,
      avatar,
      external_avatar,
      trainer_channel_image,
      biography_image,
      trainer_iframe_intro,
      show_intro,
      password,
      birthday,
      sex,
      height,
      weight,
      profile_pic,
      user_language,
      trainer_unlocked,
      display_on_trainers_list,
      remember_token,
      email_verified_at,
      language_id,
      weekly_news,
      monthly_news,
      notifications,
      trainer_notification,
      facebook_id,
      google_id,
      sport_id_id,
      sport_id_email,
      sport_id_refresh_token,
      sport_id_assess_token,
      gymwolf_session,
      agora_id,
      utm_data,
      country,
      timezone,
      trial_end,
      last_login,
      simple_link,
      link_og_image,
      wallet,
      user_credit,
      user_invited_by,
      user_first_buy,
      total_video_views,
      fee_percentage,
      hide_name_from_leaderboards,
      comment_email_notifications,
      program_unit_info_email_notifications,
      getresponse_tags,
      created_at,
      updated_at
    FROM users
    WHERE email IS NOT NULL AND email != ''
    ORDER BY id
  `) as any[]

  console.log(`Found ${users.length} users to migrate`)

  // Clear existing users (except test users)
  await prisma.user.deleteMany({
    where: {
      email: {
        notIn: ['test@example.com'] // Keep any test users
      }
    }
  })

  console.log('Cleared existing users')

  // Migrate users in batches
  const batchSize = 100
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize)
    
    const usersToCreate = batch.map((user: any) => {
      return {
        id: user.id,
        email: user.email.toLowerCase(),
        name: user.name || null,
        avatar: user.avatar || 'users/default.png',
        externalAvatar: user.external_avatar || null,
        profileDesc: user.profile_desc || null,
        birthday: user.birthday ? new Date(user.birthday) : null,
        sex: user.sex || null,
        height: user.height || null,
        weight: user.weight || null,
        profilePic: user.profile_pic || null,
        userLanguage: user.user_language || null,
        emailVerifiedAt: user.email_verified_at ? new Date(user.email_verified_at) : null,
        languageId: user.language_id || 1,
        weeklyNews: user.weekly_news || 1,
        monthlyNews: user.monthly_news || 1,
        notifications: user.notifications || null,
        facebookId: user.facebook_id || null,
        googleId: user.google_id || null,
        sportIdId: user.sport_id_id || null,
        sportIdEmail: user.sport_id_email || null,
        gymwolfSession: user.gymwolf_session || null,
        agoraId: user.agora_id || null,
        utmData: user.utm_data || null,
        country: user.country || null,
        timezone: user.timezone || null,
        trialEnd: user.trial_end || null,
        lastLogin: user.last_login ? new Date(user.last_login) : null,
        simpleLink: user.simple_link || null,
        linkOgImage: user.link_og_image || null,
        wallet: user.wallet || 0,
        userCredit: user.user_credit || 0,
        userInvitedBy: user.user_invited_by || 0,
        userFirstBuy: user.user_first_buy || 0,
        totalVideoViews: user.total_video_views || 0,
        hideNameFromLeaderboards: user.hide_name_from_leaderboards || null,
        commentEmailNotifications: user.comment_email_notifications || 1,
        programUnitInfoEmailNotifications: user.program_unit_info_email_notifications || 1,
        getresponseTags: user.getresponse_tags || null,
        
        // Trainer specific fields
        roleId: user.role_id || null,
        trainerUnlocked: user.trainer_unlocked || null,
        displayOnTrainersList: user.display_on_trainers_list || 0,
        trainerWelcomeTitle: user.trainer_welcome_title || null,
        trainerWelcomeDesc: user.trainer_welcome_desc || null,
        trainerChannelImage: user.trainer_channel_image || null,
        biographyImage: user.biography_image || null,
        trainerIframeIntro: user.trainer_iframe_intro || null,
        showIntro: user.show_intro || 1,
        trainerNotification: user.trainer_notification || null,
        feePercentage: user.fee_percentage || 0,
        
        // OAuth tokens
        sportIdRefreshToken: user.sport_id_refresh_token || null,
        sportIdAssessToken: user.sport_id_assess_token || null,
        
        rememberToken: user.remember_token || null,
        createdAt: user.created_at ? new Date(user.created_at) : new Date(),
        updatedAt: user.updated_at ? new Date(user.updated_at) : new Date()
      }
    })

    // Create users
    await prisma.user.createMany({
      data: usersToCreate,
      skipDuplicates: true
    })

    console.log(`Migrated ${i + batch.length} / ${users.length} users`)
  }

  // Reset auto increment to continue from highest ID
  const maxId = Math.max(...users.map((u: any) => u.id))
  await prisma.$executeRawUnsafe(`ALTER TABLE User AUTO_INCREMENT = ${maxId + 1}`)

  console.log('Migration completed successfully!')

  // Close connections
  await legacyConnection.end()
  await prisma.$disconnect()
}

main()
  .catch((e) => {
    console.error('Migration failed:', e)
    process.exit(1)
  })