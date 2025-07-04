// Domain Repository Interface - Project Repository
class IProjectRepository {
  async findById(id) {
    throw new Error('Method not implemented');
  }

  async findAll() {
    throw new Error('Method not implemented');
  }

  async save(project) {
    throw new Error('Method not implemented');
  }

  async update(id, project) {
    throw new Error('Method not implemented');
  }

  async delete(id) {
    throw new Error('Method not implemented');
  }

  async findByStatus(status) {
    throw new Error('Method not implemented');
  }

  async findByPriority(priority) {
    throw new Error('Method not implemented');
  }
}

module.exports = IProjectRepository;
