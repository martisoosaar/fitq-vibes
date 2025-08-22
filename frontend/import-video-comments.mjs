import { PrismaClient } from '@prisma/client'
import mysql from 'mysql2/promise'

const prisma = new PrismaClient()

async function importVideoComments() {
  try {
    // Connect to legacy database
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: 'M1nupar007',
      database: 'fitq_legacy'
    })

    console.log('📝 Starting video comments import...')

    // Get all comments (excluding deleted ones)
    const [comments] = await connection.execute(`
      SELECT * FROM video_comments 
      WHERE deleted_at IS NULL 
      ORDER BY created_at ASC
    `)

    console.log(`Found ${comments.length} comments to import`)

    // Import comments
    let successCount = 0
    let errorCount = 0

    for (const comment of comments) {
      try {
        // Check if video and user exist in new database
        const videoExists = await prisma.video.findUnique({
          where: { id: comment.video_id }
        })

        const userExists = await prisma.user.findUnique({
          where: { id: comment.user_id }
        })

        if (!videoExists || !userExists) {
          console.log(`⚠️ Skipping comment ${comment.id} - video or user not found`)
          errorCount++
          continue
        }

        // Create comment
        await prisma.videoComment.create({
          data: {
            id: comment.id,
            videoId: comment.video_id,
            userId: comment.user_id,
            parentId: comment.parent_id,
            content: comment.content,
            createdAt: new Date(comment.created_at),
            updatedAt: new Date(comment.updated_at),
            deletedAt: comment.deleted_at ? new Date(comment.deleted_at) : null
          }
        })

        successCount++
        if (successCount % 100 === 0) {
          console.log(`✅ Imported ${successCount} comments...`)
        }
      } catch (error) {
        console.log(`❌ Error importing comment ${comment.id}:`, error.message)
        errorCount++
      }
    }

    console.log('\n📊 Importing comment likes...')

    // Import comment likes
    const [likes] = await connection.execute(`
      SELECT * FROM video_comment_likes 
      WHERE deleted_at IS NULL
    `)

    console.log(`Found ${likes.length} likes to import`)

    let likesSuccess = 0
    let likesError = 0

    for (const like of likes) {
      try {
        // Check if comment and user exist
        const commentExists = await prisma.videoComment.findUnique({
          where: { id: like.video_comment_id }
        })

        const userExists = await prisma.user.findUnique({
          where: { id: like.user_id }
        })

        if (!commentExists || !userExists) {
          likesError++
          continue
        }

        // Create like
        await prisma.videoCommentLike.create({
          data: {
            userId: like.user_id,
            commentId: like.video_comment_id,
            createdAt: like.created_at ? new Date(like.created_at) : new Date(),
            updatedAt: like.updated_at ? new Date(like.updated_at) : new Date()
          }
        })

        likesSuccess++
        if (likesSuccess % 100 === 0) {
          console.log(`✅ Imported ${likesSuccess} likes...`)
        }
      } catch (error) {
        // Likely duplicate, skip silently
        likesError++
      }
    }

    console.log('\n=== Import Summary ===')
    console.log(`✅ Comments imported: ${successCount}`)
    console.log(`❌ Comments failed: ${errorCount}`)
    console.log(`✅ Likes imported: ${likesSuccess}`)
    console.log(`❌ Likes failed: ${likesError}`)

    // Get some statistics
    const commentStats = await prisma.videoComment.groupBy({
      by: ['videoId'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    })

    console.log('\n📊 Top 5 most commented videos:')
    for (const stat of commentStats) {
      const video = await prisma.video.findUnique({
        where: { id: stat.videoId },
        select: { title: true }
      })
      console.log(`   ${video.title}: ${stat._count.id} comments`)
    }

    await connection.end()

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importVideoComments()