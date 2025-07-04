// Debug script to check mock data structure
const { mockProjectData } = require('./backend/src/config/mockData');

console.log('🔍 Estrutura do mockProjectData:');
console.log('Keys:', Object.keys(mockProjectData));

if (mockProjectData.projects) {
  console.log('📁 projects array length:', mockProjectData.projects.length);
  if (mockProjectData.projects[0]) {
    console.log(
      '📄 First project keys:',
      Object.keys(mockProjectData.projects[0])
    );
    if (mockProjectData.projects[0].csvData) {
      console.log(
        '📊 csvData keys:',
        Object.keys(mockProjectData.projects[0].csvData)
      );
    } else {
      console.log('❌ csvData not found in first project');
    }
  }
}

if (mockProjectData.csvData) {
  console.log('📊 Direct csvData keys:', Object.keys(mockProjectData.csvData));
} else {
  console.log('❌ No direct csvData in mockProjectData');
}
