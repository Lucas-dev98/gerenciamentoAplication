const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const PROJECTS_FILE = path.join(__dirname, 'projects.json');

class JSONProjectRepository {
  constructor() {
    this.ensureFileExists();
  }

  ensureFileExists() {
    if (!fs.existsSync(PROJECTS_FILE)) {
      fs.writeFileSync(PROJECTS_FILE, JSON.stringify([], null, 2));
    }
  }

  async findAll() {
    try {
      const data = fs.readFileSync(PROJECTS_FILE, 'utf8');
      const projects = JSON.parse(data);
      return projects.map((project) => ({
        ...project,
        _id: project._id || project.id,
        id: project._id || project.id,
      }));
    } catch (error) {
      logger.error('Error reading projects file:', error);
      return [];
    }
  }

  async findById(id) {
    const projects = await this.findAll();
    return projects.find((project) => project._id === id || project.id === id);
  }

  async create(projectData) {
    try {
      const projects = await this.findAll();
      const newProject = {
        ...projectData,
        _id: projectData._id || this.generateId(),
        id: projectData._id || projectData.id || this.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        team: projectData.team || [],
        tags: projectData.tags || [],
        progress: projectData.progress || 0,
        isActive:
          projectData.isActive !== undefined ? projectData.isActive : true,
        isOverdue: this.calculateIsOverdue(projectData.endDate),
        estimatedDuration: this.calculateDuration(
          projectData.startDate,
          projectData.endDate
        ),
      };

      projects.push(newProject);
      await this.saveProjects(projects);
      return newProject;
    } catch (error) {
      logger.error('Error creating project:', error);
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      const projects = await this.findAll();
      const index = projects.findIndex(
        (project) => project._id === id || project.id === id
      );

      if (index === -1) {
        throw new Error('Project not found');
      }

      projects[index] = {
        ...projects[index],
        ...updateData,
        _id: id,
        id: id,
        updatedAt: new Date().toISOString(),
        isOverdue: updateData.endDate
          ? this.calculateIsOverdue(updateData.endDate)
          : projects[index].isOverdue,
      };

      await this.saveProjects(projects);
      return projects[index];
    } catch (error) {
      logger.error('Error updating project:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const projects = await this.findAll();
      const filteredProjects = projects.filter(
        (project) => project._id !== id && project.id !== id
      );

      if (projects.length === filteredProjects.length) {
        throw new Error('Project not found');
      }

      await this.saveProjects(filteredProjects);
      return true;
    } catch (error) {
      logger.error('Error deleting project:', error);
      throw error;
    }
  }

  async saveProjects(projects) {
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
  }

  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  calculateIsOverdue(endDate) {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  }

  calculateDuration(startDate, endDate) {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} dias`;
  }
}

module.exports = JSONProjectRepository;
