# Gymwolf 2.0

Modern fitness tracking application built with Laravel backend and Next.js frontend.

## 🚀 Project Structure

```
/new
├── /backend         # Laravel 11 API
│   ├── /app        # Application logic
│   ├── /database   # Migrations & seeders
│   ├── /routes     # API routes
│   └── /tests      # Tests
└── /frontend        # Next.js 14 (to be created)
    ├── /app        # App router pages
    ├── /components # React components
    └── /lib        # Utilities
```

## 📦 Tech Stack

### Backend
- **Laravel 11** - PHP framework
- **MySQL 8.0** - Database
- **Redis** - Cache & queues
- **JWT** - Authentication (to be added)

### Frontend (Coming Soon)
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Query** - Data fetching

## 🛠️ Setup Instructions

### Backend Setup

1. **Database**
   - Database `gymwolf2` is already created
   - Migrations are already run

2. **Start the server**
   ```bash
   cd backend
   php artisan serve --port=8001
   ```

3. **Access the API**
   - Base URL: `http://localhost:8001`
   - API endpoints: `http://localhost:8001/api/v2/*`

### Database Structure

#### Core Tables
- `users` - User accounts
- `user_profiles` - Extended user information
- `workouts` - Workout sessions
- `workout_segments` - Combined workout parts (strength, cardio, etc.)
- `exercises` - Exercise database
- `workout_exercises` - Exercises in workouts
- `exercise_sets` - Individual sets

#### Key Features
- ✅ **Combined Workouts** - Mix cardio, strength, mobility in one workout
- ✅ **Workout Segments** - Organize workout into different parts
- ✅ **Flexible Sets** - Track weight, reps, distance, duration, RPE
- ✅ **Templates** - Create reusable workout plans
- ✅ **Supersets** - Link exercises together

## 🔧 Development

### Laravel Commands
```bash
# Run migrations
php artisan migrate

# Create controller
php artisan make:controller Api/WorkoutController

# Create request validation
php artisan make:request WorkoutRequest

# Clear cache
php artisan cache:clear

# Run tests
php artisan test
```

### API Structure
```
/api/v2
├── /auth          # Authentication endpoints
├── /workouts      # Workout CRUD
├── /exercises     # Exercise database
├── /templates     # Workout templates
└── /analytics     # Progress tracking
```

## 📝 TODO

### Backend
- [ ] Add JWT authentication
- [ ] Create API controllers
- [ ] Add request validation
- [ ] Setup API resources
- [ ] Add tests
- [ ] Setup queues for heavy tasks

### Frontend
- [ ] Setup Next.js project
- [ ] Create authentication flow
- [ ] Build workout tracker
- [ ] Add exercise browser
- [ ] Create analytics dashboard
- [ ] Make it PWA

### DevOps
- [ ] Docker setup
- [ ] CI/CD pipeline
- [ ] Production deployment

## 🔄 Migration from Old System

The old Gymwolf system data can be migrated using the migration scripts (to be created).

### Key Improvements
1. **Combined workouts** - No more separate cardio/strength
2. **Modern tech stack** - Latest Laravel & Next.js
3. **Better performance** - Optimized queries, caching
4. **Mobile first** - Responsive design
5. **Real-time updates** - WebSocket support (future)

## 📚 Documentation

- [Laravel Documentation](https://laravel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [API Documentation](./backend/docs/api.md) (to be created)

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Write tests
4. Submit PR

## 📄 License

Private project - All rights reserved