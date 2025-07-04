const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    department: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    color: {
      type: String,
      default: '#3498db',
      trim: true,
    },
    budget: {
      type: Number,
      default: 0,
    },
    goals: [
      {
        title: {
          type: String,
          required: true,
          maxlength: 200,
        },
        description: {
          type: String,
          maxlength: 500,
        },
        deadline: Date,
        completed: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    stats: {
      totalMembers: {
        type: Number,
        default: 0,
      },
      activeMembers: {
        type: Number,
        default: 0,
      },
      birthdaysThisMonth: {
        type: Number,
        default: 0,
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual para contar membros ativos
teamSchema.virtual('memberCount', {
  ref: 'Member',
  localField: '_id',
  foreignField: 'team',
  count: true,
  match: { isActive: true },
});

// Virtual para buscar todos os membros
teamSchema.virtual('members', {
  ref: 'Member',
  localField: '_id',
  foreignField: 'team',
  match: { isActive: true },
});

// Índices
teamSchema.index({ name: 1 });
teamSchema.index({ department: 1 });
teamSchema.index({ isActive: 1 });
teamSchema.index({ createdBy: 1 });

// Método para atualizar estatísticas
teamSchema.methods.updateStats = async function () {
  const Member = mongoose.model('Member');

  const stats = await Member.aggregate([
    {
      $match: {
        team: this._id,
      },
    },
    {
      $group: {
        _id: null,
        totalMembers: { $sum: 1 },
        activeMembers: {
          $sum: {
            $cond: [{ $eq: ['$isActive', true] }, 1, 0],
          },
        },
        birthdaysThisMonth: {
          $sum: {
            $cond: [
              {
                $eq: [{ $month: '$birthDate' }, { $month: new Date() }],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  if (stats.length > 0) {
    this.stats = {
      ...stats[0],
      lastUpdated: new Date(),
    };
    await this.save();
  }

  return this.stats;
};

// Método para buscar organograma completo
teamSchema.methods.getOrganChart = async function () {
  const Member = mongoose.model('Member');

  // Buscar todos os membros da equipe
  const members = await Member.find({
    team: this._id,
    isActive: true,
  }).populate('supervisor', 'name position');

  // Separar líderes (sem supervisor) dos subordinados
  const leaders = members.filter((member) => !member.supervisor);
  const subordinates = members.filter((member) => member.supervisor);

  // Construir hierarquia
  const buildHierarchy = (leaderId) => {
    const directReports = subordinates.filter(
      (sub) =>
        sub.supervisor && sub.supervisor._id.toString() === leaderId.toString()
    );

    return directReports.map((member) => ({
      ...member.toObject(),
      subordinates: buildHierarchy(member._id),
    }));
  };

  // Montar organograma completo
  const organChart = leaders.map((leader) => ({
    ...leader.toObject(),
    subordinates: buildHierarchy(leader._id),
  }));

  return organChart;
};

// Método para buscar aniversariantes da equipe no mês
teamSchema.methods.getBirthdaysThisMonth = async function () {
  const Member = mongoose.model('Member');
  const today = new Date();
  const month = today.getMonth();

  return Member.find({
    team: this._id,
    isActive: true,
    $expr: {
      $eq: [{ $month: '$birthDate' }, month + 1],
    },
  }).sort({
    $expr: { $dayOfMonth: '$birthDate' },
  });
};

// Middleware para atualizar stats antes de salvar
teamSchema.pre('save', function (next) {
  if (this.isModified('members') || this.isNew) {
    // Atualizar timestamp das stats
    this.stats.lastUpdated = new Date();
  }
  next();
});

// Método estático para buscar equipes com estatísticas
teamSchema.statics.findWithStats = function (filter = {}) {
  return this.find(filter)
    .populate('manager', 'name position')
    .populate('createdBy', 'username email')
    .populate({
      path: 'memberCount',
    });
};

module.exports = mongoose.model('Team', teamSchema);
