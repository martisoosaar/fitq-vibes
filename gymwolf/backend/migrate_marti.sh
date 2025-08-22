#!/bin/bash

# Migrate specific users with all their data
echo "Migrating Marti's accounts and all workout data..."

# Create SQL to get specific users and their workouts
mysql -u root -pM1nupar007 gymwolf -e "
SELECT 'Found users:' as info;
SELECT id, email, name FROM user WHERE id IN (65899, 58241, 66387);

SELECT 'Workout counts:' as info;
SELECT u.email, COUNT(w.id) as workout_count 
FROM user u 
LEFT JOIN workout w ON u.id = w.user_id 
WHERE u.id IN (65899, 58241, 66387) 
GROUP BY u.id;

SELECT 'Cardio workout counts:' as info;
SELECT u.email, COUNT(cw.id) as cardio_count 
FROM user u 
LEFT JOIN cardio_workout cw ON u.id = cw.user_id 
WHERE u.id IN (65899, 58241, 66387) 
GROUP BY u.id;
"

# Run migration for these specific users
php artisan gymwolf:migrate --limit=100000

echo "Migration complete! Check the results:"
php artisan tinker --execute="
    \$users = \App\Models\User::whereIn('email', ['marti@fitq.studio', 'marti@firmasport.ee', 'marti.soosaar@gmail.com'])->get();
    foreach(\$users as \$user) {
        echo 'User: ' . \$user->email . ' - Workouts: ' . \$user->workouts()->count() . PHP_EOL;
    }
"