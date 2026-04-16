import { Request, Response } from "express";
import { pool } from "../../config/db";
import { CitizenRequest } from "../../middleware/citizen-auth";

export const getLevels = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT * FROM levels ORDER BY level_number ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("getLevels error:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const getUserGamification = async (req: CitizenRequest, res: Response) => {
  const userId = (req.citizen?.id || req.params.userId) as string;
  
  try {
    const userResult = await pool.query(
      `SELECT id, name, email, points, streak, level, user_type, 
              total_collections, total_reports, valid_reports, weekly_streak_data
       FROM users WHERE id = $1`,
      [userId]
    );

    if (!userResult.rows[0]) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = userResult.rows[0];

    const currentLevelResult = await pool.query(
      "SELECT * FROM levels WHERE level_number = $1",
      [user.level]
    );

    const nextLevelResult = await pool.query(
      "SELECT * FROM levels WHERE level_number = $1",
      [user.level + 1]
    );

    const achievementsResult = await pool.query(
      `SELECT a.*, ua.unlocked_at 
       FROM achievements a
       LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = $1
       ORDER BY a.id`,
      [userId]
    );

    const collectionsResult = await pool.query(
      `SELECT DATE(collected_at) as date, COUNT(*) as count 
       FROM trash_collections 
       WHERE user_id = $1 AND collected_at >= NOW() - INTERVAL '7 days'
       GROUP BY DATE(collected_at)
       ORDER BY date`,
      [userId]
    );

    const pointsToNext = nextLevelResult.rows[0] 
      ? nextLevelResult.rows[0].points_required - user.points
      : 0;

    const progressToNext = nextLevelResult.rows[0]
      ? Math.min(100, ((user.points - (currentLevelResult.rows[0]?.points_required || 0)) / 
          (nextLevelResult.rows[0].points_required - (currentLevelResult.rows[0]?.points_required || 0)) * 100))
      : 100;

    const weeklyStreak = await calculateWeeklyStreak(userId);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        points: Number(user.points),
        streak: Number(user.streak),
        level: Number(user.level),
        user_type: user.user_type,
        total_collections: Number(user.total_collections || 0),
        total_reports: Number(user.total_reports || 0),
        valid_reports: Number(user.valid_reports || 0)
      },
      currentLevel: currentLevelResult.rows[0] || null,
      nextLevel: nextLevelResult.rows[0] || null,
      pointsToNextLevel: Math.max(0, pointsToNext),
      progressToNextLevel: Math.round(progressToNext),
      achievements: achievementsResult.rows.map(a => ({
        id: a.id,
        name: a.name,
        description: a.description,
        icon: a.icon,
        points_reward: Number(a.points_reward),
        unlocked: !!a.unlocked_at,
        unlocked_at: a.unlocked_at
      })),
      weeklyStreak,
      recentCollections: collectionsResult.rows
    });
  } catch (err) {
    console.error("getUserGamification error:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};

async function calculateWeeklyStreak(userId: string): Promise<{ day: string; completed: boolean }[]> {
  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const result = await pool.query(
    `SELECT DATE(collected_at) as date 
     FROM trash_collections 
     WHERE user_id = $1 
       AND collected_at >= NOW() - INTERVAL '7 days'
     GROUP BY DATE(collected_at)`,
    [userId]
  );

  const collectedDates = new Set(result.rows.map(r => r.date.toISOString().split('T')[0]));
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  return weekDays.map((name, index) => {
    const checkDate = new Date(monday);
    checkDate.setDate(monday.getDate() + index);
    const dateStr = checkDate.toISOString().split('T')[0];
    return { day: name, completed: collectedDates.has(dateStr) };
  });
}

export const registerTrashCollection = async (req: CitizenRequest, res: Response) => {
  const userId = req.citizen?.id;
  if (!userId) {
    return res.status(401).json({ message: "No autorizado" });
  }

  const { latitude, longitude } = req.body;
  const BASE_POINTS = 10;
  const STREAK_BONUS_MULTIPLIER = 0.1;

  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");

    const userResult = await client.query(
      "SELECT * FROM users WHERE id = $1",
      [userId]
    );
    const user = userResult.rows[0];

    const lastCollectionResult = await client.query(
      `SELECT * FROM trash_collections 
       WHERE user_id = $1 
       ORDER BY collected_at DESC 
       LIMIT 1`,
      [userId]
    );

    let streakBonus = 0;
    let newStreak = 1;

    if (lastCollectionResult.rows[0]) {
      const lastDate = new Date(lastCollectionResult.rows[0].collected_at);
      const today = new Date();
      const diffTime = today.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak = user.streak + 1;
        streakBonus = Math.floor(user.streak * STREAK_BONUS_MULTIPLIER);
      } else if (diffDays === 0) {
        newStreak = user.streak;
      }
    }

    const totalPoints = BASE_POINTS + streakBonus;

    await client.query(
      `INSERT INTO trash_collections (user_id, points_earned, location_lat, location_lng)
       VALUES ($1, $2, $3, $4)`,
      [userId, totalPoints, latitude || null, longitude || null]
    );

    const newTotalPoints = user.points + totalPoints;

    const levelsResult = await client.query(
      "SELECT * FROM levels WHERE points_required <= $1 ORDER BY level_number DESC LIMIT 1",
      [newTotalPoints]
    );
    const newLevel = levelsResult.rows[0]?.level_number || 1;

    await client.query(
      `UPDATE users 
       SET points = $1, 
           streak = $2, 
           level = $3,
           total_collections = COALESCE(total_collections, 0) + 1,
           weekly_streak_data = $4,
           updated_at = NOW()
       WHERE id = $5`,
      [newTotalPoints, newStreak, newLevel, JSON.stringify({ last_collection: new Date().toISOString() }), userId]
    );

    await checkAndAwardAchievements(client, userId, newStreak, user.total_collections + 1, user.valid_reports);

    await client.query("COMMIT");

    res.json({
      message: "Colección registrada exitosamente",
      pointsEarned: totalPoints,
      streakBonus,
      newStreak,
      newTotalPoints,
      newLevel
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("registerTrashCollection error:", err);
    res.status(500).json({ message: "Error del servidor" });
  } finally {
    client.release();
  }
};

async function checkAndAwardAchievements(client: any, userId: string, streak: number, collections: number, validReports: number) {
  const achievements = [
    { trigger: 'first_collection', value: 1, id: 1 },
    { trigger: 'streak_days', value: 7, id: 2 },
    { trigger: 'streak_days', value: 30, id: 3 },
    { trigger: 'valid_reports', value: 5, id: 4 },
    { trigger: 'total_collections', value: 100, id: 8 }
  ];

  for (const ach of achievements) {
    let shouldUnlock = false;
    
    switch (ach.trigger) {
      case 'first_collection':
        shouldUnlock = collections >= ach.value;
        break;
      case 'streak_days':
        shouldUnlock = streak >= ach.value;
        break;
      case 'valid_reports':
        shouldUnlock = validReports >= ach.value;
        break;
      case 'total_collections':
        shouldUnlock = collections >= ach.value;
        break;
    }

    if (shouldUnlock) {
      const existing = await client.query(
        "SELECT * FROM user_achievements WHERE user_id = $1 AND achievement_id = $2",
        [userId, ach.id]
      );

      if (!existing.rows[0]) {
        const rewardResult = await client.query(
          "SELECT points_reward FROM achievements WHERE id = $1",
          [ach.id]
        );
        const reward = rewardResult.rows[0]?.points_reward || 0;

        await client.query(
          "INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, $2)",
          [userId, ach.id]
        );

        await client.query(
          "UPDATE users SET points = points + $1 WHERE id = $2",
          [reward, userId]
        );
      }
    }
  }
}

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, name, points, streak, level, avatar_url
       FROM users 
       ORDER BY points DESC 
       LIMIT 20`
    );

    res.json(result.rows.map((u, index) => ({
      rank: index + 1,
      id: u.id,
      name: u.name,
      points: Number(u.points),
      streak: Number(u.streak),
      level: Number(u.level),
      avatar_url: u.avatar_url
    })));
  } catch (err) {
    console.error("getLeaderboard error:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const validateReport = async (req: Request, res: Response) => {
  const { reportId } = req.params;
  const { isValid, notes } = req.body;
  const adminId = (req as any).admin?.id;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const reportResult = await client.query(
      "SELECT * FROM reports WHERE id = $1",
      [reportId]
    );

    if (!reportResult.rows[0]) {
      return res.status(404).json({ message: "Reporte no encontrado" });
    }

    await client.query(
      `INSERT INTO report_validations (report_id, validated_by, is_valid, validation_notes)
       VALUES ($1, $2, $3, $4)`,
      [reportId, adminId, isValid, notes]
    );

    const userId = reportResult.rows[0].user_id;
    
    if (userId) {
      await client.query(
        "UPDATE users SET total_reports = COALESCE(total_reports, 0) + 1 WHERE id = $1",
        [userId]
      );

      if (isValid) {
        const reportReward = 5;
        
        await client.query(
          "UPDATE users SET valid_reports = COALESCE(valid_reports, 0) + 1, points = points + $1 WHERE id = $2",
          [reportReward, userId]
        );
      }
    }

    await client.query("COMMIT");

    res.json({ 
      message: isValid ? "Reporte validado como válido" : "Reporte marcado como inválido",
      pointsAwarded: isValid ? 5 : 0
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("validateReport error:", err);
    res.status(500).json({ message: "Error del servidor" });
  } finally {
    client.release();
  }
};

export const updateUserType = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { userType } = req.body;

  const validTypes = ['citizen', 'driver', 'collector'];
  
  if (!validTypes.includes(userType)) {
    return res.status(400).json({ message: "Tipo de usuario inválido" });
  }

  try {
    await pool.query(
      "UPDATE users SET user_type = $1, updated_at = NOW() WHERE id = $2",
      [userType, userId]
    );

    res.json({ message: "Tipo de usuario actualizado" });
  } catch (err) {
    console.error("updateUserType error:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const getUserCollections = async (req: CitizenRequest, res: Response) => {
  const userId = (req.citizen?.id || req.params.userId) as string;

  try {
    const result = await pool.query(
      `SELECT * FROM trash_collections 
       WHERE user_id = $1 
       ORDER BY collected_at DESC 
       LIMIT 30`,
      [userId]
    );

    res.json(result.rows.map(c => ({
      id: c.id,
      collectedAt: c.collected_at,
      pointsEarned: Number(c.points_earned),
      verified: c.verified,
      location: c.location_lat && c.location_lng 
        ? { lat: Number(c.location_lat), lng: Number(c.location_lng) }
        : null
    })));
  } catch (err) {
    console.error("getUserCollections error:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};