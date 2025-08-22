import mysql from 'mysql2/promise'
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function importUserProfiles() {
  console.log('Starting user profile import...')
  
  // Connect to legacy database
  const legacyConnection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'M1nupar007',
    database: 'fitq_legacy'
  })

  try {
    // Get all users from legacy database
    const [users] = await legacyConnection.execute(`
      SELECT 
        id,
        email,
        name,
        birthday,
        sex,
        height,
        weight,
        country,
        timezone,
        weekly_news,
        monthly_news,
        profile_desc,
        profile_pic,
        avatar,
        external_avatar,
        agora_id,
        biography_image,
        display_on_trainers_list,
        email_verified_at,
        facebook_id,
        google_id,
        gymwolf_session,
        language_id,
        last_login,
        link_og_image,
        notifications,
        remember_token,
        role_id,
        show_intro,
        simple_link,
        sport_id_assess_token,
        sport_id_email,
        sport_id_id,
        sport_id_refresh_token,
        total_video_views,
        trainer_channel_image,
        trainer_iframe_intro,
        trainer_notification,
        trainer_unlocked,
        trainer_welcome_desc,
        trainer_welcome_title,
        trial_end,
        user_credit,
        user_first_buy,
        user_invited_by,
        user_language,
        utm_data,
        wallet
      FROM users
      ORDER BY id
    `)

    console.log(`Found ${users.length} users to update`)

    let updated = 0
    let skipped = 0
    let errors = 0

    for (const user of users) {
      try {
        // Check if user exists in new database
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email }
        })

        if (!existingUser) {
          console.log(`Skipping user ${user.email} - doesn't exist in new database`)
          skipped++
          continue
        }

        // Prepare update data
        const updateData = {
          name: user.name || existingUser.name,
          birthday: user.birthday ? new Date(user.birthday) : null,
          sex: user.sex || null,
          height: user.height || null,
          weight: user.weight || null,
          country: user.country || null,
          timezone: user.timezone || null,
          weeklyNews: user.weekly_news || 1,
          monthlyNews: user.monthly_news || 1,
          profileDesc: user.profile_desc || null,
          profilePic: user.profile_pic || null,
          avatar: user.avatar || 'users/default.png',
          externalAvatar: user.external_avatar || null,
          agoraId: user.agora_id || null,
          biographyImage: user.biography_image || null,
          commentEmailNotifications: 1, // Field doesn't exist in legacy
          displayOnTrainersList: user.display_on_trainers_list || 0,
          emailVerifiedAt: user.email_verified_at ? new Date(user.email_verified_at) : null,
          facebookId: user.facebook_id || null,
          feePercentage: 0, // Field doesn't exist in legacy
          getresponseTags: null, // Field doesn't exist in legacy
          googleId: user.google_id || null,
          gymwolfSession: user.gymwolf_session || null,
          hideNameFromLeaderboards: null, // Field doesn't exist in legacy
          languageId: user.language_id || 1,
          lastLogin: user.last_login ? new Date(user.last_login) : null,
          linkOgImage: user.link_og_image || null,
          notifications: user.notifications || null,
          programUnitInfoEmailNotifications: 1, // Field doesn't exist in legacy
          rememberToken: user.remember_token || null,
          roleId: user.role_id || null,
          showIntro: user.show_intro || 1,
          simpleLink: user.simple_link || null,
          sportIdAssessToken: user.sport_id_assess_token || null,
          sportIdEmail: user.sport_id_email || null,
          sportIdId: user.sport_id_id || null,
          sportIdRefreshToken: user.sport_id_refresh_token || null,
          totalVideoViews: user.total_video_views || 0,
          trainerChannelImage: user.trainer_channel_image || null,
          trainerIframeIntro: user.trainer_iframe_intro || null,
          trainerNotification: user.trainer_notification || null,
          trainerUnlocked: user.trainer_unlocked || null,
          trainerWelcomeDesc: user.trainer_welcome_desc || null,
          trainerWelcomeTitle: user.trainer_welcome_title || null,
          trialEnd: user.trial_end || null,
          userCredit: user.user_credit || 0,
          userFirstBuy: user.user_first_buy || 0,
          userInvitedBy: user.user_invited_by || 0,
          userLanguage: user.user_language || null,
          utmData: user.utm_data || null,
          wallet: user.wallet || 0
        }

        // Update user
        await prisma.user.update({
          where: { email: user.email },
          data: updateData
        })

        updated++
        if (updated % 10 === 0) {
          console.log(`Updated ${updated} users...`)
        }
      } catch (error) {
        console.error(`Error updating user ${user.email}:`, error.message)
        errors++
      }
    }

    console.log('\n=== Import Complete ===')
    console.log(`Updated: ${updated} users`)
    console.log(`Skipped: ${skipped} users (not found in new database)`)
    console.log(`Errors: ${errors} users`)

  } catch (error) {
    console.error('Import failed:', error)
  } finally {
    await legacyConnection.end()
    await prisma.$disconnect()
  }
}

importUserProfiles()