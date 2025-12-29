export default {
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://pokemon_user:dev_password_123@localhost:5432/pokemon_timeline',
  },
};
