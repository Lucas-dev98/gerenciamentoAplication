const { MongoClient } = require('mongodb');

async function checkExistingProjects() {
  const client = new MongoClient('mongodb://localhost:27017');

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('epu_gestao');
    const projects = await db.collection('projects').find({}).toArray();
    const users = await db.collection('users').find({}).toArray();

    console.log(`\n📊 Database Status:`);
    console.log(`- Projects: ${projects.length}`);
    console.log(`- Users: ${users.length}`);

    if (projects.length > 0) {
      console.log('\n📝 Existing Projects:');
      projects.forEach((project, index) => {
        console.log(
          `${index + 1}. ${project.name || 'Unnamed'} (ID: ${project._id})`
        );
        console.log(`   Workers: ${project.workersCount || 0}`);
        console.log(`   Status: ${project.status || 'N/A'}`);
        console.log(`   Created: ${project.createdAt || 'N/A'}`);
        console.log('');
      });
    }

    if (users.length > 0) {
      console.log('\n👤 Existing Users:');
      users.forEach((user, index) => {
        console.log(
          `${index + 1}. ${user.username || 'No username'} - ${user.email || 'No email'}`
        );
      });
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await client.close();
  }
}

checkExistingProjects();
