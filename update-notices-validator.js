// MongoDB migration script to update notices collection validator
// This script updates the notices collection validator to match the model

print('🔧 Updating notices collection validator...');

// Switch to the epu_gestao database
db = db.getSiblingDB('epu_gestao');

// Update the notices collection validator
db.runCommand({
  collMod: 'notices',
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'content'],
      properties: {
        title: {
          bsonType: 'string',
          minLength: 3,
          maxLength: 200,
          description: 'Title must be between 3-200 characters',
        },
        content: {
          bsonType: 'string',
          minLength: 10,
          maxLength: 5000,
          description: 'Content must be between 10-5000 characters',
        },
        type: {
          enum: ['info', 'warning', 'urgent', 'announcement', 'maintenance'],
          description: 'Type must be one of the allowed notice types',
        },
        priority: {
          enum: ['low', 'medium', 'high', 'critical'],
          description: 'Priority must be one of the allowed priority levels',
        },
      },
    },
  },
});

print('✅ Notices collection validator updated successfully');
