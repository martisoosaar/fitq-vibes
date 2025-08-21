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

  // Get missing users who have videos
  const [missingUsers] = await legacyConnection.execute(`
    SELECT DISTINCT u.* 
    FROM videos v 
    JOIN users u ON v.user_id = u.id 
    WHERE v.video_deleted = 0 
    AND v.user_id NOT IN (SELECT id FROM fitqvibes.User)
    ORDER BY u.id
  `) as any[]

  console.log(`Found ${missingUsers.length} missing users to migrate`)

  let successCount = 0
  let errorCount = 0

  for (const user of missingUsers) {
    try {
      // Check if email already exists (with different ID)
      if (user.email) {
        const existing = await prisma.user.findUnique({
          where: { email: user.email }
        })
        
        if (existing) {
          console.log(`User ${user.id} email ${user.email} already exists with ID ${existing.id}`)
          errorCount++
          continue
        }
      }

      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email || `user${user.id}@fitq.local`, // Generate email if missing
          name: user.name || null,
          avatar: user.avatar || 'users/default.png',
          externalAvatar: user.external_avatar,
          profileDesc: user.profile_desc,
          birthday: user.birthday ? new Date(user.birthday) : null,
          sex: user.sex,
          height: user.height,
          weight: user.weight,
          profilePic: user.profile_pic,
          userLanguage: user.user_language,
          emailVerifiedAt: user.email_verified_at ? new Date(user.email_verified_at) : null,
          languageId: user.language_id || 1,
          weeklyNews: user.weekly_news || 1,
          monthlyNews: user.monthly_news || 1,
          notifications: user.notifications,
          facebookId: user.facebook_id,
          googleId: user.google_id,
          sportIdId: user.sport_id_id,
          sportIdEmail: user.sport_id_email,
          gymwolfSession: user.gymwolf_session,
          agoraId: user.agora_id,
          utmData: user.utm_data,
          country: user.country,
          timezone: user.timezone,
          trialEnd: user.trial_end,
          lastLogin: user.last_login ? new Date(user.last_login) : null,
          simpleLink: user.simple_link,
          linkOgImage: user.link_og_image,
          wallet: user.wallet?.toString() || '0.00000',
          userCredit: user.user_credit || 0,
          userInvitedBy: user.user_invited_by || 0,
          userFirstBuy: user.user_first_buy || 0,
          totalVideoViews: user.total_video_views || 0,
          hideNameFromLeaderboards: user.hide_name_from_leaderboards,
          commentEmailNotifications: user.comment_email_notifications || 1,
          programUnitInfoEmailNotifications: user.program_unit_info_email_notifications || 1,
          getresponseTags: user.getresponse_tags,
          roleId: user.role_id,
          trainerUnlocked: user.trainer_unlocked,
          displayOnTrainersList: user.display_on_trainers_list || 0,
          trainerWelcomeTitle: user.trainer_welcome_title,
          trainerWelcomeDesc: user.trainer_welcome_desc,
          trainerChannelImage: user.trainer_channel_image,
          biographyImage: user.biography_image,
          trainerIframeIntro: user.trainer_iframe_intro,
          showIntro: user.show_intro,
          trainerNotification: user.trainer_notification,
          feePercentage: user.fee_percentage,
          sportIdRefreshToken: user.sport_id_refresh_token,
          sportIdAssessToken: user.sport_id_assess_token,
          rememberToken: user.remember_token,
          createdAt: user.created_at ? new Date(user.created_at) : new Date(),
          updatedAt: user.updated_at ? new Date(user.updated_at) : new Date()
        }
      })
      
      successCount++
      console.log(`Migrated user ${user.id}: ${user.name || user.email || 'No name'}`)
      
      // Also create trainer record if needed
      if (user.trainer_unlocked === 1) {
        const slug = user.simple_link || 
                    user.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 
                    `trainer-${user.id}`
        
        try {
          await prisma.trainer.create({
            data: {
              id: user.id,
              slug: slug,
              name: user.name || `Trainer ${user.id}`,
              avatar: user.avatar || null,
              videosCount: 0,
              videoViews: user.total_video_views || 0
            }
          })
          console.log(`Created trainer record for user ${user.id}`)
        } catch (e: any) {
          if (!e.message.includes('Unique constraint')) {
            console.error(`Failed to create trainer for user ${user.id}: ${e.message}`)
          }
        }
      }
    } catch (error: any) {
      console.error(`Failed to migrate user ${user.id}: ${error.message}`)
      errorCount++
    }
  }

  console.log(`Migration completed! ${successCount} users migrated, ${errorCount} errors`)

  // Close connections
  await legacyConnection.end()
  await prisma.$disconnect()
}

main()
  .catch((e) => {
    console.error('Migration failed:', e)
    process.exit(1)
  })