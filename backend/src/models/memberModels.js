const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    matricula: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    company: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    birthDate: {
      type: Date,
      required: true,
    },
    position: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      default: null,
    },
    workArea: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 100,
    },
    hireDate: {
      type: Date,
      default: Date.now,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual para calcular idade
memberSchema.virtual('age').get(function () {
  if (!this.birthDate) return null;
  const today = new Date();
  const birthDate = new Date(this.birthDate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
});

// Virtual para verificar se é aniversário hoje
memberSchema.virtual('isBirthdayToday').get(function () {
  if (!this.birthDate) return false;
  const today = new Date();
  const birthDate = new Date(this.birthDate);
  return (
    today.getMonth() === birthDate.getMonth() &&
    today.getDate() === birthDate.getDate()
  );
});

// Virtual para verificar se é aniversário este mês
memberSchema.virtual('isBirthdayThisMonth').get(function () {
  if (!this.birthDate) return false;
  const today = new Date();
  const birthDate = new Date(this.birthDate);
  return today.getMonth() === birthDate.getMonth();
});

// Virtual para dias até o próximo aniversário
memberSchema.virtual('daysUntilBirthday').get(function () {
  if (!this.birthDate) return null;
  const today = new Date();
  const birthDate = new Date(this.birthDate);
  const thisYear = today.getFullYear();

  let nextBirthday = new Date(
    thisYear,
    birthDate.getMonth(),
    birthDate.getDate()
  );

  if (nextBirthday < today) {
    nextBirthday = new Date(
      thisYear + 1,
      birthDate.getMonth(),
      birthDate.getDate()
    );
  }

  const diffTime = nextBirthday - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Índices
memberSchema.index({ team: 1, isActive: 1 });
memberSchema.index({ matricula: 1 }, { unique: true });
memberSchema.index({ supervisor: 1 });
memberSchema.index({ birthDate: 1 });
memberSchema.index({ company: 1 });
memberSchema.index({ workArea: 1 });

// Middleware para atualizar nível hierárquico
memberSchema.pre('save', async function (next) {
  if (this.isModified('supervisor') || this.isNew) {
    if (this.supervisor) {
      const supervisor = await this.constructor.findById(this.supervisor);
      if (supervisor) {
        this.level = supervisor.level + 1;
      }
    } else {
      this.level = 1; // Nível raiz
    }
  }
  next();
});

// Método estático para buscar aniversariantes do mês
memberSchema.statics.getBirthdaysThisMonth = function () {
  const today = new Date();
  const month = today.getMonth();

  return this.aggregate([
    {
      $match: {
        isActive: true,
        $expr: {
          $eq: [{ $month: '$birthDate' }, month + 1], // MongoDB months are 1-indexed
        },
      },
    },
    {
      $addFields: {
        dayOfBirth: { $dayOfMonth: '$birthDate' },
        monthOfBirth: { $month: '$birthDate' },
        age: {
          $subtract: [today.getFullYear(), { $year: '$birthDate' }],
        },
      },
    },
    {
      $sort: { dayOfBirth: 1 },
    },
    {
      $lookup: {
        from: 'teams',
        localField: 'team',
        foreignField: '_id',
        as: 'teamInfo',
      },
    },
    {
      $unwind: {
        path: '$teamInfo',
        preserveNullAndEmptyArrays: true,
      },
    },
  ]);
};

// Método para buscar subordinados
memberSchema.methods.getSubordinates = function () {
  return this.constructor.find({ supervisor: this._id, isActive: true });
};

// Método para buscar hierarquia completa
memberSchema.methods.getHierarchy = async function () {
  const subordinates = await this.getSubordinates();
  const hierarchy = [];

  for (const subordinate of subordinates) {
    const subHierarchy = await subordinate.getHierarchy();
    hierarchy.push({
      ...subordinate.toObject(),
      subordinates: subHierarchy,
    });
  }

  return hierarchy;
};

module.exports = mongoose.model('Member', memberSchema);
